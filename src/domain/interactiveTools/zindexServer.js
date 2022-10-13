/**
 * @description 互动模块弹窗的层级
 */
class ZIndexServer {
  constructor() {
    this._zindexList = [1018, 1021, 1022, 1023, 1027, 1028, 1030, 1032]
    this._typeList = [
      'giftPay', // 礼物支付弹窗
      'lottery', // 抽奖弹窗
      'redPacket', // 红包弹窗 暂时和口令共用
      'reward', // 打赏弹窗
      'questionnaire', // 问卷弹窗
      'signIn' // 签到弹窗
    ]
    this.state = {
      zIndexMap: {}
    }
    this.refresh()
    // 初始化
  }
  refresh() {
    this._typeList.forEach((type, idx) => {
      this.state.zIndexMap[type] = this._zindexList[idx];
    })
  }
  setDialogZIndex(type) {
    const idx = this._typeList.indexOf(type)
    if (idx > -1) {
      this._typeList.splice(idx, 1);
    }
    this._typeList.push(type);
    this.refresh()
  }
}

export default function useZIndexServer() {
  if (!ZIndexServer.instance) {
    ZIndexServer.instance = new ZIndexServer()
  }
  return ZIndexServer.instance
}