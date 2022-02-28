import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useInteractiveServer from '../media/interactive.server';
import useMsgServer from '../common/msg.server';
import useDocServer from '../doc/doc.server';
import { group as groupApi, room } from '../../request/index.js';
import { isPc } from '@/utils/index.js';

/**
 * 标准分组直播场景下的分组相关服务
 *
 * @class StandardGroupServer
 */
class StandardGroupServer extends BaseServer {
  constructor() {
    super();

    this.state = {
      // 当前用户所在小组数据
      groupInitData: {
        isInGroup: false //不在小组中
        // access_token: "access:fd8d3653:a68a5549b8ea8811" //访问token
        // channel_id: "ch_GeUR54XP" //通道Id
        // doc_permission: "16423152" // 主讲人ID
        // group_id: "5524386"  //小组Id
        // group_room_id: "lss_949338a9"  //分组房间id
        // inav_id: "inav_345b8731" //互动房间Id
        // is_banned: "0"  //是否禁言
        // join_role: "1"  //参会角色
        // main_screen: "16423152" //主屏账户Id
        // name: "分组1"
        // presentation_screen: "16423152" // 演示者ID
        // speaker_list: []   //上麦列表
        //    ------nick_name  //昵称
        //    ------role_name  //1主持人|2观众|3助理|4嘉宾|5admin|20组长
        //    ------account_id  //账户ID
        //    ------audio  //1=开|0=关
        //    ------video  //1=开|0=关
      },
      // 分组讨论操作面板是否显示
      panelShow: false,
      // 待分配人员列表
      waitingUserList: [],
      // 已分组人员列表
      groupedUserList: []
    };

    this.EVENT_TYPE = {
      // 开始分组讨论
      GROUP_SWITCH_START: 'GROUP_SWITCH_START',
      // 结束分组讨论
      GROUP_SWITCH_END: 'GROUP_SWITCH_END',
      // 分组切换
      GROUP_JOIN_CHANGE: 'GROUP_JOIN_CHANGE',
      // channel 切换
      ROOM_CHANNEL_CHANGE: 'ROOM_CHANNEL_CHANGE',
      // 邀请演示
      VRTC_CONNECT_PRESENTATION: 'VRTC_CONNECT_PRESENTATION',
      // 同意邀请演示成功 ——> 开始演示
      VRTC_CONNECT_PRESENTATION_SUCCESS: 'VRTC_CONNECT_PRESENTATION_SUCCESS',
      // 邀请演示-同意
      VRTC_CONNECT_PRESENTATION_AGREE: 'VRTC_CONNECT_PRESENTATION_AGREE',
      // 组长更改
      GROUP_LEADER_CHANGE: 'GROUP_LEADER_CHANGE',
      // 分组解散
      GROUP_DISBAND: 'GROUP_DISBAND',
      // 组内踢出
      ROOM_GROUP_KICKOUT: 'ROOM_GROUP_KICKOUT',
      // 成员信息
      GROUP_JOIN_INFO: 'GROUP_JOIN_INFO',
      // 切换channel，通知成员列表组件，请求列表接口
      GROUP_MSG_CREATED: 'GROUP_MSG_CREATED',
      // 切换主屏
      VRTC_BIG_SCREEN_SET: 'VRTC_BIG_SCREEN_SET',
      // 结束演示
      VRTC_DISCONNECT_PRESENTATION_SUCCESS: 'VRTC_DISCONNECT_PRESENTATION_SUCCESS',
      // 拒绝演示
      VRTC_CONNECT_PRESENTATION_REFUSED: 'VRTC_CONNECT_PRESENTATION_REFUSED',
      // 主房间人员变动
      MAIN_ROOM_JOIN_CHANGE: 'MAIN_ROOM_JOIN_CHANGE',
      // 进入与退出小组
      GROUP_MANAGER_ENTER: 'GROUP_MANAGER_ENTER'
    };
    this.listenMsg();
  }
  /**
   * 获取单实例
   * @returns
   */
  static getInstance() {
    if (!StandardGroupServer.instance) {
      StandardGroupServer.instance = new StandardGroupServer();
    }
    return StandardGroupServer.instance;
  }

  /**
   * 初始化当前用户所在小组信息
   * @returns
   */
  async init() {
    const result = await this.getGroupInfo();
    console.log('[group] groupInit result:', result);
    this.setGroupInitData(result.data);
    return result;
  }

