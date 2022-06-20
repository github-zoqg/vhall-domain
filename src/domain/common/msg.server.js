import useRoomBaseServer from '@/domain/room/roombase.server.js';
import { isPc, merge, randomNumGenerator } from '@/utils/index.js';
import BaseServer from './base.server';
import VhallPaasSDK from '@/sdk/index.js';
import useGroupServer from '../group/StandardGroupServer';
import useMediaCheckServer from '../media/mediaCheck.server';
class MsgServer extends BaseServer {
  constructor() {
    if (typeof MsgServer.instance === 'object') {
      return MsgServer.instance;
    }
    super();
    this.msgInstance = null; //主房间消息实例
    this.groupMsgInstance = null; //子房间消息实例
    this.curMsgInstance = null; //当前所在的房间实例
    this.state = {
      msgSdkInitOptions: {},
      groupMsgSdkInitOptions: {}
    };
    this.EVENT_TYPE = {
      CHANNEL_CHANGE: 'CHANNEL_CHANGE'
    };
    this.listenEvents();
    MsgServer.instance = this;
    return this;
  }

  _eventhandlers = {
    ROOM_MSG: [], // 房间消息
    CHAT: [], // 聊天消息
    CUSTOM_MSG: [], // 自定义消息
    OFFLINE: [], // 断开连接
    ONLINE: [], // 连接成功
    DOC_MSG: [], // 文档消息
    JOIN: [], // 加入房间
    LEFT: [] // 离开房间
  };

  // 回放状态下，观看端只能收到以下类型的房间消息
  _roomMsgWhiteListInPlayback = [
    'gift_send_success', // 礼物赠送成功消息
    'reward_pay_ok', // 打赏成功消息
    'base_num_update', // 虚拟人数消息
    'question_answer_create', // 创建问答
    'question_answer_commit', // 回复问答
    'question_answer_backout', // 撤回问答
    'pay_success' // 支付成功
  ]

  listenEvents() {
    this.$onMsg('ROOM_MSG', msg => {
      const { join_info } = useRoomBaseServer().state.watchInitData
      // 结束直播或在小组中结束直播，需要销毁socket，并且只有观众会销毁
      if (join_info.role_name == 2 && (msg.data.type == 'live_over' || (msg.data.type == 'group_switch_end' && msg.data.over_live === 1))) {
        this.destroy();
        this.destroyGroupMsg();
      }

      switch (msg.data.type) {
        // 踢出房间消息，销毁socket
        case 'room_kickout':
          if (msg.data.target_id == join_info.third_party_user_id) {
            this.destroy();
            this.destroyGroupMsg();
          }
          break;
        //结束直播
        case 'live_over':
          this.$emit('live_over')
          break;
      }
    });
  }
  async init() {
    await this.initMaintMsg();
    const { groupInitData } = useGroupServer().state;
    if (groupInitData.isInGroup) {
      await this.initGroupMsg();
    }
  }
  // 初始化主房间聊天sdk
  async initMaintMsg(customOptions = {}) {
    const defaultOptions = this.getDefaultOptions();
    const options = merge.recursive({}, defaultOptions, customOptions);
    console.log('聊天初始化参数', options);
    this.state.msgSdkInitOptions = options;
    window.VhallPaasSDK = VhallPaasSDK
    const vhallchat = await VhallPaasSDK.modules.VhallChat.createInstance(options);
    this.msgInstance = vhallchat.message;
    console.log('主房间消息实例', this.msgInstance);
    this.changeChannel(this.msgInstance);
    this._addListeners(this.msgInstance);
  }
  async initGroupMsg(customOptions = {}) {
    //如果已存在子房间先销毁
    const defautlGroupOptions = this.getGroupDefaultOptions();
    const options = merge.recursive({}, defautlGroupOptions, customOptions);
    this.state.groupMsgSdkInitOptions = options;
    //创建pass消息房间实例
    const vhallchat = await VhallPaasSDK.modules.VhallChat.createInstance(options);
    this.groupMsgInstance = vhallchat.message;
    this.changeChannel(this.groupMsgInstance);
    this._addListeners(this.groupMsgInstance);
  }
  changeChannel(istance) {
    this.curMsgInstance = istance;
    //对外通知切换房间
    this.$emit(this.EVENT_TYPE.CHANNEL_CHANGE);
  }
  // 注册事件
  $onMsg(eventType, fn) {
    if (this._eventhandlers[eventType]) {
      this._eventhandlers[eventType].push(fn);
    } else {
      this._eventhandlers[eventType] = [];
      this._eventhandlers[eventType].push(fn);
    }
  }

