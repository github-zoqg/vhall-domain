/**
 * @description 互动模块弹窗的层级
 */


class ZIndexServer {
  constructor() {
    this._zindexList = [18, 21, 22, 23, 27, 28, 30, 32]
    this._typeList = [
      'giftPay', // 礼物支付弹窗
      'lottery', // 抽奖弹窗
      'redPacket', // 红包弹窗
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
    console.log(this.state.zIndexMap)
  }
  setDialogZIndex(type) {
    console.log(this.state.zIndexMap)
    const idx = this._typeList.indexOf(type)
    if (idx > -1) {
      this._typeList.splice(idx, 1);
    }
    this._typeList.push(type);
    this.refresh()
    console.log(this.state.zIndexMap)
  }
}

export default function useZIndexServer() {
  if (!ZIndexServer.instance) {
    ZIndexServer.instance = new ZIndexServer()
  }
  return ZIndexServer.instance
}