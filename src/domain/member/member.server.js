import { im as imRequest } from '@/request/index.js';
import BaseServer from '@/domain/common/base.server';
import useRoomBaseServer from "../room/roombase.server";
//基础服务
class MemberServer extends BaseServer {
  constructor() {
    if (typeof MemberServer.instance === 'object') {
      return MemberServer.instance;
    }
    super();
    const { roomId = '', roleName, avatar = '' } = useRoomBaseServer().state.watchInitData;
    const { groupInitData = {} } = useRoomBaseServer().state;

    this.state = {
      //在线的成员
      onlineUsers: [],
      //申请上麦的人员
      applyUsers: [],
      //受限的人员
      limitedUsers: [],
      //总数
      totalNum: 0,
      //当前页数
      page: 1,
      //房间号
      roomId,
      //是否在分组里
      isInGroup: groupInitData.isInGroup,
      //组长的id
      leaderId: ''
    };

    this.listenEvents();
    MemberServer.instance = this;
    return this;
  }

  //监听msgServer通知
  listenEvents() {

  }
  //更新state上的属性
  updateState(key, value) {
    !['', void 0, null].includes(key) && (this.state[key] = value);
  }
  //请求全部在线人员列表
  getOnlineUserList(params) {
    const _this = MemberServer.instance;
    return imRequest.chat.getOnlineList(params).then(res => {
      if (res && [200, '200'].includes(res.code)) {

        _this.state.onlineUsers = _this._sortUsers(res.data.list);
        _this.state.applyUsers.forEach(element => {
          _this.state.onlineUsers.forEach(item => {
            if (element.accountId === item.accountId) {
              item.is_apply = true;
            }
            if ([20, '20'].includes(item.role_name)) {
              this.state.leaderId = item.account_id;
            }
          });
        });

        if (res.data.list.length === 0) {
          _this.state.page--;
        }

        _this.state.totalNum = res.data.total;
      }
      if (![200, '200'].includes(res.code)) {
        _this.state.page--;
      }
      return res;
    });
  }

  //获取受限人员列表
  async getLimitUserList(params = {}) {
    const _this = MemberServer.instance;
    const data = {
      room_id: _this.roomId,
      pos: 0,
      limit: 100
    };
    let requestParams = Object.assign(data, params);
    try {
      const bannedList = await _this.getMutedUserList(requestParams);
      const kickedList = _this.state.isInGroup
        ? { data: { list: [] } }
        : await _this.getKickedUserList(requestParams);
      const list = bannedList.data.list.concat(kickedList.data.list);
      const hash = {};
      _this.state.limitedUsers = list.reduce((preVal, curVal) => {
        !hash[curVal.account_id] && (hash[curVal.account_id] = true && preVal.push(curVal));
        return preVal;
      }, []);
    } catch (error) {
      console.error('获取受限人员列表接口错误', error);
    }
  }

  //成员操作--踢出成员
  kickedUser(params = {}) {
    return imRequest.chat.setKicked(params);
  }

  //成员操作--禁言成员
  mutedUser(params = {}) {
    return imRequest.chat.setBanned(params);
  }

  //请求禁言的成员列表
  getMutedUserList(params = {}) {
    return imRequest.chat.getBannedList(params);
  }

  //请求踢出的成员列表
  getKickedUserList(params = {}) {
    return imRequest.chat.getKickedList(params);
  }

  /**
   * 邀请演示、邀请上麦
   * v3/interacts/inav/invite
   * */
  inviteUserToInteract(params) {
    return imRequest.signaling.hostInviteUser(params);
  }

  /**
   * 发起端-结束用户演示
   * */
  endUserPresentation(params = {}) {
    return imRequest.signaling.endUserPresentation(params);
  }

  /**
   * 观看端-用户结束演示
   * */
  userEndPresentation(params = {}) {
    return imRequest.signaling.userEndPresentation(params);
  }

  /**
   * 发起端-允许（同意）用户上麦
   * */
  hostAgreeApply(params = {}) {
    return imRequest.signaling.hostAgreeApply(params);
  }

  /**
   * 发起端&观看端-用户下麦
   * */
  userNoSpeak(params = {}) {
    return imRequest.signaling.userNoSpeak(params);
  }

  /**
   * 用户上麦开始演示
   * /v3/interacts/inav-user/presentation
   * */
  userPresentation(params) {
    return imRequest.signaling.userPresentation(params);
  }

  /**
   * 升为组长 todo 这里缺个接口，待查找后补充到api里 也可以考虑放到分组讨论server
   * */
  setGroupLeader(params = {}) {
    return Promise.resolve();
  }

  //将在线人员列表分为五个部分排序 主持人 / 上麦嘉宾 / 下麦嘉宾 / 助理 / 上麦观众 / 普通观众
  _sortUsers(list = []) {
    let host = []; // 主持人
    let onMicGuest = []; // 上麦嘉宾
    let downMicGuest = []; // 下麦嘉宾
    let assistant = []; // 助理
    let onMicAudience = []; // 上麦观众
    let downMicAudience = []; // 普通观众
    const leader = []; // 组长
    list.forEach(item => {
      const role = Number(item.role_name)
      switch (role) {
        // 主持人
        case 1:
          host.push(item);
          break;

        // 观众
        case 2:
          item.is_speak ? onMicAudience.push(item) : downMicAudience.push(item);
          break;
        // 组长
        case 20:
          leader.push(item);
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
    return host.concat(onMicGuest, downMicGuest, assistant, leader, onMicAudience, downMicAudience);
  }

}

export default function userMemberServer() {
  return new MemberServer();
}