  _handlePaasInstanceOn(instance, eventType, fn) {
    const cb = msg => {
      if (!msg) {
        return;
      }
      // 房间消息统一parse
      try {
        if (msg && typeof msg === 'string') {
          msg = JSON.parse(msg);
        }
        if (msg && msg.context && typeof msg.context === 'string') {
          msg.context = JSON.parse(msg.context);
        }
        if (msg && msg.data && typeof msg.data === 'string') {
          msg.data = JSON.parse(msg.data);
        }
      } catch (ex) {
        console.log('消息转换错误：', ex);
        return;
      }
      console.log('msg消息', eventType, msg.data.type, msg);
      //判断房间id 该消息属于当前所在房间才处理回调
      if (this.curMsgInstance.channelId == msg.channel) {
        try {
          fn(msg);
        } catch (e) {
          console.error(e)
        }
      }
    };
    // 'room';
    // 'custom'
    switch (eventType) {
      //房间消息
      case 'ROOM_MSG':
        instance.onRoomMsg(cb); // 这个小写的字符串是跟微吼云沟通添加的，现在房间消息还没有常量
        break;
      //聊天消息
      case 'CHAT':
        instance.on(cb);
        break;
      case 'JOIN':
        instance.join(cb);
        break;
      case 'JOIN_ANY':
        // instance.on(VhallChat.EVENTS.JOIN_ANY, fn);
        break;
      case 'LEFT':
        instance.leave(cb);
        break;
      case 'LEFT_ANY':
        // instance.on(VhallChat.EVENTS.LEFT_ANY, fn);
        break;
      case 'KICK':
        // instance.on(VhallChat.EVENTS.KICK, fn);
        break;
      //自定义消息
      case 'CUSTOM_MSG':
        instance.onCustomMsg(cb)
      // case 'MUTE':
      //   instance.on(VhallChat.EVENTS.MUTE, fn);
      //   break;
      // case 'UNMUTE':
      //   instance.on(VhallChat.EVENTS.UNMUTE, fn);
      //   break;
      // case 'SUPER_ALLOW':
      //   instance.on(VhallChat.EVENTS.SUPER_ALLOW, fn);
      //   break;
      // case 'UNSUPER_ALLOW':
      //   instance.on(VhallChat.EVENTS.UNSUPER_ALLOW, fn);
      //   break;
      // case 'MUTE_ALL':
      //   instance.on(VhallChat.EVENTS.MUTE_ALL, fn);
      //   break;
      // case 'UNMUTE_ALL':
      //   instance.on(VhallChat.EVENTS.UNMUTE_ALL, fn);
      //   break;
      case 'OFFLINE':
        instance.onOffLine(cb);
        break;
      case 'ONLINE':
        instance.onOnLine(cb);
        break;
      // case 'GROUP_NEW':
      // instance.on(VhallChat.EVENTS.GROUP_NEW, fn);
      // break;
      // case 'GROUP_DISSOLVE':
      // instance.on(VhallChat.EVENTS.GROUP_DISSOLVE, fn);
      // break;
      //文档消息
      case 'DocMsg':
        instance.onDocMsg(cb);
      default:
        instance.onCustomMsg(cb);
    }
  }

