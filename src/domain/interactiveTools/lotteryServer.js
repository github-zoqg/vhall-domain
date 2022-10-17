/**
 * @description 抽奖
 */
import useRoomBaseServer from '../room/roombase.server';
import lotteryApi from '../../request/lottery';
import useMsgServer from '../common/msg.server';
import BaseServer from '../common/base.server';
class LotteryServer extends BaseServer {
  constructor(opt = {}) {
    super();
    const watchInitData = useRoomBaseServer().state.watchInitData;
    this._roomId = watchInitData.interact.room_id;
    this._webinarId = watchInitData.webinar.id;
    this.state = {
      iconVisible: false, // icon是否显示
      docVisible: false // 小红点是否显示
    }
    this.listenMsg();
  }
  //对外暴露通知名称
  Events = {
    LOTTERY_PUSH: 'lottery_push', // 开始抽奖
    LOTTERY_RESULT_NOTICE: 'lottery_result_notice', // 抽奖结果
    LOTTERY_WIN: 'lottery_win', // 中奖
    LOTTERY_MISS: 'lottery_miss', // 未中奖
    LOTTERY_SUBMIT: 'lottery_submit', // 提交领奖
  };

  // 监听消息
  listenMsg() {
    console.log('监听了 抽奖消息')
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      switch (msg.data.event_type || msg.data.type) {
        //【分组创建/新增完成】
        case this.Events.LOTTERY_PUSH:
          console.log('开始抽奖:', msg)
          // wap icon显示数量+1
          !this.state.iconVisible && this.changeIconShowNum(true)
          this.state.iconVisible = true
          this.state.docVisible = true
          this.$emit(this.Events.LOTTERY_PUSH, msg);
          break;
        case this.Events.LOTTERY_RESULT_NOTICE:
          console.log('抽奖结果:', msg)
          // wap icon显示数量+1
          !this.state.iconVisible && this.changeIconShowNum(true)
          this.state.iconVisible = true
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
    await this.getPrizeList();
    this.getQualifiedNum();
  }

  // 检查当前的抽奖状态
  checkLottery(lotteryId) {
    const params = {}
    if (lotteryId) params.lottery_id = lotteryId
    return lotteryApi.checkLottery(params);
  }

  // 参加口令抽奖
  joinLottery(lotteryId) {
    return lotteryApi.joinLottery({
      lottery_id: lotteryId,
      room_id: this._roomId
    }).then(res => {

      return res
    });
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
  checkLotteryResult(lotteryId = '') {
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
  // 获取中奖人信息
  getLotteryUserInfo() {
    return lotteryApi.getLotteryUserInfo({
      room_id: this._roomId
    });
  }
  // 获取中奖人信息
  getLotteryUserDetail(lotteryId = '') {
    return lotteryApi.getLotteryUserDetail({
      room_id: this._roomId,
      lottery_id: lotteryId,
    });
  }
  // 获取抽奖历史(处理请求状态)
  getLotteryHistory() {
    return lotteryApi.getLotteryHistory({
      show_all: 1
    }).then(res => {
      if (res.code === 200 && res.data && Array.isArray(res.data)) {
        return res.data
      } else {
        console.error('抽奖历史接口异常: ', res)
        return []
      }
    }).catch(err => {
      console.error('抽奖历史接口异常: ', err)
      return []
    })
  }

  // 初始化按钮状态
  initIconStatus() {
    return this.getLotteryHistory().then(list => {
      if (list.length) {
        // wap icon显示数量+1
        !this.state.iconVisible && this.changeIconShowNum(true)
        this.state.iconVisible = true // 有历史抽奖显示icon
        const lastLottery = list[0] // 倒序排列
        const winLotteryList = list.filter(lot => lot.win === 1 && lot.take_award === 0 && lot.need_take_award === 1) // 中奖且必须领奖,未领奖
        this.state.docVisible = (lastLottery.lottery_status === 0 || winLotteryList.length)
      } else {
        this.state.docVisible = false
      }
      return list
    })
  }

  // change wap右侧展示icon数量
  changeIconShowNum(status) {
    useRoomBaseServer().setShowIconNum(status)
  }

}

export default function useLotteryServer(opt) {
  if (!LotteryServer.instance) {
    LotteryServer.instance = new LotteryServer(opt);
  }
  return LotteryServer.instance;
}
