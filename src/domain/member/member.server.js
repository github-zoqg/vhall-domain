import {im as imRequest} from '@/request/index.js';
import BaseServer from '@/domain/common/base.server';
import useRoomBaseServer from "../room/roombase.server";
import useMsgServer from "../common/msg.server";
import useGroupServer from "../group/StandardGroupServer";
import useMicServer from "../media/mic.server";

//基础服务
class MemberServer extends BaseServer {
  constructor() {
    if (typeof MemberServer.instance === 'object') {
      return MemberServer.instance;
    }
    super();
    const {roomId = '', roleName, avatar = ''} = useRoomBaseServer().state.watchInitData;
    const {groupInitData = {}} = useRoomBaseServer().state;

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
      leaderId: '',
      //当前的tabIndex
      tabIndex: 1,
      //举手栏是否有小红点
      raiseHandTip: false
    };

    // this.listenEvents();
    MemberServer.instance = this;
    return this;
  }

  //监听msgServer通知
  listenEvents() {
    const _this = this;
    //加入房间消息
    useMsgServer().$onMsg('JOIN', msg => {
      this._handleUserJoinRoom(msg);
    });

    //离开房间消息
    useMsgServer().$onMsg('LEFT', msg => {
      this._handleUserLeaveRoom(msg);
    });

    //直播结束
    useMsgServer().$on('live_over', () => {
      this.$emit('live_over');
    });

    //聊天消息监听
    useMsgServer().$onMsg('CHAT', rawMsg => {
      const msg = Object.assign({}, rawMsg);
      if (Object.prototype.toString.call(msg.data) !== '[object Object]') {
        msg.data = JSON.parse(msg.data);
        msg.context = JSON.parse(msg.context);
      }
      const type = msg.data.event_type || msg.data.type || '';
      switch (type) {
        case 'disable':
          break;
        case 'permit':
          break;
        default:
          break;
      }
    });

    //房间消息监听
    useMsgServer().$onMsg('ROOM_MSG', rawMsg => {
      let msg = Object.assign({}, rawMsg);
      if (Object.prototype.toString.call(msg.data) !== '[object Object]') {
        msg.data = JSON.parse(msg.data);
        msg.context = JSON.parse(msg.context);
      }
      const type = msg.data.event_type || msg.data.type || '';
      switch (type) {
        case 'vrtc_connect_apply':
          //用户申请上麦
          _this._handleApplyConnect(msg);
          break;
        case 'vrtc_connect_apply_cancel':
          break;
        case 'vrtc_connect_agree':
          break;
        case 'vrtc_connect_success':
          break;
        case 'vrtc_connect_invite_refused':
          break;
        case 'vrtc_disconnect_success':
          break;
        case 'vrtc_speaker_switch':
          break;
        case 'vrtc_connect_device_check':
          break;
        case 'kicked_in_chat':
        case 'room_kickout':
          break;
        case 'vrtc_disconnect_presentation_success':
          break;
        case 'main_room_join_change':
          break;
        case 'endLive':
          break;
        case 'room_kickout_cancel':
          break;
        case 'changeGroupInitData':
          break;
        case 'vrtc_connect_presentation_agree':
          break;
        case 'vrtc_connect_presentation_success':
          break;
        case 'room_vrtc_disconnect_success':
          break;
        case 'group_switch_start':
          break;
        case 'group_join_change':
          break;
        default:
          break;
      }
    });
  }

  //处理用户加入房间
  _handleUserJoinRoom(msg) {
    const {clientType = '', watchInitData = {}} = useRoomBaseServer().state;
    const {join_info = {}} = watchInitData;
    const userId = join_info.third_party_user_id;
    const isLive = clientType === 'send';
    console.log(isLive,'isLive-------------------');
    const isInGroup = useGroupServer().state.groupInitData.isInGroup;
    const _this = this;
    try {
      const {context} = msg;
      //如果上线的人是自己，不做操作
      if (isLive && msg.sender_id == userId) {
        return;
      }
      //找一下当前的在线人员里是否有这个用户
      const index = _this._getUserIndex(msg.sender_id, _this.state.onlineUsers);

      //如果在列表中，就不
      // 在线人数大于200不再添加到列表里，只能加载更多
      // 隐身模式登录也不加入列表中
      if ((!isLive && !isInGroup && index >= 0) || (isLive && index >= 0) || _this.state.totalNum > 200 || msg.data.hide) {
        return;
      }

      // 从上麦人员列表中获取加入房间的人是否上麦
      const speakIndex = _this._getUserIndex(msg.sender_id, useMicServer().state.speakerList);

      //发起端
      if (isLive) {
        const groupUsersNumber = useGroupServer().state.groupedUserList.length || 0;
        const fixedNum = [1, 2, '1', '2'].includes(useRoomBaseServer().state.interactToolStatus.is_open_switch) ? groupUsersNumber : 0;
        _this.state.totalNum = isInGroup ? msg.uv : msg.uv - fixedNum;
        //人员信息基础模板
        let user = {
          account_id: msg.sender_id,
          avatar: context.avatar,
          device_status: !['', void 0, null].includes(context.device_status) ? context.device_status : 1,
          device_type: !['', void 0, null].includes(context.device_status) ? context.device_type : 2,
          is_banned: isNaN(Number(context.is_banned)) ? 0 : Number(context.is_banned),
          nickname: context.nick_name || context.nickname,
          role_name: context.role_name,
          is_speak: speakIndex >= 0 ? 1 : 0,
          is_apply: 0
        };
        //如果上线的是分组内的成员
        if (isInGroup && context && context.groupInitData && ![null, void 0, ''].includes(context.groupInitData.join_role)) {
          user.role_name = context.groupInitData.join_role;
          user.is_banned = isNaN(Number(context.groupInitData.is_banned)) ? 0 : Number(context.groupInitData.is_banned);
        }
        _this.state.onlineUsers.push(user);
        _this.state.onlineUsers = _this._sortUsers(_this.state.onlineUsers);

        //如果是嘉宾，则视图那边收到监听会发送一个提示消息
        if (msg.context.role_name == 4 && msg.sender_id != userId) {
          _this.$emit('JOIN', msg);
        }

        return;
      }

      //观看端
      if (!isLive) {
        //更新在线人数
        _this.state.totalNum = msg.uv;
        //观看端，分组内
        if (isInGroup) {
          const index = _this.state.onlineUsers.find(item => item.account_id == msg.sender_id);
          if (index >= 0) {
            _this.state.onlineUsers.forEach(item => {
              if (item.account_id == msg.sender_id) {
                Object.assign(item, {
                  avatar: context.avatar,
                  device_status: context.device_status,
                  nickname: context.nick_name || context.nickname,
                  device_type: context.device_type,
                  is_speak: speakIndex >= 0 ? 1 : 0,
                  role_name: context && context.groupInitData && ![null, void 0, ''].includes(context.groupInitData.join_role) ? context.groupInitData.join_role : item.role_name
                });
              }
            });
            _this.state.onlineUsers = _this._sortUsers(_this.state.onlineUsers);
            return;
          }
          if (index === -1) {
            const user = {
              account_id: msg.sender_id,
              nickname: context.nick_name || context.nickname,
              avatar: context.avatar,
              device_status: context.device_status,
              device_type: context.device_type,
              role_name: context.role_name,
              is_speak: speakIndex >= 0 ? 1 : 0,
              is_apply: 0,
              is_banned: context && context.groupInitData ? Number(context.groupInitData.is_banned) : 0
            };
            //如果上线的是分组内的成员
            if (isInGroup && context && context.groupInitData && ![null, void 0, ''].includes(context.groupInitData.join_role)) {
              user.role_name = context.groupInitData.join_role;
              user.is_banned = isNaN(Number(context.groupInitData.is_banned)) ? 0 : Number(context.groupInitData.is_banned);
            }
            _this.state.onlineUsers.push(user);
            _this.state.onlineUsers = _this._sortUsers(_this.state.onlineUsers);
          }
          return;
        }
        //观看端，主房间
        if (!isInGroup) {
          const user = {
            account_id: msg.sender_id,
            avatar: context.avatar,
            device_status: context.device_status,
            device_type: context.device_type,
            is_banned: Number(context.is_banned),
            nickname: context.nickname,
            role_name: context.role_name,
            is_speak: speakIndex >= 0 ? 1 : 0,
            is_apply: 0
          };
          _this.state.onlineUsers.push(user);
          _this.onlineUsers = _this._sortUsers(_this.state.onlineUsers);
          //如果是嘉宾，则视图那边收到监听会发送一个提示消息
          if (msg.context.role_name == 4 && msg.sender_id != userId) {
            _this.$emit('JOIN', msg);
          }
        }
      }

    } catch (ex) {
      console.error('ex:', ex);
    }
  }

  //用户离开房间
  _handleUserLeaveRoom(msg) {
    const {clientType = ''} = useRoomBaseServer().state;
    const isLive = clientType === 'send';
    const isInGroup = useGroupServer().state.groupInitData.isInGroup;
    const _this = this;
    // 如果是聊天审核页面不做任何操作
    if (msg.context.isAuthChat) {
      return;
    }
    //todo 这里可能会改成，请求一下分组的接口，拿到分组的实际人数，因为分组Server的list这时候可能还在请求
    const groupUserNum = useGroupServer().state.groupedUserList.length >= 1 ? useGroupServer().state.groupedUserList.length - 1 : 0;
    const fixedNum = ([1, 2, '1', '2'].includes(useRoomBaseServer().state.interactToolStatus.is_open_switch) ? groupUserNum : 0);
    if (isLive) {
      _this.state.totalNum = isInGroup ? msg.uv : msg.uv - fixedNum;
    } else {
      _this.state.totalNum = msg.uv;
    }
    if (_this.state.totalNum < 0) {
      _this.state.totalNum = 0;
    }
    _this._deleteUser(msg.sender_id, _this.state.onlineUsers);
    _this._deleteUser(msg.sender_id, _this.state.applyUsers);
    _this.$emit('LEFT',msg);
  }

  //用户申请上麦
  _handleApplyConnect(msg){

  }

  //查找用户在数组里的索引号
  _getUserIndex(accountId, list) {
    return list.findIndex(
      item => item.account_id === accountId || item.accountId === accountId
    );
  }

  //删除用户
  _deleteUser(accountId, list = []) {
    const index = list.findIndex(
      item => ![null, void 0, ''].includes(accountId) && item.account_id === accountId
    );
    if (index !== -1) {
      list.splice(index, 1);
    }
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
        ? {data: {list: []}}
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
