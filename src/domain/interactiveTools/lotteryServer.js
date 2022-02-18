/**
 * @description 抽奖服务
 */
import useRoomBaseServer from '../room/roombase.server';
import lotteryApi from '../../request/lottery';
import useMsgServer from '../common/msg.server';
// import BaseServer from '../common/base.server';

export default class useLotteryServer {
  constructor(opt) {
    this._roomId = useRoomBaseServer().state.watchInitData.interact.room_id;
    this.listenMsg();
  }
  // 监听消息
  listenMsg() {
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      console.log(
        '[group] --domain ROOM_MSG--房间消息：',
        `${msg.data.type ? 'type:' : 'event_type'}:${msg.data.type || msg.data.event_type}`
      );
      switch (msg.data.event_type || msg.data.type) {
        //【分组创建/新增完成】
        case 'lottery_push':
          break;
      }
    });
  }

  // 获取列表
  getPrizeList() {
    return lotteryApi.getPrizeList({
      room_id: this._roomId
    });
  }

  // 初始化抽奖基础内容
  async initLotteryForm() {
    this.state.joinCondition = '1';
    await this.getPrizeList();
    this.getQualifiedNum();
  }

  // 检查当前的抽奖状态
  checkLottery() {
    return lotteryApi.checkLottery();
  }

  // 获取可参与抽奖用户
  queryQualifiedPerson(params) {
    return lotteryApi.queryQualifiedPerson({
      room_id: this._roomId,
      ...params
    });
  }

  // 重新初始化可参与抽奖用户
  updateLotteryUser() {
    const switch_id = useRoomBaseServer().state.watchInitData.switch.switch_id;
    return lotteryApi.updateUserStatus({
      switch_id
    });
  }

  // 开始抽奖
  pushLottery(params) {
    return lotteryApi.pushLottery({
      room_id: this._roomId,
      ...params
    });
  }

  // 开始抽奖
  endLottery(lotteryId) {
    return lotteryApi.endLottery({
      lottery_id: lotteryId,
      room_id: this._roomId
    });
  }
}
