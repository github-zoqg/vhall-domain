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
      show: false,
      //''-无分组讨论(默认); ready-未分组；group-已分组；discuss-讨论中
      status: ''
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
   * 给在线观众分配小组
   * @param {String} number 分组数量，2~50 之间
   * @param {String} way 分组方式，1=随机分配|2=手动分配
   * @returns
   */
  groupCreate({ number, way = 1 }) {
    const { watchInitData } = useRoomBaseServer().state;
    const params = {
      room_id: watchInitData.interact.room_id, // 主直播房间ID
      switch_id: watchInitData.switch.switch_id, // 场次ID
      number: number + '', // 转字符串
      way: way + '' // 转字符串
    };
    return groupApi.groupCreate(params);
  }
}

export default function useGroupServer() {
  return StandardGroupServer.getInstance();
}
