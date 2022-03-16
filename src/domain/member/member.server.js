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
      raiseHandTip: false,
      //举手定时器集合
      handsUpTimerMap: {}
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
      const {clientType = '', watchInitData = {}} = useRoomBaseServer().state;
      const isLive = clientType === 'send';
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
          _this._handleCancelApplyConnect(msg);
          break;
        case 'vrtc_connect_agree':
          _this._handleAgreeApplyConnect(msg);
          break;
        case 'vrtc_connect_success':
          _this._handleSuccessConnect(msg);
          break;
        case 'vrtc_connect_invite_refused':
          _this._handleUserRejectConnect(msg);
          break;
        case 'vrtc_disconnect_success':
          _this._handleSuccessDisconnect(msg);
          break;
        case 'vrtc_speaker_switch':
          _this._handleChangeSpeaker(msg);
          break;
        case 'vrtc_connect_device_check':
          _this._handleDeviceCheck(msg);
          break;
        case 'kicked_in_chat':
        case 'room_kickout':
          _this._handleKicked(msg);
          break;
        case 'vrtc_disconnect_presentation_success':
          _this._handleUserEndPresentation(msg);
          break;
        case 'main_room_join_change':
          _this._handleMainRoomJoinChange(msg);
          break;
        case 'changeGroupInitData':
          //视图处理
          break;
        case 'vrtc_connect_presentation_agree':
          //视图处理
          break;
        case 'vrtc_connect_presentation_success':
          !isLive && _this._handlePresentationPermissionChange(msg);
          break;
        case 'room_vrtc_disconnect_success':
          //下麦成功
          !isLive && _this._handleRoomDisconnectSuccess(temp);
          break;
        case 'group_switch_start':
          //视图处理
          break;
        case 'group_join_change':
          //视图处理
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
    console.log(isLive, 'isLive-------------------');
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
    _this.$emit('LEFT', msg);
  }

  //用户申请上麦
  _handleApplyConnect(msg) {
    const {watchInitData = {}} = useRoomBaseServer().state;
    const {join_info = {}} = watchInitData;
    const userId = join_info.third_party_user_id;
    const _this = this;
    //举手tab的小红点
    if (this.state.tabIndex !== 2) {
      this.state.raiseHandTip = true;
    }
    // 如果申请人是自己
    if (msg.data.room_join_id == userId) {
      return;
    }

    let user = {
      account_id: msg.data.room_join_id,
      avatar: msg.data.avatar,
      device_status: msg.data.device_status,
      device_type: msg.data.device_type,
      nickname: msg.data.nick_name,
      role_name: msg.data.room_role
    };

    const {member_info = {is_apply: 1}} = msg.data;
    user = Object.assign(user, member_info);
    this.state.applyUsers.unshift(user);
    // 去重
    this.state.applyUsers = this.uniqBy(this.state.applyUsers, 'account_id');
    this._changeUserStatus(user.account_id, this.state.onlineUsers, member_info);

    //消息容错处理，如果这个人正在申请中，则重新计时
    if (this.state.handsUpTimerMap[user.account_id]) {
      clearTimeout(this.state.handsUpTimerMap[user.account_id]);
      delete this.state.handsUpTimerMap[user.account_id];
    }

    // 申请30秒后从列表去掉
    this.state.handsUpTimerMap[user.account_id] = setTimeout(() => {
      _this.state.handsUpTimerMap[user.account_id] && clearTimeout(_this.state.handsUpTimerMap[user.account_id]);
      delete _this.state.handsUpTimerMap[user.account_id];
      _this._changeUserStatus(user.account_id, _this.state.onlineUsers, {is_apply: 0});
      _this.state.applyUsers = _this.state.applyUsers.filter(u => u.account_id !== user.account_id);
      if (!_this.state.applyUsers.length) {
        _this.state.raiseHandTip = false;
        _this.$emit('UPDATE_TAB_TIPS', {visible: false});
      }
    }, 30000);

    //通知更新menu tab栏小红点显示状态
    this.$emit('UPDATE_TAB_TIPS', {visible: true});

  }

  //用户取消上麦
  _handleCancelApplyConnect(msg) {
    const {member_info = {is_apply: 0}} = msg.data;
    //发起端举手提示
    this.state.raiseHandTip = false;
    this._deleteUser(msg.data.room_join_id, this.state.applyUsers);
    this._changeUserStatus(msg.data.room_join_id, this.state.onlineUsers, member_info);
    //用户取消下麦,清除30秒自动拒绝的定时器
    this.state.handsUpTimerMap[msg.data.room_join_id] && clearTimeout(this.handsUpTimerMap[msg.data.room_join_id]);
    delete this.handsUpTimerMap[msg.data.room_join_id];
  }

  //同意了用户上麦
  _handleAgreeApplyConnect(msg) {
    const {clientType = ''} = useRoomBaseServer().state;
    const isLive = clientType === 'send';
    if (isLive) {
      this.state.raiseHandTip = false;
      return;
    }
    this._changeUserStatus(msg.room_join_id, this.state.onlineUsers, {is_apply: 0, is_speak: 1});
  }

  //用户上麦成功
  _handleSuccessConnect(msg) {
    const {clientType = '', watchInitData = {}} = useRoomBaseServer().state;
    const {join_info = {}} = watchInitData;
    const userId = join_info.third_party_user_id;
    const isLive = clientType === 'send';
    console.log(isLive, 'isLive-------------------');
    const isInGroup = useGroupServer().state.groupInitData.isInGroup;
    const _this = this;

    const {member_info = {is_apply: 0, is_speak: 1}} = msg.data;
    this._changeUserStatus(msg.data.room_join_id, this.state.onlineUsers, member_info);
    //如果已经没有举手的人，清除一下举手一栏的小红点
    if (!this.state.applyUsers.length) {
      this.state.raiseHandTip = false;
    }

    if (msg.data.room_join_id == userId && msg.data.room_role == 2) {
      return;
    }
    //将事件通过memberServer派发出去
    this.$emit('vrtc_connect_success', msg);
    //清除举手倒计时的定时器
    this.state.handsUpTimerMap[msg.data.room_join_id] && clearTimeout(this.state.handsUpTimerMap[msg.data.room_join_id]);
    delete this.state.handsUpTimerMap[msg.data.room_join_id];
  }

  //用户拒绝上麦邀请
  _handleUserRejectConnect(msg) {
    this.$emit('vrtc_connect_invite_refused', msg);
  }

  //互动连麦断开成功 todo 视图需要改造
  _handleSuccessDisconnect(msg) {
    const {watchInitData = {}} = useRoomBaseServer().state;
    const {join_info = {}} = watchInitData;
    const userId = join_info.third_party_user_id;

    this._changeUserStatus(msg.data.target_id, this.state.onlineUsers, {is_speak: 0, is_apply: 0});

    if (msg.data.target_id == userId) {
      this.$emit('vrtc_disconnect_success', msg);
      return;
    }

    if (this.state.applyUsers.length > 0) {
      const deleteIndex = this.state.applyUsers.findIndex(item => item.account_id == msg.data.target_id);
      deleteIndex !== -1 && (this.state.applyUsers.splice(deleteIndex, 1));
    }
    this.$emit('vrtc_disconnect_success', msg);
  }

  //互动设置主讲人
  _handleChangeSpeaker(msg) {
    console.log(msg, '设置主讲人------------');
  }

  //设备检测
  _handleDeviceCheck(msg) {
    const {member_info = {}} = msg.data;
    this._changeUserStatus(msg.data.room_join_id, this.state.onlineUsers, member_info);
    // if (![2, '2'].includes(msg.data.device_type)) {
    //   this._changeUserStatus(msg.data.room_join_id, this.state.onlineUsers, member_info);
    // }
    // if (![0, '0'].includes(msg.data.device_status)) {
    //   this._changeUserStatus(msg.data.room_join_id, this.state.onlineUsers, member_info);
    // }
  }

  //处理踢出人员
  _handleKicked(msg) {
    this._deleteUser(msg.accountId, this.state.onlineUsers);
    this._deleteUser(msg.accountId, this.state.applyUsers);
    this.$emit(msg.type, msg);
    this.getLimitUserList();
  }

  //用户主动结束演示
  _handleUserEndPresentation(msg) {
    console.log(msg, '用户主动结束了演示---------');
  }

  //主房间人员变动
  _handleMainRoomJoinChange(msg) {
    const {clientType = '', watchInitData = {}} = useRoomBaseServer().state;
    const {join_info = {}} = watchInitData;
    const userId = join_info.third_party_user_id;
    const isLive = clientType === 'send';
    const isInGroup = useGroupServer().state.groupInitData.isInGroup;
    //必须在主房间
    if (!isInGroup) return;

    if (isLive) {
      this.state.totalNum = msg.uv - useGroupServer().state.groupedUserList.length;
      this.state.totalNum = this.state.totalNum >= 0 ? this.state.totalNum : 0;
      // 如果sender_id==自己
      if (msg.sender_id == userId) {
        this.state.totalNum++;
      }
    }

    if (msg.data.isJoinMainRoom) {
      const flag = this.state.onlineUsers.find(item => item.account_id == msg.sender_id);
      if (flag) return false;
      this.state.onlineUsers.push({
        nickname: msg.data.nickname,
        is_banned: msg.data.isBanned,
        account_id: msg.data.accountId,
        role_name: msg.data.role_name == 20 ? 2 : msg.data.role_name,
        device_type: msg.data.device_type,
        is_apply: 0
      });
    } else {
      this.state.onlineUsers.forEach((item, index) => {
        if (item.account_id === msg.data.accountId) {
          this.state.onlineUsers.splice(index, 1);
        }
      });
    }

  }

  //演示权限变更
  _handlePresentationPermissionChange(msg) {
    this._changeUserStatus(msg.sender_id, this.state.onlineUsers, {is_speak: 1});
  }

  //下麦成功
  _handleRoomDisconnectSuccess(msg) {
    console.log(msg, '下麦成功--------------');
  }


  //todo 临时放这里，都迁移好了测试无误放utils里
  uniqBy(list = [], uniqKey = '') {
    const mapObj = new Map();
    return list.filter(item => !mapObj.has(item[uniqKey]) && mapObj.set(item[uniqKey], 1));
  }

  //更新人员的一些属性
  _changeUserStatus(accountId = '', list = [], obj = {}) {
    console.log('更改成员属性', accountId, list, obj);
    const item = list.find(item => item.account_id === accountId);
    if (!item) {
      return;
    }
    Object.assign(item || {}, obj);
    console.log(this.onlineUsers, '更改后的成员列表');
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
  async getLimitUserList() {
    const {watchInitData = {}} = useRoomBaseServer().state;
    const {interact = {}} = watchInitData;
    const roomId = interact.room_id;
    const data = {
      room_id: roomId,
      pos: 0,
      limit: 100
    };
    try {
      let bannedList = await this.getMutedUserList(data);
      let kickedList = useGroupServer().state.groupInitData.isInGroup ? {data: {list: []}} : await this.getKickedUserList(data);
      bannedList = bannedList?.data?.list || [];
      kickedList = kickedList?.data?.list || [];
      const list = bannedList.concat(kickedList);
      this.state.limitedUsers = this.uniqBy(list, 'account_id');
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
