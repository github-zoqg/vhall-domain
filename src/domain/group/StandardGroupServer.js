import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useInteractiveServer from '../media/interactive.server';
import useMsgServer from '../common/msg.server';
import useDocServer from '../doc/doc.server';
import { group as groupApi } from '../../request/index.js';
import { isPc } from '@/utils/index.js';
import useMicServer from '../media/mic.server';
import { sleep } from '../../utils';


/**
 * 标准分组直播场景下的分组相关服务
 *
 * @class StandardGroupServer
 */
class StandardGroupServer extends BaseServer {
  constructor() {
    super();

    window.groupServer = this

    this.state = {
      // 当前用户所在小组数据
      groupInitData: {
        isInGroup: false, //不在小组中
        // access_token: "access:fd8d3653:a68a5549b8ea8811" //访问token
        // channel_id: "ch_GeUR54XP" //通道Id
        // doc_permission: "16423152" // 主讲人ID
        // group_id: "5524386"  //小组Id
        // group_room_id: "lss_949338a9"  //分组房间id
        // inav_id: "inav_345b8731" //互动房间Id
        // is_banned: false  //个人是否禁言
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
      groupedUserList: [],
      // 组长列表
      // groupLeaderList:[]
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
      // 演示者变更
      VRTC_PRESENTATION_SCREEN_SET: 'VRTC_PRESENTATION_SCREEN_SET',
      // 结束演示
      VRTC_DISCONNECT_PRESENTATION_SUCCESS: 'VRTC_DISCONNECT_PRESENTATION_SUCCESS',
      // 拒绝演示
      VRTC_CONNECT_PRESENTATION_REFUSED: 'VRTC_CONNECT_PRESENTATION_REFUSED',
      // 主房间人员变动
      MAIN_ROOM_JOIN_CHANGE: 'MAIN_ROOM_JOIN_CHANGE',
      // 主持人/助理进入与退出小组
      GROUP_MANAGER_ENTER: 'GROUP_MANAGER_ENTER',
    };

    this.groupLeaderLeaveMap = new Map()

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
    // 初始化groupInitData数据
    // 未开启讨论时，发起端的分组状态要保持，存在有group_id，但是isInGroup=false的情况
    // 所以判断在不在小组中只能通过isInGroup字段判断
    await this.updateGroupInitData()
    const { interactToolStatus } = useRoomBaseServer().state;
    if (!this.state.groupInitData.group_id && interactToolStatus.group_id) {
      this.state.groupInitData.group_id = interactToolStatus.group_id;
      this.state.groupInitData.join_role = interactToolStatus.join_role;
    }
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
      console.log('[group]====', msg.data.event_type || msg.data.type, "===")
      switch (msg.data.event_type || msg.data.type) {
        // 直播结束
        case 'live_over':
          this.state.panelShow = false
          this.state.waitingUserList = [];
          this.state.groupedUserList = [];
          break;
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
        case 'vrtc_big_screen_set':
          this.msgdoForVrtcSpeakerSwitch(msg);
          break;
        // 分组成员上线信息(含该成员信息)
        case 'group_join_info':
          this.$emit(this.EVENT_TYPE.GROUP_JOIN_INFO, msg)
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
          this.$emit(this.EVENT_TYPE.VRTC_CONNECT_PRESENTATION_AGREE, msg)
          break;
        // 演示者变更
        case 'vrtc_presentation_screen_set':
          this.msgdoForVrtcConnectPresentationSet(msg);
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
        // 进出主房间
        case 'main_room_join_change': {
          this.msgdoForMainRoomJoinChange(msg);
        }
      }
    });

