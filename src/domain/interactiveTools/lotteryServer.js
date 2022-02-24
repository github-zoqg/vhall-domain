/**
 * @description 抽奖服务
 */
import useRoomBaseServer from '../room/roombase.server';
import lotteryApi from '../../request/lottery';
import useMsgServer from '../common/msg.server';
import BaseServer from '../common/base.server';

const LOTTERY_PUSH = 'lottery_push';
const LOTTERY_RESULT_NOTICE = 'lottery_result_notice';
class LotteryServer extends BaseServer {
  constructor(opt) {
    super();
    const watchInitData = useRoomBaseServer().state.watchInitData;
    this._roomId = watchInitData.interact.room_id;
    this._webinarId = watchInitData.webinar.id;
    if (opt?.mode === 'watch') {
      this.listenMsg();
    }
  }
  //对外暴露通知名称
  Events = {
    LOTTERY_PUSH: 'lottery_push',
    LOTTERY_RESULT_NOTICE: 'lottery_result_notice'
  };
  // 监听消息
  listenMsg() {
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      switch (msg.data.event_type || msg.data.type) {
        //【分组创建/新增完成】
        case LOTTERY_PUSH:
          this.$emit(this.Events.LOTTERY_PUSH, msg);
          break;
        case LOTTERY_RESULT_NOTICE:
          this.$emit(this.Events.LOTTERY_RESULT_NOTICE, msg);
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

  // 检测是否已提交领奖信息
  getWinnerList(lotteryId) {
    return lotteryApi.getWinnerList({
      room_id: this._roomId,
      lottery_id: lotteryId
    });
  }

  // 检测是否已提交领奖信息
  checkLotteryResult(lotteryId) {
    return lotteryApi.checkLotteryResult({
      lottery_id: lotteryId
    });
  }
  // 获取表单信息
  getDrawPrizeInfo() {
    return lotteryApi.getDrawPrizeInfo({
      webinar_id: this._webinarId
    });
  }

  // 获取表单信息
  acceptPrize(params) {
    return lotteryApi.acceptPrize({
      room_id: this._roomId,
      ...params
    });
  }
}

export default function useLotteryServer(opt) {
  if (!LotteryServer.instance) {
    LotteryServer.instance = new LotteryServer(opt);
  }
  return LotteryServer.instance;
}
