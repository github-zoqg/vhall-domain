import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useMsgServer from '../common/msg.server';
import { group as groupApi } from '../../request/index.js';
import { isPc } from '@/utils/index.js';

const msgServer = useMsgServer();
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
        // presentation_screen: "16423152"
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
    // 当前用户进入了某个小组
    // access_token: "access:fd8d3653:a68a5549b8ea8811"
    // channel_id: "ch_GeUR54XP"
    // doc_permission: "16423152"
    // group_id: "5524386"
    // group_room_id: "lss_949338a9"
    // inav_id: "inav_345b8731"
    // is_banned: "0"
    // join_role: "1"
    // main_screen: "16423152"
    // name: "分组1"
    // presentation_screen: "16423152"
    // speaker_list: []
    return result;
  }

  async getGroupInfo() {
    const roomBaseServer = useRoomBaseServer();
    const { watchInitData } = roomBaseServer.state;
    const params = {
      room_id: watchInitData.interact.room_id // 主直播房间ID
    };
    return await groupApi.groupInit(params);
  }

  //监听分组相关消息（属于房间消息）
  listenMsg() {
    msgServer.$onMsg('ROOM_MSG', msg => {
      if (msg.data.event_type === 'group_room_create') {
      }
      switch (msg.data.event_type || msg.data.type) {
        //创建分组
        case 'group_room_create':
        //进入/退出小组
        case 'group_manager_enter':
          if (msg.data.status == 'enter') {
          } else if (msg.data.status == 'quit') {
          }
          break;
        //开启讨论
        case 'group_switch_start':
          break;
        //关闭讨论
        case 'group_switch_end':
          break;
        //小组被解散
        case 'group_disband':
          break;
        //请求协助
        case 'group_help':
          break;
        //组长变更
        case 'group_leader_change':
          break;
        case 'group_join_change':
          break;
      }
    });
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
    const roomBaseServer = useRoomBaseServer();
    const { watchInitData } = roomBaseServer.state;
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
    if (result && result.code === 200) {
      this.getWaitingUserList();
      this.getGroupedUserList();
    }
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
    const roomBaseServer = useRoomBaseServer();
    const { watchInitData } = roomBaseServer.state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      switch_id: watchInitData.switch.switch_id // 场次ID
    };
    const result = await groupApi.groupStartDiscussion(params);
    if (result && result.code === 200) {
      // 开始讨论成功
      roomBaseServer.setInavToolStatus('is_open_switch', 1);
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
    const roomBaseServer = useRoomBaseServer();
    const { watchInitData } = roomBaseServer.state;
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
    const roomBaseServer = useRoomBaseServer();
    const { watchInitData } = roomBaseServer.state;
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

  // 结束别的用户演示
  async endOtherPresentation() {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      receive_account_id: ''
    };
    return await groupApi.endOtherPresentation(params);
  }

  // 结束自己演示
  async endSelfPresentation() {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id // 主直播房间ID
    };
    return await groupApi.endSelfPresentation(params);
  }

  // 收到切换小组消息,判断是否需要切换 channel
  async getGroupJoinChangeInfo(group_ids) {
    // 备份之前的小组信息
    const oldGroupInitData = JSON.parse(JSON.stringify(this.state.groupInitData));
    console.log('[group] domain -------- oldGroupInitData', oldGroupInitData);
    // 如果在主直播间，并且 group_ids 中包括主直播间
    if (!oldGroupInitData.isInGroup && group_ids.indexOf(0) > -1) {
      // 重新获取最新的 groupInitData
      await this.init();
      console.log('[group] domain --------直播间->小组', this.state.groupInitData);
      // 如果新的小组跟之前的小组不一样则需要关心,否则不需要关心
      return {
        isNeedCare: this.state.groupInitData.isInGroup,
        from: 0,
        to: this.state.groupInitData.group_id
      };
    }
    // 如果是在小组中，并且 group_ids 中包括了该小组
    if (oldGroupInitData.isInGroup && group_ids.indexOf(Number(oldGroupInitData.group_id)) > -1) {
      await this.init();
      console.log('domain --------小组->直播间', this.state.groupInitData);
      // 如果现在变为不在小组了,则需要关心
      if (!this.state.groupInitData.isInGroup) {
        return {
          isNeedCare: true,
          from: oldGroupInitData.group_id,
          to: 0
        };
      }
      // 如果新的小组跟之前的小组不一样则需要关心,否则不需要关心
      return {
        isNeedCare: oldGroupInitData.group_id !== this.state.groupInitData.group_id,
        from: oldGroupInitData.group_id,
        to: groupInitData.group_id
      };
    }
    // 如果不满足上述两个 if 则不需要关心
    return {
      isNeedCare: false,
      from: oldGroupInitData.isInGroup ? oldGroupInitData.group_id : 0,
      to: oldGroupInitData.isInGroup ? oldGroupInitData.group_id : 0
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
    msgServer.sendRoomMsg(JSON.stringify(body));
  }
}

export default function useGroupServer() {
  return StandardGroupServer.getInstance();
}