  // 注销事件
  $offMsg(eventType, fn) {
    if (!this._eventhandlers[eventType]) {
      return new Error('该消息未注册');
    }

    if (!fn) {
      this._eventhandlers[eventType] = [];
      // this._handlePaasInstanceOff(eventType);
      return;
    }

    const index = this._eventhandlers[eventType].indexOf(fn);
    if (index > -1) {
      this._eventhandlers[eventType].splice(index, 1);
      // this._handlePaasInstanceOff(eventType, fn);
    }
  }

  // paas实例注销事件
  // _handlePaasInstanceOff(eventType, fn) {
  //   if (this.groupMsgInstance) {
  //     this.groupMsgInstance.off(eventType, fn);
  //   } else {
  //     this.msgInstance.off(eventType, fn);
  //   }
  // }

  // 为聊天实例注册事件
  _addListeners(instance) {
    for (let eventType in this._eventhandlers) {
      this._handlePaasInstanceOn(instance, eventType, msg => {
        // 回放状态，房间消息白名单
        const { watchInitData } = useRoomBaseServer().state
        if (eventType == 'ROOM_MSG' && watchInitData?.join_info?.role_name == 2 && watchInitData?.webinar?.type == 5 && this._roomMsgWhiteListInPlayback.indexOf(msg.data.type) == -1) {
          return
        }
        if (this._eventhandlers[eventType].length) {
          this._eventhandlers[eventType].forEach(handler => {
            handler(msg);
          });
        }
      });
    }
  }

  // 为聊天实例注销事件
  _removeListeners(instance) {
    for (let eventType in this._eventhandlers) {
      instance.off(eventType);
    }
  }

  // 发送聊天消息
  sendChatMsg(data, context) {
    this.curMsgInstance.emit(data, context);
  }

  // 发送当前房间消息
  sendRoomMsg(data) {
    this.curMsgInstance.emitRoomMsg(data);
  }
  //发送主房间消息
  sendMainRoomMsg(data) {
    this.msgInstance.emitRoomMsg(data);
  }
  //发送自定义消息
  sendCustomMsg(data) {
    this.curMsgInstance.emitCustomMsg(data);
  }
  // 获取主房间聊天sdk初始化默认参数
  // TODO:根据中台实际需要，更改context
  getDefaultOptions() {
    const { state: roomBaseServerState } = useRoomBaseServer();
    const isPcClient = isPc();
    const { watchInitData, interactToolStatus = {} } = roomBaseServerState;
    const { groupInitData } = useGroupServer().state;
    // debugger
    const defaultContext = {
      nickname: watchInitData.join_info.nickname,
      avatar: watchInitData.join_info.avatar,
      pv: watchInitData.pv && (watchInitData.pv.num2 ?? watchInitData.pv.real), // pv
      uv: watchInitData.online && (watchInitData.online.num || watchInitData.online.virtual),
      role_name: watchInitData.join_info.role_name,
      device_type: this.isMobileDevice() ? 1 : 2, // 设备类型 1手机端 2PC 0未检测
      device_status: useMediaCheckServer().state.deviceInfo.device_status == 2 ? 2 : 1, // 设备状态  0未检测 1可以上麦 2不可以上麦
      audience: roomBaseServerState.clientType !== 'send',
      kick_id: sessionStorage.getItem('kickId') || '', // 如果为null传空字符串是为了解决ios客户端崩溃的问题。客户端升级6.4.0版本之后，该字段将无须前端再做兼容
      kick_mark: `${randomNumGenerator()}${watchInitData.webinar.id}`,
      is_banned: interactToolStatus.is_banned,
      privacies: watchInitData.join_info.privacies || '',
      groupInitData//只代表刚进入直播时小组状态，不代表实时小组状态
    };

    const defaultOptions = {
      context: defaultContext,
      appId: watchInitData.interact.paas_app_id,
      accountId: watchInitData.join_info.third_party_user_id,
      channelId: watchInitData.interact.channel_id,
      token: watchInitData.interact.paas_access_token,
      hide: false // 是否隐身
    };

    return defaultOptions;
  }
  // 获取子房间聊天sdk初始化默认参数
  // TODO:根据中台实际需要，调整context
  getGroupDefaultOptions() {
    const { state: roomBaseServerState } = useRoomBaseServer();
    const isPcClient = isPc();
    const { watchInitData, interactToolStatus = {} } = roomBaseServerState;
    const { groupInitData } = useGroupServer().state;
    const defaultContext = {
      nickname: watchInitData.join_info.nickname,
      avatar: watchInitData.join_info.avatar,
      pv: watchInitData.pv.num2 || watchInitData.pv.real, // pv
      uv: watchInitData.online.num || watchInitData.online.virtual,
      role_name: watchInitData.join_info.role_name,
      device_type: this.isMobileDevice() ? 1 : 2, // 设备类型 1手机端 2PC 0未检测
      device_status: useMediaCheckServer().state.deviceInfo.device_status == 2 ? 2 : 1, // 设备状态  0未检测 1可以上麦 2不可以上麦
      watch_type: isPcClient ? '1' : '2', // 1 pc  2 h5  3 app  4 是客户端
      audience: roomBaseServerState.clientType !== 'send', //是不是观众
      kick_mark: `${randomNumGenerator()}${watchInitData.webinar.id}`,
      privacies: watchInitData.join_info.privacies || '',
      groupInitData: groupInitData,
      is_banned: groupInitData.isInGroup ? groupInitData.is_banned : interactToolStatus.is_banned
    };
    const defaultOptions = {
      context: defaultContext,
      appId: watchInitData.interact.paas_app_id,
      accountId: watchInitData.join_info.third_party_user_id,
      channelId: groupInitData.channel_id,
      token: groupInitData.access_token,
      hide: false // 是否隐身
    };
    return defaultOptions;
  }
  // 设置主频道静默状态(v4)
  setMainChannelMute(mute) {
    if (mute) {
      // _removeListeners(this.msgInstance);
    } else {
      // _addListeners(this.msgInstance);
    }
  }

