import useRoomBaseServer from '@/domain/room/roombase.server.js';
import { isPc, merge, randomNumGenerator } from '@/utils/index.js';
import BaseServer from './base.server';
import VhallPaasSDK from '@/sdk/index.js';
class MsgServer extends BaseServer {
  constructor() {
    if (typeof MsgServer.instance === 'object') {
      return MsgServer.instance;
    }
    super();
    this.msgInstance = null;
    this.state = {
      msgSdkInitOptions: {},
      groupMsgSdkInitOptions: {}
    };

    this.defineReactiveGroupMsg();

    MsgServer.instance = this;
    return this;
  }

  _groupMsgInstance = null;

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

  // 初始化主房间聊天sdk
  async init(customOptions = {}) {
    const defaultOptions = this.getDefaultOptions();
    const options = merge.recursive({}, defaultOptions, customOptions);
    console.log('聊天初始化参数', options);
    this.state.msgSdkInitOptions = options;
    const vhallchat = await VhallPaasSDK.modules.VhallChat.createInstance(options);
    this.msgInstance = vhallchat.message;
    console.log('聊天实例', this.msgInstance);
    if (!this.groupMsgInstance) {
      this._addListeners(this.msgInstance);
    }
  }

  // 注册事件
  $onMsg(eventType, fn) {
    if (this._eventhandlers[eventType]) {
      this._eventhandlers[eventType].push(fn);
    } else {
      const registerMsgInstance = this.groupMsgInstance || this.msgInstance;
      this._eventhandlers[eventType] = [];
      this._eventhandlers[eventType].push(fn);
      console.log('聊天实例', registerMsgInstance);
      if (registerMsgInstance) {
        this._handlePaasInstanceOn(registerMsgInstance, eventType, msg => {
          this._eventhandlers[eventType].forEach(handler => {
            handler(msg);
          });
        });
      }
    }
  }

  _handlePaasInstanceOn(instance, eventType, fn) {
    // 'room';
    // 'custom'
    console.log(VhallChat);
    switch (eventType) {
      case 'ROOM_MSG':
        instance.onRoomMsg(fn); // 这个小写的字符串是跟微吼云沟通添加的，现在房间消息还没有常量
        break;
      case 'CHAT':
        instance.on(fn);
        break;
      case 'JOIN':
        instance.join(fn);
        break;
      case 'JOIN_ANY':
        // instance.on(VhallChat.EVENTS.JOIN_ANY, fn);
        break;
      case 'LEFT':
        instance.leave(fn);
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
        instance.onOffLine(fn);
        break;
      case 'ONLINE':
        instance.onOnLine(fn);
        break;
      // case 'GROUP_NEW':
      // instance.on(VhallChat.EVENTS.GROUP_NEW, fn);
      // break;
      // case 'GROUP_DISSOLVE':
      // instance.on(VhallChat.EVENTS.GROUP_DISSOLVE, fn);
      // break;
      case 'DocMsg':
        instance.onDocMsg(fn);
      default:
        instance.onCustomMsg(fn);
    }
  }

  // 注销事件
  $offMsg(eventType, fn) {
    if (!this._eventhandlers[eventType]) {
      return new Error('该消息未注册');
    }

    if (!fn) {
      this._eventhandlers[eventType] = [];
      this._handlePaasInstanceOff(eventType);
      return;
    }

    const index = this._eventhandlers[eventType].indexOf(fn);
    if (index > -1) {
      this._eventhandlers[eventType].splice(index, 1);
      this._handlePaasInstanceOff(eventType, fn);
    }
  }

  // paas实例注销事件
  _handlePaasInstanceOff(eventType, fn) {
    if (this.groupMsgInstance) {
      this.groupMsgInstance.off(eventType, fn);
    } else {
      this.msgInstance.off(eventType, fn);
    }
  }

