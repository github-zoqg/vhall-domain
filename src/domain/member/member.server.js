import requestApi from '@/request/index.js';
export default function userMemberServer() {
  let state = {
    //在线的成员
    onlineUsers: [],
    //申请上麦的人员
    applyUsers: [],
    //是否刷新了
    isRefresh: false,

    //总数
    totalNum: 0,
    //当前页数
    page: 1,

    //举手状态
    raiseHandTip: false
  };

  const imRequest = requestApi.im;

  //设置state的值
  function setState(key, value) {
    state[key] = value;
  }

  //请求在线成员列表然后处理
  function getOnlineUserList(params = {}) {
    return imRequest.chat.getOnlineList(params).then(res => {
      console.warn('当前在线人员列表', res);

      if (res && [200, '200'].includes(res.code)) {
        if (state.isRefesh) {
          state.onlineUsers = _sortUsers(res.data.list);
          state.isRefesh = false;
          console.log('>>>>>>aaaa2', state.applyUsers);
          state.applyUsers.forEach(element => {
            state.onlineUsers.forEach(item => {
              if (element.accountId == item.accountId) {
                item.isApply = true;
              }
            });
          });
        }

        if (!state.isRefesh && res.data.list.length === 0) {
          state.page--;
        }

        state.totalNum = res.data.total;
      }

      if (![200, '200'].includes(res.code)) {
        state.page--;
      }

      return res;
    });
  }

  /**
   * 将在线人员列表分为五个部分排序 主持人 / 上麦嘉宾 / 下麦嘉宾 / 助理 / 上麦观众 / 普通观众
   */
  function _sortUsers(list = []) {
    let host = []; // 主持人
    let onMicGuest = []; // 上麦嘉宾
    let downMicGuest = []; // 下麦嘉宾
    let assistant = []; // 助理
    let onMicAudience = []; // 上麦观众
    let downMicAudience = []; // 普通观众
    list.forEach(item => {
      switch (Number(item.role_name)) {
        // 主持人
        case 1:
          host.push(item);
          break;

        // 观众
        case 2:
          item.is_speak ? onMicAudience.push(item) : downMicAudience.push(item);
          break;

        // 助理
        case 3:
          assistant.push(item);
          break;

        // 嘉宾
        case 4:
          item.is_speak ? onMicGuest.push(item) : downMicGuest.push(item);
          break;
        default:
          console.error('角色未定义');
      }
    });

    // 加载更多的时候，如果普通观众超过200，只显示后200
    if (downMicAudience.length > 200) {
      downMicAudience = downMicAudience.slice(-200);
    }
    return host.concat(onMicGuest, downMicGuest, assistant, onMicAudience, downMicAudience);
  }

  //踢出成员
  function kickedUser(params = {}) {
    return imRequest.chat.setKicked(params);
  }

  //禁言成员
  function mutedUser(params = {}) {
    return imRequest.chat.setBanned(params);
  }

  //请求禁言的成员列表
  function getMutedUserList(params = {}) {
    return imRequest.chat.getBannedList(params);
  }

  //请求踢出的成员列表
  function getKickedUserList(params = {}) {
    return imRequest.chat.getKickedList(params);
  }

  /**
   * 邀请演示、邀请上麦
   * v3/interacts/inav/invite
   * */
  function inviteUserToInteract(params) {
    return imRequest.signaling.hostInviteUser(params);
  }

  /**
   * 发起端-结束用户演示
   * */
  function endUserPresentation(params = {}) {
    return imRequest.signaling.endUserPresentation(params);
  }

  /**
   * 观看端-用户结束演示
   * */
  function userEndPresentation(params = {}) {
    return imRequest.signaling.userEndPresentation(params);
  }

  /**
   * 发起端-允许（同意）用户上麦
   * */
  function hostAgreeApply(params = {}) {
    return imRequest.signaling.hostAgreeApply(params);
  }

  /**
   * 发起端&观看端-用户下麦
   * */
  function userNoSpeak(params = {}) {
    return imRequest.signaling.userNoSpeak(params);
  }

  /**
   * 用户上麦开始演示
   * /v3/interacts/inav-user/presentation
   * */
  function userPresentation(params) {
    return imRequest.signaling.userPresentation(params);
  }

  return {
    state,
    setState,
    getOnlineUserList,
    getMutedUserList,
    getKickedUserList,
    mutedUser,
    kickedUser,
    inviteUserToInteract,
    endUserPresentation,
    userEndPresentation,
    hostAgreeApply,
    userNoSpeak,
    userPresentation
  };
}
