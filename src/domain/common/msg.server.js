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
  listenEvents() {
    this.$onMsg('ROOM_MSG', msg => {
      const { role_name } = useRoomBaseServer().state.watchInitData.join_info
      // 结束直播或在小组中结束直播，需要销毁socket，并且只有观众会销毁
      if (role_name == 2 && (msg.data.type == 'live_over' || (msg.data.type == 'group_switch_end' && msg.data.over_live === 1))) {
        this.destroy();
        this.destroyGroupMsg();
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
    const vhallchat = await VhallPaasSDK.modules.VhallChat.createInstance(options);
    this.msgInstance = vhallchat.message;
    console.log('主房间消息实例', this.msgInstance);
    const { groupInitData } = useGroupServer().state;
    if (!groupInitData.isInGroup) {
      this.changeChannel(this.msgInstance);
      this._addListeners(this.msgInstance);
    }
  }
  async initGroupMsg(customOptions = {}) {
    //如果已存在子房间先销毁
    const defautlGroupOptions = this.getGroupDefaultOptions();
    const options = merge.recursive({}, defautlGroupOptions, customOptions);
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
      console.log('msg消息', eventType, msg);
      //判断房间id 该消息属于当前所在房间才处理回调
      if (this.curMsgInstance.channelId == msg.channel) {
        fn(msg);
      }
    };
    // 'room';
    // 'custom'
    switch (eventType) {
      case 'ROOM_MSG':
        instance.onRoomMsg(cb); // 这个小写的字符串是跟微吼云沟通添加的，现在房间消息还没有常量
        break;
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
    const { watchInitData, groupInitData } = roomBaseServerState;
    const defaultContext = {
      nickname: watchInitData.join_info.nickname,
      avatar: watchInitData.join_info.avatar,
      pv: watchInitData.pv && (watchInitData.pv.num2 || watchInitData.pv.real), // pv
      uv: watchInitData.online && (watchInitData.online.num || watchInitData.online.virtual),
      role_name: watchInitData.join_info.role_name,
      device_type: useMediaCheckServer().state.deviceInfo.device_type, // 设备类型 1手机端 2PC 0未检测
      device_status: useMediaCheckServer().state.deviceInfo.device_status, // 设备状态  0未检测 1可以上麦 2不可以上麦
      audience: roomBaseServerState.clientType !== 'send',
      kick_mark: `${randomNumGenerator()}${watchInitData.webinar.id}`,
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
    const { watchInitData } = roomBaseServerState;
    const { groupInitData } = useGroupServer().state;
    const defaultContext = {
      nickname: watchInitData.join_info.nickname,
      avatar: watchInitData.join_info.avatar,
      pv: watchInitData.pv.num2 || watchInitData.pv.real, // pv
      uv: watchInitData.online.num || watchInitData.online.virtual,
      role_name: watchInitData.join_info.role_name,
      device_type: useMediaCheckServer().state.deviceInfo.device_type, // 设备类型 1手机端 2PC 0未检测
      device_status: useMediaCheckServer().state.deviceInfo.device_status, // 设备状态  0未检测 1可以上麦 2不可以上麦
      watch_type: isPcClient ? '1' : '2', // 1 pc  2 h5  3 app  4 是客户端
      audience: roomBaseServerState.clientType !== 'send', //是不是观众
      kick_mark: `${randomNumGenerator()}${watchInitData.webinar.id}`,
      privacies: watchInitData.join_info.privacies || '',
      groupInitData: groupInitData
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
  // 设置主频道静默状态
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
    const { watchInitData, groupInitData } = roomBaseServer.state;

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
    this.changeChannel(this.groupMsgInstance);
  }

  // 获取当前主房间初始化参数
  getCurrentMsgInitOptions() {
    return JSON.parse(JSON.stringify(this.state.msgSdkInitOptions));
  }

  // 获取当前子房间初始化参数
  getCurrentGroupMsgInitOptions() {
    return JSON.parse(JSON.stringify(this.state.groupMsgSdkInitOptions));
  }
}
export default function useMsgServer() {
  return new MsgServer();
}