  // 为聊天实例注册事件
  _addListeners(instance) {
    for (let eventType in this._eventhandlers) {
      this._handlePaasInstanceOn(instance, eventType, msg => {
        console.log('收到socket消息', eventType, msg);
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
    console.log('context', context);
    if (this.groupMsgInstance) {
      this.groupMsgInstance.emit(data, context);
    } else {
      console.log(data);
      this.msgInstance.emit(data, context);
    }
  }

  // 发送房间消息
  sendRoomMsg(data) {
    if (this.groupMsgInstance) {
      this.groupMsgInstance.emitRoomMsg(data);
    } else {
      this.msgInstance.emitRoomMsg(data);
    }
  }

  defineReactiveGroupMsg() {
    Object.defineProperty(this, 'groupMsgInstance', {
      get() {
        return this._groupMsgInstance;
      },
      set(newVal) {
        // 如果新值旧值都为假，或者新值旧值相同，直接 return
        if ((!newVal && !this._groupMsgInstance) || newVal === this._groupMsgInstance) return;

        if (!newVal) {
          // 如果是销毁子房间实例
          // 重新注册主房间消息
          this.msgInstance && _addListeners(this.msgInstance);
        } else {
          // 如果是新创建子房间实例，注销主房间事件
          this.msgInstance && _removeListeners(this.msgInstance);
        }

        this._groupMsgInstance = newVal;
      }
    });
  }

  // 获取主房间聊天sdk初始化默认参数
  // TODO:根据中台实际需要，更改context
  getDefaultOptions() {
    const { state: roomBaseServerState } = useRoomBaseServer();

    const isPcClient = isPc();

    const { watchInitData, groupInitData } = roomBaseServerState;
    console.log('roomBaseServerState', roomBaseServerState);
    const defaultContext = {
      nickname: watchInitData.join_info.nickname,
      avatar: watchInitData.join_info.avatar,
      pv: watchInitData.pv.num2 || watchInitData.pv.real, // pv
      uv: watchInitData.online.num || watchInitData.online.virtual,
      role_name: watchInitData.join_info.role_name,
      device_type: isPcClient ? '2' : '1', // 设备类型 1手机端 2PC 0未检测
      device_status: '0', // 设备状态  0未检测 1可以上麦 2不可以上麦
      audience: roomBaseServerState.clientType !== 'send',
      kick_mark: `${randomNumGenerator()}${watchInitData.webinar.id}`,
      privacies: watchInitData.join_info.privacies || '',
      groupInitData: groupInitData
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

  // 设置主频道静默状态
  setMainChannelMute(mute) {
    if (mute) {
      _removeListeners(this.msgInstance);
    } else {
      _addListeners(this.msgInstance);
    }
  }

  // 获取子房间聊天sdk初始化默认参数
  // TODO:根据中台实际需要，调整context
  getGroupDefaultOptions() {
    const { state: roomBaseServerState } = useRoomBaseServer();

    const isPcClient = isPc();

    const { watchInitData, groupInitData } = roomBaseServerState;

    const defaultContext = {
      nickname: watchInitData.join_info.nickname,
      avatar: watchInitData.join_info.avatar,
      pv: watchInitData.pv.num2 || watchInitData.pv.real, // pv
      uv: watchInitData.online.num || watchInitData.online.virtual,
      role_name: watchInitData.join_info.role_name,
      device_type: isPcClient ? '2' : '1', // 设备类型 1手机端 2PC 0未检测
      device_status: '0', // 设备状态  0未检测 1可以上麦 2不可以上麦
      watch_type: isPcClient ? '1' : '2', // 1 pc  2 h5  3 app  4 是客户端
      audience: roomBaseServerState.clientType !== 'send',
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

  // 初始化子房间聊天sdk
  initGroupMsg(customOptions = {}) {
    if (!contextServer.get('roomInitGroupServer')) return Promise.reject('No Room Exist');

    // 每次初始化子房间聊天都需要清空原有房间聊天消息然后重新拉取
    const chatServer = contextServer.get('chatServer');
    chatServer && chatServer.clearHistoryMsg();

    const { state: roomInitGroupServerState } = contextServer.get('roomInitGroupServer');

    const defaultOptions = getGroupDefaultOptions();

    const options = merge.recursive({}, defaultOptions, customOptions);

    this.state.groupMsgSdkInitOptions = options;
    console.log('创建子房间聊天实例', options);
    return roomInitGroupServerState.vhallSaasInstance.createChat(options).then(res => {
      console.log('domain----创建子房间聊天实例成功', res);
      this.groupMsgInstance = res;
      // 子房间上线，在小组内广播当前人的小组信息，延时500ms解决开始讨论收不到消息的问题
      setTimeout(() => {
        sendGroupInfoAfterJoin(res);
      }, 500);
      _addListeners(res);
      return res;
    });
  }

  // 销毁子房间聊天实例
  destroyGroupMsg() {
    if (!this.groupMsgInstance) return;
    this.groupMsgInstance.destroy();
    this.groupMsgInstance = null;
  }

  // 销毁主房间聊天实例
  destroy() {
    if (!this.msgInstance) return;
    this.msgInstance.destroy();
    this.msgInstance = null;
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