  // 子房间上线发送group信息
  // TODO:根据中台需要，看是否这个方法还放在 msgServer中
  sendGroupInfoAfterJoin(msgInstance) {
    const roomBaseServer = useRoomBaseServer();
    const groupServer = useGroupServer()
    const { watchInitData } = roomBaseServer.state;
    const { groupInitData } = groupServer.state

    msgInstance.emitRoomMsg({
      type: 'group_join_info',
      nickname: watchInitData.join_info.nickname,
      ...groupInitData,
      accountId: watchInitData.join_info.third_party_user_id
    });
  }

  // 销毁子房间聊天实例
  destroyGroupMsg() {
    if (!this.groupMsgInstance) return;
    this.groupMsgInstance.destroy();
    this.groupMsgInstance = null;
    this.changeChannel(this.msgInstance);
  }

  // 销毁主房间聊天实例
  destroy() {
    if (!this.msgInstance) return;
    this.msgInstance.destroy();
    this.msgInstance = null;
    // this.changeChannel(this.groupMsgInstance);
  }

  // 获取当前主房间初始化参数
  getCurrentMsgInitOptions() {
    return JSON.parse(JSON.stringify(this.state.msgSdkInitOptions));
  }

  // 获取当前子房间初始化参数
  getCurrentGroupMsgInitOptions() {
    return JSON.parse(JSON.stringify(this.state.groupMsgSdkInitOptions));
  }

  // 单视频嵌入页面，不会加载互动sdk，但是需要判断是否是手机端
  // 所以设备检测需要去除对互动 sdk 的依赖
  isMobileDevice() {
    return !!/Android|webOS|iPhone|iPad|iPod|BB10|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(window.navigator.userAgent || "")
  }
}
export default function useMsgServer() {
  return new MsgServer();
}
