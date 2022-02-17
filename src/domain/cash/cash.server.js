import { cash as cashApi } from '@/request/index.js';

class CashServer {
  constructor() {
    this.state = {
      cashInfo: {}, // 提现信息
      cashList: [], // 提现列表
    }

    return this;
  }

  // 获取提现信息
  getCashInfo(data) {
    return cashApi.getCashInfo(data).then(res => {
      if (res.code === 200) {
        this.state.cashInfo = res.data;
      }
      return res;
    }).catch(err => {
      return err;
    });
  }

  // 获取提现列表
  getCashList(data) {
    return cashApi.getCashList(data).then(res => {
      if (res.code === 200) {
        this.state.cashList = res.data.list;
      }
      return res;
    }).catch(err => {
      return err;
    });
  }
}

export default function useCashServer() {
  return new CashServer();
}
