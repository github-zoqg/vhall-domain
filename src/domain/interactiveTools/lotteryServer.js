/**
 * @description 抽奖服务
 */
import useRoomBaseServer from '../room/roombase.server';
import lotteryApi from '../../request/lottery';
import BaseServer from '../common/base.server';
import useMsgServer from '@/domain/common/msg.server.js';

const roomServerState = useRoomBaseServer().state;

const LOTTERY_PUSH = 'lottery_push'; //发起抽奖
const LOTTERY_RESULT_NOTICE = 'lottery_result_notice'; //抽奖结束(带结果)
class LotteryServer extends BaseServer {
  constructor(opt = {}) {
    super();
    console.log('useLotteryServeruseLotteryServeruseLotteryServer');
    this._roomId = roomServerState.watchInitData.interact.room_id;
    if (opt.mode === 'watch') {
      this.listenMsg();
    }
  }
  // 监听消息
  listenMsg() {
    console.log('listenMsglistenMsglistenMsglistenMsg2');
    console.log(useMsgServer().curMsgInstance);
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      console.log(
        '抽奖抽奖抽奖抽奖抽奖抽奖抽奖抽奖抽奖抽奖抽奖抽奖抽奖抽奖抽奖的消息:',
        `${msg.data.type ? 'type:' : 'event_type'}:${msg.data.type || msg.data.event_type}`,
        msg
      );
      switch (msg.data.event_type || msg.data.type) {
        //【分组创建/新增完成】
        case LOTTERY_PUSH:
          this.$emit(LOTTERY_PUSH, msg);
          break;
        case LOTTERY_RESULT_NOTICE:
          this.$emit(LOTTERY_RESULT_NOTICE, msg);
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
    const switch_id = roomServerState.watchInitData.switch.switch_id;
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

export default function useLotteryServer(opt) {
  // 暂不考虑单例
  return new LotteryServer(opt);
}
