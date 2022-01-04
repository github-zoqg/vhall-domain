import contextServer from '@/domain/common/context.server.js';
import { isPc, merge, randomNumGenerator } from '@/utils/index.js';

export default /**
 *
 */
function useMsgServer() {
  let state = {
    msgInstance: null,
    eventsPool: [],
    msgSdkInitOptions: {},
    groupMsgSdkInitOptions: {},
    keepAliveMsgEventList: {}
  };

  let groupMsgInstance = null;

  let _eventhandlers = {
    ROOM_MSG: [],
    CHAT: [],
    CUSTOM_MSG: [],
    OFFLINE: [],
    ONLINE: [],
    DOC_MSG: [],
    JOIN: [],
    LEFT: []
  };

  // 发送聊天消息
  function sendChatMsg(data, context) {
    if (state.groupMsgInstance) {
      state.groupMsgInstance.emitTextChat(data, context);
    } else {
      state.msgInstance.emitTextChat(data, context);
    }
  }

  // 发送房间消息
  function sendRoomMsg(data) {
    if (state.groupMsgInstance) {
      state.groupMsgInstance.emitRoomMsg(data);
    } else {
      state.msgInstance.emitRoomMsg(data);
    }
  }

  // 为聊天实例注册事件
  function _addListeners(instance) {
    for (let eventType in _eventhandlers) {
      instance.$on(eventType, msg => {
        console.log('----domain----,消息事件', msg, _eventhandlers[eventType]);
        if (_eventhandlers[eventType].length) {
          _eventhandlers[eventType].forEach(handler => {
            handler(msg);
          });
        }
      });
    }
  }

  // 为聊天实例注销事件
  function _removeListeners(instance) {
    for (let eventType in _eventhandlers) {
      instance.$off(eventType);
    }
  }

  // 重新注册保活消息
  function reRegisterKeepAliveMsgEvent() {
    console.log('重新注册保活消息', state.keepAliveMsgEventList);
    for (let eventType in state.keepAliveMsgEventList) {
      state.msgInstance.$on(eventType, msg => {
        if (state.keepAliveMsgEventList[eventType].length) {
          state.keepAliveMsgEventList[eventType].forEach(handler => {
            handler(msg);
          });
        }
      });
    }
  }

  // 注销保活消息
  function removeKeepAliveMsgEvent() {
    for (let eventType in state.keepAliveMsgEventList) {
      state.msgInstance.$off(eventType);
    }
  }

  Object.defineProperty(state, 'groupMsgInstance', {
    get() {
      return groupMsgInstance;
    },
    set(newVal) {
      // 如果新值旧值都为假，或者新值旧值相同，直接 return
      if ((!newVal && !groupMsgInstance) || newVal === groupMsgInstance) return;

      if (!newVal) {
        // 如果是销毁子房间实例
        // 主房间保活消息注销
        removeKeepAliveMsgEvent();
        // 重新注册主房间消息
        state.msgInstance && _addListeners(state.msgInstance);
      } else {
        // 如果是新创建子房间实例，注销主房间事件
        state.msgInstance && _removeListeners(state.msgInstance);
        // 主房间保活消息重新注册
        reRegisterKeepAliveMsgEvent();
      }

      groupMsgInstance = newVal;
    }
  });

  // 获取主房间聊天sdk初始化默认参数
  function getDefaultOptions() {
    const { state: roomBaseServerState } = contextServer.get('roomBaseServer');

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

  // 初始化主房间聊天sdk
  function init(customOptions = {}) {
    if (!contextServer.get('roomInitGroupServer')) return;
    const { state: roomInitGroupServerState } = contextServer.get('roomInitGroupServer');

    const defaultOptions = getDefaultOptions();

    const options = merge.recursive({}, defaultOptions, customOptions);
    console.log('聊天初始化参数', options);

    state.msgSdkInitOptions = options;

    return roomInitGroupServerState.vhallSaasInstance.createChat(options).then(res => {
      state.msgInstance = res;
      if (!state.groupMsgInstance) {
        _addListeners(res);
      }
      return res;
    });
  }

  // 设置主频道静默状态
  function setMainChannelMute(mute) {
    if (mute) {
      _removeListeners(state.msgInstance);
    } else {
      _addListeners(state.msgInstance);
    }
  }

  // 获取子房间聊天sdk初始化默认参数
  function getGroupDefaultOptions() {
    const { state: roomBaseServerState } = contextServer.get('roomBaseServer');

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
  function sendGroupInfoAfterJoin(msgInstance) {
    const roomBaseServer = contextServer.get('roomBaseServer');
    const { watchInitData, groupInitData } = roomBaseServer.state;

    msgInstance.emitRoomMsg({
      type: 'group_join_info',
      nickname: watchInitData.join_info.nickname,
      ...groupInitData,
      accountId: watchInitData.join_info.third_party_user_id
    });
  }

  // 初始化子房间聊天sdk
  function initGroupMsg(customOptions = {}) {
    if (!contextServer.get('roomInitGroupServer')) return Promise.reject('No Room Exist');

    // 每次初始化子房间聊天都需要清空原有房间聊天消息然后重新拉取
    const chatServer = contextServer.get('chatServer');
    chatServer && chatServer.clearHistoryMsg();

    const { state: roomInitGroupServerState } = contextServer.get('roomInitGroupServer');

    const defaultOptions = getGroupDefaultOptions();

    const options = merge.recursive({}, defaultOptions, customOptions);

    state.groupMsgSdkInitOptions = options;
    console.log('创建子房间聊天实例', options);
    return roomInitGroupServerState.vhallSaasInstance.createChat(options).then(res => {
      console.log('domain----创建子房间聊天实例成功', res);
      state.groupMsgInstance = res;
      // 子房间上线，在小组内广播当前人的小组信息，延时500ms解决开始讨论收不到消息的问题
      setTimeout(() => {
        sendGroupInfoAfterJoin(res);
      }, 500);
      _addListeners(res);
      return res;
    });
  }

  // 注册事件
  function $on(eventType, fn, iskeepLive) {
    if (!_eventhandlers.hasOwnProperty(eventType)) {
      throw new TypeError('Invalid eventType');
    }
    if (iskeepLive) {
      // 主房间保活消息
      if (!state.keepAliveMsgEventList[eventType]) {
        state.keepAliveMsgEventList[eventType] = [];
      }
      state.keepAliveMsgEventList[eventType].push(fn);
    }
    _eventhandlers[eventType].push(fn);
  }

  // 注销事件
  function $off(eventType, fn) {
    if (!fn) {
      _eventhandlers[eventType] = [];
    }

    const index = _eventhandlers[eventType].indexOf(fn);
    if (index > -1) {
      _eventhandlers[eventType].splice(index, 1);
    }
  }

  // 销毁子房间聊天实例
  function destroyGroupMsg() {
    if (!state.groupMsgInstance) return;
    state.groupMsgInstance.destroy();
    state.groupMsgInstance = null;
  }

  // 销毁主房间聊天实例
  function destroy() {
    if (!state.msgInstance) return;
    state.msgInstance.destroy();
    state.msgInstance = null;
  }

  // 获取当前主房间初始化参数
  function getCurrentMsgInitOptions() {
    return JSON.parse(JSON.stringify(state.msgSdkInitOptions));
  }

  // 获取当前子房间初始化参数
  function getCurrentGroupMsgInitOptions() {
    return JSON.parse(JSON.stringify(state.groupMsgSdkInitOptions));
  }

  return {
    state,
    init,
    initGroupMsg,
    destroy,
    destroyGroupMsg,
    $on,
    $off,
    getGroupDefaultOptions,
    getDefaultOptions,
    setMainChannelMute,
    sendRoomMsg,
    sendChatMsg,
    getCurrentMsgInitOptions,
    getCurrentGroupMsgInitOptions
  };
}