    useMsgServer().$onMsg('JOIN', msg => {
      // 加入房间
      console.log('[group] domain 加入房间消息：', msg);
      if (useRoomBaseServer().state.clientType === 'send') {
        if (msg.context.groupInitData && msg.context.groupInitData.group_id) {
          for (let item of this.state.groupedUserList) {
            if (item.id == msg.context.groupInitData.group_id) {
              const obj = item.group_joins.find(item => item.account_id == msg.sender_id);
              if (!obj) {
                // 没有再添加
                item.group_joins.push({
                  account_id: msg.sender_id,
                  ...msg.context,
                  ...msg.context.groupInitData,
                  nick_name: msg.context.nickname
                });
              }
              break;
            }
          }
        } else {
          if (msg.context.role_name != 2) {
            return;
          }
          this.state.waitingUserList.push({
            account_id: msg.sender_id,
            ...msg.context
          });
        }
        console.log('[group] 处理组长回归');
        this.handleGroupLeaderBack(msg) // 处理组长回归
      }
    });
    useMsgServer().$onMsg('LEFT', msg => {
      // 离开房间
      console.log('[group] domain 离开房间消息：', msg);
      if (useRoomBaseServer().state.clientType === 'send') {

        //  离开前是否是组长
        let isLeader = false;
        this.state.groupedUserList.forEach((item, index) => {
          if (item.group_joins.length != 0) {
            item.group_joins.forEach((ITEM, ind) => {
              if (msg.sender_id == ITEM.account_id) {
                if (item.join_role == 20) {
                  isLeader = true;
                }
                item.group_joins.splice(ind, 1);
              }
            });
          }
        });
        this.state.waitingUserList.forEach((item, index) => {
          if (item.account_id == msg.sender_id) {
            this.state.waitingUserList.splice(index, 1);
          }
        });
        if (isLeader) {
          // 处理组长离开
          this.handleGroupLeaderLeave(msg)
        }
      }
    });
  }

  //【分组创建完成】消息处理
  msgdoForGroupRoomCreate(msg) {
    console.log('[group] domain group_room_create');
    const { watchInitData, interactToolStatus, clientType } = useRoomBaseServer().state;
    if (clientType === 'send') {
      // 主持端才需要处理此消息，主持人和助理都可以操作分组讨论面板
      if (watchInitData.join_info.role_name == 1 || watchInitData.join_info.role_name == 3) {
        // 0 新增小组  1 初始化分配小组
        if (msg.data.is_append === 1) {
          // 每次讨论，初始化分配小组只会执行一次
          this.state.panelShow = true;
          if (interactToolStatus.is_open_switch == 0) {
            // 如果是未分组，置成已分组未讨论状态
            useRoomBaseServer().setInavToolStatus('is_open_switch', 2);
          }
          // 更新待分配的人员列表
          this.getWaitingUserList();
        }
        this.getGroupedUserList();
      }
    }
  }

  /**
   * 进入/退出小组 消息处理
   * @note 发起端、接受端 广播
   * @param {*} msg
   */
  async msgdoForGroupManagerEnter(msg) {
    // this.$emit('dispatch_group_enter', msg);
    this.$emit(this.EVENT_TYPE.GROUP_MANAGER_ENTER, msg)
  }

  /**
   * 小组解散消息处理
   * 助理进入小组主持人可解散，主持人进入小组助理可以解散
   * @param {*} msg
   * @note 发起端、接收端 广播
   * @returns
   */
  async msgdoForGroupDisband(msg) {
    console.log('[group] domain group_disband');

    if (this.state.groupInitData.isInGroup &&
      msg.data.group_id == this.state.groupInitData.group_id) {

      // 如果在小组中，小组要解散，
      // 更新小组内信息，更新主房间互动工具信息
      await Promise.all([this.updateGroupInitData(), this.updateMainRoomInavToolStatus()])

      // 更新上麦列表
      useMicServer().updateSpeakerList()

      // 给主房间发消息通知当前人离开子房间进入主房间
      this.sendMainRoomJoinChangeMsg({
        isJoinMainRoom: true,
        isBanned: useRoomBaseServer().state.interactToolStatus.is_banned
      });
      //  TODO:自定义菜单切换逻辑处理
      // this.handleGroupSelectMenuInfoChange();

      // 派发切换 channel 事件,清空聊天等操作
      this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE, msg);
      useMsgServer().destroyGroupMsg();

      // 退出小组重新初始化互动
      await useInteractiveServer().init()

      // 处理文档channel切换逻辑
      await useDocServer().groupReInitDocProcess();

      this.$emit(this.EVENT_TYPE.GROUP_DISBAND, msg);
    }

    // 不在小组中，更新主房间状态（如果主持人在小组内被解散，在主房间的观众收到此条消息需要更新状态）
    if (!this.state.groupInitData.isInGroup) {
      this.updateMainRoomInavToolStatus()
    }

    if (useRoomBaseServer().state.clientType === 'send') {
      // 如果是发起端，还需要更新分组讨论列表数据
      this.getWaitingUserList();
      this.getGroupedUserList();
    }
  }

  // 请求协助,主持端收到请求协助消息，会在对应的小组面板头部显示“请求协助中...”文字
  msgdoForGroupHelp(msg) {
    this.getGroupedUserList();
  }

  /**
   * //【开启讨论/开始讨论】
   * @param {*} msg
   * @notes 发起端、接收端 广播
   * @returns
   */
  async msgdoForGroupSwitchStart(msg) {
    console.log('[group] domain group_switch_start', msg);
    // 设置开始为开始讨论状态
    useRoomBaseServer().setInavToolStatus('is_open_switch', 1);

    // 更新个人所在小组信息
    await this.updateGroupInitData();
    console.log('[group] 开始讨论，isInGroup ', this.state.groupInitData.isInGroup);
    console.log('[group] 开始讨论，groupSpeakerlist ', JSON.stringify(this.state.groupInitData.speaker_list));


    //   开始讨论时
    // 1、msgServer groupChat初始化之前，可能会有组内成员先上麦，而其他成员收不到消息的情况
    //所以先保证组长上麦，其他组员保证能获取到组长画面
    // 2、还有一种情况，组内成员互动重新初始化之前，可能会有流加入订阅时没有互动实例而报错，所以在订阅前需等待互动实例完成
    const { isInGroup, join_role } = this.state.groupInitData
    if (isInGroup && join_role != 20) {
      await sleep(1000)
      await this.updateGroupInitData();
    }
    // 开始讨论但不在分组中，不需要发消息，直接 return
    if (!this.state.groupInitData.isInGroup) {
      // 在主房间的人更新主房间的互动工具状态，，更新主房间上麦列表
      this.updateMainRoomInavToolStatus().then(() => {
        useMicServer().updateSpeakerList()
      })
      return
    };

    // 进入小组中的人更新小组上麦列表
    useMicServer().updateSpeakerList()
    console.log('[group] 开始讨论，updateSpeakerList ', JSON.stringify(useMicServer().state.speakerList));

    //----------------------------------
    // this.handleResetInteractiveTools();
    // 自定义菜单切换逻辑处理
    // this.handleGroupSelectMenuInfoChange({ isEntryGroup: true });
    // 如果是分组直播并且正在讨论中并且在分组中，初始化子房间聊天
    // 初始化分组消息
    await useMsgServer().initGroupMsg();
    console.log('[group] 开始讨论，子房间聊天初始化成功');
    // 派发切换 channel 事件,清空聊天等操作
    this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE, msg);
    // 给主房间发消息通知当前人离开主房间进入子房间
    this.sendMainRoomJoinChangeMsg({
      isJoinMainRoom: false,
      isBanned: useRoomBaseServer().state.interactToolStatus.is_banned
    });
    // 派发子房间聊天实例创建成功事件，通知成员列表请求 online-list
    this.$emit(this.EVENT_TYPE.GROUP_MSG_CREATED, msg);

    // 处理分组下互动sdk切换channel
    await useInteractiveServer().init()

    // 处理文档channel切换逻辑
    useDocServer().groupReInitDocProcess();

    useDocServer()._setDocPermisson();

    this.$emit(this.EVENT_TYPE.GROUP_SWITCH_START, msg);
  }

  //【结束讨论】
  async msgdoForGroupSwitchEnd(msg) {
    // 如果没有结束讨论，直接结束了直播，就return;
    if (msg.data.over_live) return;

    const roomBaseServer = useRoomBaseServer()
    console.log('[group] domain group_switch_end', msg);
    // 设置开始为未讨论状态
    roomBaseServer.setInavToolStatus('is_open_switch', 0);
    // 主持人是否在小组内
    roomBaseServer.setInavToolStatus('is_host_in_group', 0);
    // 重置分配人员列表
    this.state.waitingUserList = [];
    this.state.groupedUserList = [];

    if (roomBaseServer.state.clientType === 'send') {
      //主持端
      this.state.panelShow = false;
    }

    // 结束讨论但不在分组中，不需要发消息，直接 return
    if (!this.state.groupInitData.isInGroup) {
      // 通知需要更新在线人员列表（结束讨论之后没有回到主房间的人，在主房间的 getOnlineList 中也能获取到）
      try {
        // 由于在不在小组内都派发此消息， 业务侧监听此事件，在小组内进行提示，不在小组内不进行提示  ------> 下述几行会改变小组状态，此时回到主直播间都会显示不在小组内
        msg.data.groupToast = true
      } catch (error) {
      }
      this.$emit(this.EVENT_TYPE.GROUP_SWITCH_END, msg);
      return;
    }

    // 更新个人所在小组信息  // 更新主房间互动工具的状态
    await Promise.all([this.updateGroupInitData(), this.updateMainRoomInavToolStatus()])

    // 更新主房间上麦列表
    useMicServer().updateSpeakerList()

    // 给主房间发消息通知当前人离开子房间进入主房间
    this.sendMainRoomJoinChangeMsg({
      isJoinMainRoom: true,
      isBanned: roomBaseServer.state.interactToolStatus.is_banned
    });

    // 自定义菜单切换逻辑处理(观看端有)
    // this.handleGroupSelectMenuInfoChange();

    // 派发切换 channel 事件,清空聊天等操作
    this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE, msg);

    useMsgServer().destroyGroupMsg();

    // 处理分组下互动sdk切换channel
    await useInteractiveServer().init();

    // 处理文档channel切换逻辑
    await useDocServer().groupReInitDocProcess();

    useDocServer()._setDocPermisson();

    this.$emit(this.EVENT_TYPE.GROUP_SWITCH_END, msg);
  }

  //【切换小组】小组人员变动
  async msgdoForGroupJoinChange(msg) {
    const { clientType } = useRoomBaseServer().state;
    if (clientType === 'send') {
      // 主持端
      await Promise.all([
        this.getWaitingUserList(),
        this.getGroupedUserList()
      ]);
    }

    if (useRoomBaseServer().state.interactToolStatus.is_open_switch != 1) {
      console.log('[group] 未开启讨论，不处理分组切换逻辑。');
      if (clientType === 'send') {
        this.$emit(this.EVENT_TYPE.GROUP_JOIN_CHANGE, msg);
      }
      return false;
    }

    // 切换的人员更新小组信息
    const groupJoinChangeInfo = await this.getGroupJoinChangeInfo(msg.data.group_ids);

    console.log('[group] groupJoinChangeInfo:', groupJoinChangeInfo);

    // 没有换组的人，需要更新自己所在房间的信息
    if ((!this.state.groupInitData.group_id || msg.data.group_ids.includes(Number(this.state.groupInitData.group_id))) && !groupJoinChangeInfo.isNeedCare) {
      // 如果变更的小组中包含主房间，需要更新主房间的上麦列表
      if (msg.data.group_ids.includes(0)) {
        await this.updateMainRoomInavToolStatus()
      }
      // 没有换组的人，更新自己的上麦列表
      useMicServer().updateSpeakerList()
      console.log('[group] 当前用户不需要关心这条切换的小组消息');
      return false;
    }

    // 自己回到主房间，需要获取主房间上麦列表
    if (groupJoinChangeInfo.isNeedCare && groupJoinChangeInfo.to === 0) {
      await this.updateMainRoomInavToolStatus()

      // 主持人退出小组回到主房间显示分组管理面板
      if (useRoomBaseServer().state.watchInitData.join_info.role_name == 1) {
        this.state.panelShow = true;
      }
    }

    // 换组的人更新自己的上麦列表
    useMicServer().updateSpeakerList()

    // 派发切换 channel 事件,清空聊天等操作
    this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE, msg);
    // 如果需要关心这条消息,并且是从小组中进入到主直播间
    if (groupJoinChangeInfo.to === 0) {
      // to 为 0 从子直播间切换到主房间
      console.log('[group] 小组 → 主直播间 （从小组切换到主直播间）');

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

      await useInteractiveServer().init();

      // 处理文档channel切换逻辑
      await useDocServer().groupReInitDocProcess();
    } else if (groupJoinChangeInfo.from === 0) {
      // from 为 0 从主房间切换到子直播间
      console.log('[group]  主直播间 → 小组（从主直播间切换到小组）');

      this.$emit(this.EVENT_TYPE.ENTER_GROUP_FROM_MAIN, msg)
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
        this.$emit(this.EVENT_TYPE.GROUP_MSG_CREATED, msg);

        // 处理分组下互动sdk切换channel
        await useInteractiveServer().init();

        // 处理文档channel切换逻辑
        await useDocServer().groupReInitDocProcess();
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
        this.$emit(this.EVENT_TYPE.GROUP_MSG_CREATED, msg);

        // 处理分组下互动sdk切换channel
        await useInteractiveServer().init();

        // 处理文档channel切换逻辑
        await useDocServer().groupReInitDocProcess();
      }
    }

    this.$emit(this.EVENT_TYPE.GROUP_JOIN_CHANGE, msg, groupJoinChangeInfo);
  }

  // 分组相关 设置组长操作权限 与 身份分离
  async msgdoForVrtcSpeakerSwitch(msg) {
    if (!this.state.groupInitData.isInGroup) return;
    const { room_join_id } = msg.data;

    this.state.groupInitData.main_screen = room_join_id
    if (room_join_id == useRoomBaseServer().state.watchInitData.join_info.third_party_user_id) {
      // this.handleGroupPermissionChangeInteract();
    } else {

      // 停止桌面共享推流
      // if (useDesktopShareServer().state.isShareScreen) {

      // }
      // if (this.speicalStreamId && this.isShowSpeicalStream) {
      //   this.$refs.desktopRef.stopDesktopShare();
      // }
    }
    this.$emit(this.EVENT_TYPE.VRTC_BIG_SCREEN_SET, msg)
  }

  //【组长变更/组长更改】消息处理
  async msgdoForGroupLeaderChange(msg) {
    console.log('[group] msgdoForGroupLeaderChange msg:', msg);
    const { join_info } = useRoomBaseServer().state.watchInitData
    if (msg.data.group_id == this.state.groupInitData.group_id) {
      // 在一个组里面，需要更新小组数据
      await this.updateGroupInitData();
      useDocServer()._setDocPermisson();

      // 组长变更，speaker中的roleName会变更，影响到流画面按钮显示，需要更新上麦列表
      useMicServer().updateSpeakerList()

      // 被设置为组长的是自己，且没上麦
      if (msg.data.account_id == join_info.third_party_user_id && !useMicServer().getSpeakerStatus()) {
        // 处理分组下互动sdk切换channel
        await useInteractiveServer().init();
      }
    }

    // 如果是主持人或助理，变更组长不是自己操作的，要更新分组面板数据
    if ((join_info.role_name == 1 || join_info.role_name == 3)
      && msg.sender_id != join_info.third_party_user_id) {
      this.getGroupedUserList();
    }

    this.$emit(this.EVENT_TYPE.GROUP_LEADER_CHANGE, msg);
  }

  //【组内踢出】消息
  async msgdoForRoomGroupKickout(msg) {
    const { join_info } = useRoomBaseServer().state.watchInitData
    if (join_info.role_name != 2) {
      // 主持端
      this.getWaitingUserList();
      this.getGroupedUserList();
      this.$emit(this.EVENT_TYPE.ROOM_GROUP_KICKOUT, msg);
    }

    // 如果当前用户和被踢出的人在一个房间，需要更新上麦列表
    if (msg.channel == this.state.groupInitData.channel_id && msg.data.target_id != join_info.third_party_user_id) {
      this.updateGroupInitData().then(() => {
        useMicServer().updateSpeakerList()
      })
      return
    }

    if (
      this.state.groupInitData.isInGroup &&
      msg.data.target_id == join_info.third_party_user_id
    ) {
      // 后端踢出后会检测有没有在麦上，在麦上会派发下麦消息，初始化互动在下麦消息执行
      let isNeedInteractiveInit = true
      if (useMicServer().getSpeakerStatus()) {
        isNeedInteractiveInit = false
      }
      // 如果是当前用户被踢出
      // 更新个人所在小组信息
      // 更新主房间互动工具的状态
      await Promise.all([this.updateGroupInitData(), this.updateMainRoomInavToolStatus()])
      // 更新上麦列表
      useMicServer().updateSpeakerList()

      // 给主房间发消息通知当前人离开子房间进入主房间
      this.sendMainRoomJoinChangeMsg({
        isJoinMainRoom: true,
        isBanned: useRoomBaseServer().state.interactToolStatus.is_banned
      });
      // 自定义菜单切换逻辑处理
      // this.handleGroupSelectMenuInfoChange();

      // 派发切换 channel 事件,清空聊天等操作
      this.$emit(this.EVENT_TYPE.ROOM_CHANNEL_CHANGE, msg);
      // 销毁子房间聊天实例
      useMsgServer().destroyGroupMsg();

      if (isNeedInteractiveInit) {
        // 处理分组下互动sdk切换channel
        await useInteractiveServer().init();
      }

      // 处理文档channel切换逻辑
      useDocServer().groupReInitDocProcess();
    }
    this.$emit(this.EVENT_TYPE.ROOM_GROUP_KICKOUT, msg);
  }

  // 演示者变更
  async msgdoForVrtcConnectPresentationSet(msg) {
    let isOldPresenter = false; //变更之前本人是否是演示者
    let isOldLeader = false; //变更之前本人是否是组长

    const { watchInitData: { join_info: { third_party_user_id, role_name } } } = useRoomBaseServer().state
    if (this.state.groupInitData.isInGroup) {
      // 如果在小组内
      if (this.state.groupInitData.presentation_screen == third_party_user_id) {
        isOldPresenter = true;
      }
      if (this.state.groupInitData.doc_permission == third_party_user_id) {
        isOldLeader = true;
      }
      this.state.groupInitData.presentation_screen = msg.data.target_id;
    } else {
      // 在直播间内
      if (useRoomBaseServer().state.interactToolStatus.presentation_screen == third_party_user_id) {
        isOldPresenter = true;
      }
      await useRoomBaseServer().getInavToolStatus();

      // 非小组时，切换演讲权限布局变化
      if (!useDocServer().state.switchStatus && role_name == 2) {
        if (msg.data.target_id == third_party_user_id) {
          useRoomBaseServer().setChangeElement('stream-list')
        } else {
          useRoomBaseServer().setChangeElement('')
        }
      }
    }
    useDocServer()._setDocPermisson();

    this.$emit(this.EVENT_TYPE.VRTC_PRESENTATION_SCREEN_SET, { msg, isOldPresenter, isOldLeader });
  }

  // 同意邀请演示成功消息
  async msgdoForVrtcConnectPresentationSuccess(msg) {
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
    useDocServer()._setDocPermisson();
    this.$emit(this.EVENT_TYPE.VRTC_DISCONNECT_PRESENTATION_SUCCESS, msg);
  }

  // 进出主房间
  async msgdoForMainRoomJoinChange(msg) {
    console.log('[group] msgdoForMainRoomJoinChange:', msg)
    // data: {
    //   accountId: "16423152"
    //   device_type: "2"
    //   isBanned: 0
    //   isJoinMainRoom: false
    //   nickname: "很长de昵称很长d昵称很长de昵称很长de昵称很长de昵称"
    //   role_name: 2
    //   type: "main_room_join_change"
    // }
    if (msg.data.accountId ==
      useRoomBaseServer().state.watchInitData.webinar.userinfo.user_id) {
      // 如果是主持人,更新主持人是否在小组中的状态
      useRoomBaseServer().state.interactToolStatus.is_host_in_group =
        msg.data.isJoinMainRoom ? 0 : 1;
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
    let params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      group_id: groupId,
    }; // 不传leader_account_id将会自动设置

    if (leaderId) {
      params.leader_account_id = leaderId
    }
    const result = await groupApi.groupSetLeader(params);
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
    return result;
  }



  /**
   * 更新GroupInitData数据
   */
  async updateGroupInitData() {
    const result = await this.getGroupInfo();
    this.state.groupInitData = (result && result.data) || {};
    // this.state.groupInitData = (result && result.data && {
    //   ...result.data,
    //   ...this.state.groupInitData
    // }) || {};
    if (result.data?.group_id) {
      this.state.groupInitData.isInGroup = true;
    } else {
      this.state.groupInitData.isInGroup = false;
    }
    return Promise.resolve()
  }

  // 更新主房间互动工具的状态
  async updateMainRoomInavToolStatus() {
    if (useRoomBaseServer().state.watchInitData.join_info.role_name != 2) {
      await useRoomBaseServer().getInavToolStatus();
    } else {
      await useRoomBaseServer().getCommonConfig()
      // await Promise.all([roomBaseServer.getConfigList(), roomBaseServer.getCommonConfig()])
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
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      group_id: this.state.groupInitData.group_id // 分组ID
    };
    return await groupApi.groupHelp(params);
  }

  // 获取小组内上麦状态
  getGroupSpeakStatus() {
    const { watchInitData: { join_info } } = useRoomBaseServer().state;
    const speakerList = this.state.groupInitData.speaker_list
    if (!speakerList) return false;
    if (speakerList.length) {
      return speakerList.some(item => item.account_id == join_info.third_party_user_id);
    } else {
      return false;
    }
  }

  /**
   * 处理组长异常掉线
   * @param {*} msg
   * @returns
   */
  handleGroupLeaderLeave(msg) {
    if (useRoomBaseServer().state.clientType !== 'send') return;

    const TIMEOUT = 15 * 1000; // 15秒
    const timer = setTimeout(() => {
      clearTimeout(timer)
      this.groupLeaderLeaveMap.delete(msg.sender_id)
      this.setLeader(groupId)
    }, TIMEOUT)

    this.groupLeaderLeaveMap.set(msg.sender_id, timer)
  }

  /**
   * 处理组长重新回归
   * @param {*} msg
   * @returns
   */
  async handleGroupLeaderBack(msg) {
    if (useRoomBaseServer().state.clientType !== 'send') return;

    const timer = this.groupLeaderLeaveMap.get(msg.sender_id)
    if (timer) {
      clearTimeout(timer)
      this.groupLeaderLeaveMap.delete(msg.sender_id)
    }
  }

  // 分组直播，进出子房间需要在主房间发消息，维护主房间 online-list
  sendMainRoomJoinChangeMsg(options = { isJoinMainRoom: false, isBanned: false }) {
    const { watchInitData } = useRoomBaseServer().state;
    const msgServer = useMsgServer();
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
    msgServer.sendRoomMsg(JSON.stringify(body));
  }
}

export default function useGroupServer() {
  return StandardGroupServer.getInstance();
}