  async getGroupInfo() {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id // 主直播房间ID
    };
    return await groupApi.groupInit(params);
  }

  //监听分组相关消息（属于房间消息）
  listenMsg() {
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      console.log(
        '[group] --domain ROOM_MSG--房间消息：',
        `${msg.data.type ? 'type:' : 'event_type'}:${msg.data.type || msg.data.event_type}`
      );
      switch (msg.data.event_type || msg.data.type) {
        //【分组创建/新增完成】
        case 'group_room_create':
          this.msgdoForGroupRoomCreate(msg);
          break;
        //主持人/助理/进入/退出小组（观众没有）
        case 'group_manager_enter':
          this.msgdoForGroupManagerEnter(msg);
          break;
        //开启讨论(开始讨论)
        case 'group_switch_start':
          this.msgdoForGroupSwitchStart(msg);
          break;
        //结束讨论
        case 'group_switch_end':
          this.msgdoForGroupSwitchEnd(msg);
          break;
        //小组被解散
        case 'group_disband':
          this.msgdoForGroupDisband(msg);
          break;
        //请求协助
        case 'group_help':
          this.msgdoForGroupHelp(msg);
          break;
        //组长变更
        case 'group_leader_change':
          this.msgdoForGroupLeaderChange(msg);
          break;
        // 主讲人--设置主屏
        case 'vrtc_speaker_switch':
          this.msgdoForVrtcSpeakerSwitch(msg);
          break;
        // 换组
        case 'group_join_change':
          this.msgdoForGroupJoinChange(msg);
          break;
        // 组内踢出用户
        case 'room_group_kickout':
          this.msgdoForRoomGroupKickout(msg);
          break;
        // 邀请演示(主直播间主持人邀请其它成员演示，小组内组长邀请其它成员演示)
        case 'vrtc_connect_presentation':
          this.$emit(this.EVENT_TYPE.VRTC_CONNECT_PRESENTATION, msg);
          break;
        // 邀请演示-同意
        case 'vrtc_connect_presentation_agree':
          break;
        // 同意演示成功 ——> 开始演示
        case 'vrtc_connect_presentation_success':
          this.msgdoForVrtcConnectPresentationSuccess(msg);
          break;
        // 结束演示
        case 'vrtc_disconnect_presentation_success':
          this.msgdoForVrtcDisconnectPresentationSuccess(msg);
          break;
        // 拒绝演示邀请
        case 'vrtc_connect_presentation_refused':
          this.$emit(this.EVENT_TYPE.VRTC_CONNECT_PRESENTATION_REFUSED, msg);
          break;
      }
    });

    useMsgServer().$onMsg('JOIN', msg => {
      // 加入房间
      console.log('[group] domain 加入房间消息：', msg);
      if (useRoomBaseServer().state.clientType === 'send') {
        this.getWaitingUserList();
        this.getGroupedUserList();
      }
    });
    useMsgServer().$onMsg('LEFT', msg => {
      // 离开房间
      console.log('[group] domain 离开房间消息：', msg);
      if (useRoomBaseServer().state.clientType === 'send') {
        this.getWaitingUserList();
        this.getGroupedUserList();
      }
    });
  }

  //【分组创建完成】消息处理
  msgdoForGroupRoomCreate(msg) {
    console.log('[group] domain group_room_create');
    if (useRoomBaseServer().state.clientType === 'send') {
      // 主持端才需要处理此消息
      if (
        msg.sender_id === useRoomBaseServer().state.watchInitData?.join_info?.third_party_user_id
      ) {
        // 0 新增小组  1 初始化分配小组
        if (msg.data.is_append === 1) {
          // 每次讨论，初始化分配小组只会执行一次
          this.state.panelShow = true;
          if (useRoomBaseServer().state.interactToolStatus.is_open_switch == 0) {
            // 如果是未分组，置成已分组未讨论状态
            useRoomBaseServer().setInavToolStatus('is_open_switch', 2);
          }
          // 更新待分配的人员列表
          this.getWaitingUserList();
        }
      }
      this.getGroupedUserList();
    }
  }

  //【进入/退出小组】消息处理
  async msgdoForGroupManagerEnter(msg) {
    this.$emit('dispatch_group_enter', msg);
  }

  //【小组解散】消息处理
  async msgdoForGroupDisband(msg) {
    console.log('[group] domain group_disband');
    if (useRoomBaseServer().state.clientType === 'send') {
      console.log('[group] domain group_disband 主持端');
      // 主持端
      this.getWaitingUserList();
      this.getGroupedUserList();
    } else {
      // 观看端

      if (
        !this.state.groupInitData.isInGroup ||
        msg.data.group_id !== this.state.groupInitData.group_id
      ) {
        // 不在分组中，不需要处理
        console.log('[group] domain group_disband 观看端 不在分组中，不需要处理');
        return;
      }
      // 如果在小组中，小组要解散，
      await this.updateGroupInitData(); // 更新数据
      // 获取最新的互动房间状态
      // await this.handleGetCommonConfigInfo();
      // 给主房间发消息通知当前人离开子房间进入主房间
      this.sendMainRoomJoinChangeMsg({
        isJoinMainRoom: true,
        isBanned: useRoomBaseServer().state.interactToolStatus.is_banned
      });
      //  TODO:自定义菜单切换逻辑处理
      // this.handleGroupSelectMenuInfoChange();

      // 派发切换 channel 事件,清空聊天等操作
      this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE);
      useMsgServer().destroyGroupMsg();

      // 处理文档channel切换逻辑
      useDocServer().groupReInitDocProcess();

      this.$emit(this.EVENT_TYPE.GROUP_DISBAND);
    }
  }

  // 请求协助,主持端收到请求协助消息，会在对应的小组面板头部显示“请求协助中...”文字
  msgdoForGroupHelp(msg) {
    this.getGroupedUserList();
  }

  //【开启讨论/开始讨论】
  async msgdoForGroupSwitchStart(msg) {
    console.log('[group] domain group_switch_start', msg);
    // 设置开始为开始讨论状态
    useRoomBaseServer().setInavToolStatus('is_open_switch', 1);
    if (useRoomBaseServer().state.watchInitData.join_info.role_name == 2) {
      // 观看端
      // 更新个人所在小组信息
      await this.updateGroupInitData();
      // 开始讨论但不在分组中，不需要发消息，直接 return
      if (!this.state.groupInitData.isInGroup) return;
      //----------------------------------
      // this.handleResetInteractiveTools();
      await useRoomBaseServer().getInavToolStatus();
      // 自定义菜单切换逻辑处理
      // this.handleGroupSelectMenuInfoChange({ isEntryGroup: true });
      // 如果是分组直播并且正在讨论中并且在分组中，初始化子房间聊天
      // 初始化分组消息
      await useMsgServer().initGroupMsg();
      console.log('[group] 开始讨论，子房间聊天初始化成功');
      // 派发切换 channel 事件,清空聊天等操作
      this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE);
      // 给主房间发消息通知当前人离开主房间进入子房间
      this.sendMainRoomJoinChangeMsg({
        isJoinMainRoom: false,
        isBanned: useRoomBaseServer().state.interactToolStatus.is_banned
      });
      // 派发子房间聊天实例创建成功事件，通知成员列表请求 online-list
      this.$emit(this.EVENT_TYPE.GROUP_MSG_CREATED);

      // 处理分组下互动sdk切换channel
      useInteractiveServer().groupReInitInteractProcess()
      // useRoomBaseServer().groupReInitInteractProcess();
      // 处理文档channel切换逻辑
      useDocServer().groupReInitDocProcess();
      this._setDocPermisson();

      this.$emit(this.EVENT_TYPE.GROUP_SWITCH_START);
    }
  }

  //【结束讨论】
  async msgdoForGroupSwitchEnd(msg) {
    console.log('[group] domain group_switch_end', msg);
    // 设置开始为未讨论状态
    useRoomBaseServer().setInavToolStatus('is_open_switch', 0);
    // TODO: 演示权限交还主持人
    if (useRoomBaseServer().state.clientType === 'send') {
      //主持端
      this.state.panelShow = false;
    }
    // 结束讨论但不在分组中，不需要发消息，直接 return
    if (!this.state.groupInitData.isInGroup) return;

    // 更新个人所在小组信息
    await this.updateGroupInitData();

    // 聚合接口，各种互动工具的状态拉取
    // await this.handleGetCommonConfigInfo();
    await useRoomBaseServer().getInavToolStatus();

    // 给主房间发消息通知当前人离开子房间进入主房间
    this.sendMainRoomJoinChangeMsg({
      isJoinMainRoom: true,
      isBanned: useRoomBaseServer().state.interactToolStatus.is_banned
    });

    // 自定义菜单切换逻辑处理(观看端有)
    // this.handleGroupSelectMenuInfoChange();

    // 派发切换 channel 事件,清空聊天等操作
    this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE);

    useMsgServer().destroyGroupMsg();

    // 处理分组下互动sdk切换channel
    // useRoomBaseServer().groupReInitInteractProcess();

    // 处理文档channel切换逻辑
    useDocServer().groupReInitDocProcess();
    this._setDocPermisson();
    this.$emit(this.EVENT_TYPE.GROUP_SWITCH_END);
  }

  //【切换小组】小组人员变动
  async msgdoForGroupJoinChange(msg) {
    if (useRoomBaseServer().state.clientType === 'send') {
      // 主持端
      this.getWaitingUserList();
      this.getGroupedUserList();
    }
    if (useRoomBaseServer().state.interactToolStatus.is_open_switch != 1) {
      console.log('[group] 未开启讨论，不处理分组切换逻辑。');
      return false;
    }

    const groupJoinChangeInfo = await this.getGroupJoinChangeInfo(msg.data.group_ids);
    console.log('[group] groupJoinChangeInfo:', groupJoinChangeInfo);
    // 如果不需要关心这条切换的小组消息,直接 return
    if (!groupJoinChangeInfo.isNeedCare) {
      console.log('[group] 当前用户不需要关心这条切换的小组消息');
      return false;
    }

    // 派发切换 channel 事件,清空聊天等操作
    this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE);
    // 如果需要关心这条消息,并且是从小组中进入到主直播间
    if (groupJoinChangeInfo.to === 0) {
      // to 为 0 从子直播间切换到主房间
      console.log('[group] 小组 → 主直播间 （从小组切换到主直播间）');
      // await this.handleGetCommonConfigInfo();
      await useRoomBaseServer().getInavToolStatus();
      // 给主房间发消息通知当前人离开子房间进入主房间
      this.sendMainRoomJoinChangeMsg({
        isJoinMainRoom: true,
        isBanned: useRoomBaseServer().state.interactToolStatus.is_banned
      });
      // 自定义菜单切换逻辑处理
      //  this.handleGroupSelectMenuInfoChange();
      // 销毁子房间聊天实例
      useMsgServer().destroyGroupMsg();
      // 处理分组下互动sdk切换channel

      // useRoomBaseServer().groupReInitInteractProcess();

      // 处理文档channel切换逻辑
      useDocServer().groupReInitDocProcess();
    } else if (groupJoinChangeInfo.from === 0) {
      // from 为 0 从主房间切换到子直播间
      console.log('[group]  主直播间 → 小组（从主直播间切换到小组）');

      // 给主房间发消息通知当前人离开主房间进入子房间
      this.sendMainRoomJoinChangeMsg({
        isJoinMainRoom: false,
        isBanned: useRoomBaseServer().state.interactToolStatus.is_banned
      });
      // this.handleResetInteractiveTools();
      // 自定义菜单切换逻辑处理
      // this.handleGroupSelectMenuInfoChange({ isEntryGroup: true });
      // 创建子房间聊天实例

      if (
        useRoomBaseServer().state.interactToolStatus.is_open_switch === 1 &&
        this.state.groupInitData.isInGroup
      ) {
        // 创建新的子房间聊天实例
        await useMsgServer().initGroupMsg();

        // 派发子房间聊天实例创建成功事件，通知成员列表请求 online-list
        this.$emit(this.EVENT_TYPE.GROUP_MSG_CREATED);

        // 处理分组下互动sdk切换channel
        // useRoomBaseServer().groupReInitInteractProcess();

        // 处理文档channel切换逻辑
        useDocServer().groupReInitDocProcess();
      }
    } else {
      // 从子房间切换到另一个子房间
      console.log('[group] 小组 → 小组 （从小组切换到小组）');
      // 从子房间切换到另一个子房间
      // 自定义菜单切换逻辑处理
      // this.handleGroupSelectMenuInfoChange({ isEntryGroup: true });
      // 销毁子房间聊天实例
      useMsgServer().destroyGroupMsg();

      if (
        useRoomBaseServer().state.interactToolStatus.is_open_switch === 1 &&
        this.state.groupInitData.isInGroup
      ) {
        // 创建新的子房间聊天实例
        await useMsgServer().initGroupMsg();

        // 派发子房间聊天实例创建成功事件，通知成员列表请求 online-list
        this.$emit(this.EVENT_TYPE.GROUP_MSG_CREATED);

        // 处理分组下互动sdk切换channel
        // useRoomBaseServer().groupReInitInteractProcess();

        // 处理文档channel切换逻辑
        useDocServer().groupReInitDocProcess();
      }
    }
  }

  // 分组相关 设置组长操作权限 与 身份分离
  async msgdoForVrtcSpeakerSwitch(msg) {
    if (!this.state.groupInitData.isInGroup) return;
    const { room_join_id } = msg.data;
    if (room_join_id == useRoomBaseServer().state.watchInitData.join_info.third_party_user_id) {
      useDocServer().state.hasDocPermission = true;
      // this.handleGroupPermissionChangeInteract();
    } else {
      // 切换左侧控制栏disabled状态
      useDocServer().state.hasDocPermission = false;
      // 停止桌面共享推流
      // if (this.speicalStreamId && this.isShowSpeicalStream) {
      //   this.$refs.desktopRef.stopDesktopShare();
      // }
    }
  }

  //【组长变更/组长更改】消息处理
  async msgdoForGroupLeaderChange(msg) {
    if (msg.data.group_id == this.state.groupInitData.group_id) {
      // 在一个组里面，需要更新小组数据
      await this.updateGroupInitData();

      this._setDocPermisson();
    }
    if (useRoomBaseServer().state.watchInitData.join_info.role_name != 2) {
      this.state.groupInitData.doc_permission = msg.data.account_id;
      this.getGroupedUserList();
    }
    this.$emit(this.EVENT_TYPE.GROUP_LEADER_CHANGE);
  }

  //【组内踢出】消息
  async msgdoForRoomGroupKickout(msg) {
    if (useRoomBaseServer().state.watchInitData.join_info.role_name != 2) {
      // 主持端
      this.getWaitingUserList();
      this.getGroupedUserList();
    }
    if (!this.state.groupInitData.isInGroup) return;
    await this.updateGroupInitData();
    if (
      msg.data.target_id === useRoomBaseServer().state.watchInitData.join_info.third_party_user_id
    ) {
      // 如果是当前用户被踢出

      // 获取最新的互动房间状态
      // await this.handleGetCommonConfigInfo();
      await useRoomBaseServer().getInavToolStatus();

      // 给主房间发消息通知当前人离开子房间进入主房间
      this.sendMainRoomJoinChangeMsg({
        isJoinMainRoom: true,
        isBanned: useRoomBaseServer().state.interactToolStatus.is_banned
      });
      // 自定义菜单切换逻辑处理
      // this.handleGroupSelectMenuInfoChange();

      // 派发切换 channel 事件,清空聊天等操作
      this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE);
      // 销毁子房间聊天实例
      useMsgServer().destroyGroupMsg();

      // 处理分组下互动sdk切换channel
      // useRoomBaseServer().groupReInitInteractProcess();

      // 处理文档channel切换逻辑
      useDocServer().groupReInitDocProcess();

      // 本人被提出提示
      this.$emit(this.EVENT_TYPE.ROOM_GROUP_KICKOUT);
    } else {
      console.log('[group] ------没有被踢出');
    }
  }

  // 同意邀请演示成功消息
  async msgdoForVrtcConnectPresentationSuccess(msg) {
    if (this.state.groupInitData.isInGroup) {
      // 如果在小组内
      await this.updateGroupInitData();
    } else {
      // 在直播间内
      await useRoomBaseServer().getInavToolStatus();
    }
    this._setDocPermisson();
    this.$emit(this.EVENT_TYPE.VRTC_CONNECT_PRESENTATION_SUCCESS, msg);
  }

  // 结束演示 成功消息
  async msgdoForVrtcDisconnectPresentationSuccess(msg) {
    if (this.state.groupInitData.isInGroup) {
      // 如果在小组内
      await this.updateGroupInitData();
    } else {
      // 在直播间内
      await useRoomBaseServer().getInavToolStatus();
    }
    this._setDocPermisson();
    this.$emit(this.EVENT_TYPE.VRTC_DISCONNECT_PRESENTATION_SUCCESS, msg);
  }

  // 设置文档操作权限
  _setDocPermisson() {
    const { interactToolStatus, watchInitData } = useRoomBaseServer().state;
    if (
      (this.state.groupInitData.isInGroup &&
        this.state.groupInitData.presentation_screen ==
        watchInitData.join_info.third_party_user_id) ||
      (!this.state.groupInitData.isInGroup &&
        interactToolStatus.presentation_screen == watchInitData.join_info.third_party_user_id)
    ) {
      // 在小组内有要是权限，或者在主直播间有演示权限
      // 设置文档操作权限为主人
      useDocServer().setRole(VHDocSDK.RoleType.HOST);
    } else {
      // 设置文档操作权限为观众
      useDocServer().setRole(VHDocSDK.RoleType.SPECTATOR);
    }
  }

  /**
   * 功能1：初始化分配小组
   * 功能2：新增n个小组 （此时固定way=2）
   * 该操作执行成功，所有端会收到 event_type === 'group_room_create'的消息
   * @param {String} number 分组数量，2~50 之间
   * @param {String} way 分组方式，1=随机分配|2=手动分配
   * @returns
   */
  async groupCreate({ number, way = 1 }) {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      switch_id: watchInitData.switch.switch_id, // 场次ID
      number: number + '', // 转字符串
      way: way + '' // 转字符串
    };
    const result = await groupApi.groupCreate(params);
    return result;
  }

  /***
   * 获取待分配人员列表
   */
  async getWaitingUserList() {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      switch_id: watchInitData.switch.switch_id // 场次ID
    };
    const result = await groupApi.groupWaitList(params);
    // console.log('[group] domain getWaitingUserList:', result);
    if (result && result.code === 200) {
      this.state.waitingUserList = result.data.list;
    }
    return result;
  }

  /**
   * 获取已分组人员列表
   * @returns
   */
  async getGroupedUserList() {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      switch_id: watchInitData.switch.switch_id // 场次ID
    };
    const result = await groupApi.groupListing(params);
    // console.log('[group] getGroupedUserList result:', result);
    if (result && result.code === 200) {
      this.state.groupedUserList = result.data.list;
    }
    return result;
  }

  /**
   * （批量）换组
   * @param {*} exAccountIds 待换组用户id
   * @param {Number} groupId 小组id
   * @returns
   */
  async groupExchange(exAccountIds, groupId) {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      ex_account_ids: exAccountIds.join(),
      group_id: groupId
    };
    const result = await groupApi.groupExchange(params);
    console.log('[group] result', result);
    return result;
  }

  /**
   * 解散小组
   * 该操作执行成功，所有端会收到 event_type === 'group_disband'的消息
   * @param {Number} groupId 小组id
   * @returns
   */
  async groupDisband(groupId) {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      group_id: groupId
    };
    const result = await groupApi.groupDisband(params);
    console.log('[group] result', result);
    return result;
  }

  /**
   * 设为组长
   * @param {Number} groupId 小组id
   * @param {Number} leaderId
   * @returns
   */
  async setLeader(groupId, leaderId) {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      group_id: groupId,
      leader_account_id: leaderId
    };
    const result = await groupApi.groupSetLeader(params);
    console.log('[group] groupSetLeader result', result);
    if (result && result.code === 200) {
      this.getGroupedUserList();
    }
    return result;
  }

  /**
   * 开启讨论（开始讨论）
   * 该操作执行成功，所有端会触发两个消息：
   * event_type === 'group_switch_start' 消息小组讨论使用
   * type==='main_room_join_change' 消息成员列表使用
   * @returns
   */
  async startDiscussion() {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      switch_id: watchInitData.switch.switch_id // 场次ID
    };
    const result = await groupApi.groupStartDiscussion(params);
    if (result && result.code === 200) {
      // 开始讨论成功
      useRoomBaseServer().setInavToolStatus('is_open_switch', 1);
    }
    return result;
  }

  /**
   * 结束讨论
   * 该操作执行成功，所有端会收到 event_type === 'group_switch_end'的消息
   * 和type==='main_room_join_change'的消息
   * @returns
   */
  async endDiscussion() {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      switch_id: watchInitData.switch.switch_id // 场次ID
    };
    const result = await groupApi.groupEndDiscussion(params);
    return result;
  }

  /**
   * 主持人、助理进入小组
   * 该操作执行成功，所有端会收到两个消息：
   * type === 'group_join_change' 小组讨论使用消息
   * type === 'group_manager_enter' 成员列表使用消息
   */
  async groupEnter(groupId) {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      group_id: groupId // 小组Id
    };
    const result = await groupApi.groupEnter(params);
    console.log('[group] groupEnter result', result);
    if (result && result.code === 200) {
      // 进入小组完成
      // channel_id: "ch_suEPXRon"
      // group_id: "5521302"
      // inav_id: "inav_2be5d012"
      // paas_access_token: "access:fd8d3653:aa3dada53cc72024"
      // paas_app_id: "fd8d3653"
      // room_id: "lss_5fafee07"
      // 设置小组=信息
      // const res = await this.getGroupInfo();
      // this.setGroupInitData(res.data);
    }
    return result;
  }

  /**
   * 主持人、助理退出小组
   */
  async groupQuit() {
    console.log('[group] groupInitData.group_id:', this.state.groupInitData.group_id);
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      group_id: this.state.groupInitData.group_id // 分组ID
    };
    const result = await groupApi.groupQuit(params);
    console.log('[group] groupQuit result', result);
    if (result && result.code === 200) {
      // 退出小组完成
      // console.log('[group] groupQuit setGroupInitData');
      // this.setGroupInitData(null);
      // this.state.panelShow = true;
    }
    return result;
  }

  /**
   * 更新GroupInitData数据
   */
  async updateGroupInitData() {
    await this.init();
  }

  setGroupInitData(data) {
    this.state.groupInitData = data || {};
    if (this.state.groupInitData?.group_id) {
      this.state.groupInitData.isInGroup = true;
      this.state.groupInitData.isBanned = false;
    } else {
      this.state.groupInitData.isInGroup = false;
    }
  }

  /**
   * 收到切换小组消息,判断是否需要切换 channel
   * 服务端无法确定是group_ids数组的id的 from,to 顺序
   * @param {Array} group_ids [m,n] 涉及到成员变更的小组的id，0 表示在主直播间，
   * @returns
   */
  async getGroupJoinChangeInfo(group_ids) {
    console.log('[group]小组切换 group_ids:', group_ids);
    // 备份之前的小组信息
    const oldGroupInitData = JSON.parse(JSON.stringify(this.state.groupInitData));
    // 之前的分组id
    const oldGroupId = Number(oldGroupInitData.group_id ?? 0);
    console.log('[group] oldGroupId:', oldGroupId);
    // 如果group_ids包含了之前的分组id，说明当前用户有可能变更了小组
    if (group_ids.includes(oldGroupId)) {
      console.log('[group] 可能变更了小组');
      // 需要重新获取最新的groupInitData来对比
      await this.updateGroupInitData();
      const newGroupId = Number(this.state.groupInitData.group_id ?? 0);
      console.log('[group] newGroupId:', newGroupId);
      if (oldGroupId != newGroupId) {
        // 如果新的小组跟之前的小组不一样则说明变更了小组,否则不需要关心
        return {
          isNeedCare: true,
          from: oldGroupId,
          to: newGroupId
        };
      }
    }
    return {
      isNeedCare: false,
      from: oldGroupId,
      to: oldGroupId
    };
  }

  // 分组直播，进出子房间需要在主房间发消息，维护主房间 online-list
  sendMainRoomJoinChangeMsg(options = { isJoinMainRoom: false, isBanned: false }) {
    const { watchInitData } = useRoomBaseServer().state;
    var isPcClient = isPc();
    const body = {
      type: 'main_room_join_change',
      nickname: watchInitData.join_info.nickname,
      accountId: watchInitData.join_info.third_party_user_id,
      isJoinMainRoom: options.isJoinMainRoom,
      role_name: watchInitData.join_info.role_name,
      device_type: isPcClient ? '2' : '1',
      isBanned: options.isBanned
    };
    useMsgServer().sendMainRoomMsg(JSON.stringify(body));
  }

  // 设置主讲人（邀请演示）
  async presentation() {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id // 主直播房间ID
    };
    return await groupApi.presentation(params);
  }

  // 请求协助
  async needHelp() {
    console.log('[group] groupInitData.group_id:', this.state.groupInitData.group_id);
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      group_id: this.state.groupInitData.group_id // 分组ID
    };
    return await groupApi.groupHelp(params);
  }
}

export default function useGroupServer() {
  return StandardGroupServer.getInstance();
}
