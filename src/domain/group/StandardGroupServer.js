import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import { group as groupApi } from '../../request/index.js';
/**
 * 标准分组直播场景下的分组相关服务
 *
 * @class StandardGroupServer
 */
class StandardGroupServer extends BaseServer {
  constructor() {
    super();

    this.state = {
      // 分组讨论界面是否显示
      show: false,
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
   * 功能1：给在线观众分配小组
   * 功能2：新增一个小组 （此时固定way=2）
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
    if (result && result.code === 200) {
      if (roomBaseServer.state.interactToolStatus.is_open_switch == 0) {
        // 如果是未分组，置成已分组未讨论状态
        roomBaseServer.setInavToolStatus('is_open_switch', 2);
      }
      this.getGroupedUserList();
    }
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
    console.log('[group] result', result);
    if (result && result.code === 200) {
      this.getWaitingUserList();
      this.getGroupedUserList();
    }
    return result;
  }

  /**
   * 解散小组
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
    if (result && result.code === 200) {
      this.getWaitingUserList();
      this.getGroupedUserList();
    }
    return result;
  }
}

export default function useGroupServer() {
  return StandardGroupServer.getInstance();
}
