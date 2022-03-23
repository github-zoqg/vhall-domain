import { cash as cashApi } from '@/request/index.js';

class CashServer {
  static getInstance() {
    if (!this.instance) {
      this.instance = new CashServer();
    }
    return this.instance;
  }

  constructor() {
    this.state = {
      cashInfo: {}, // 提现账户信息
      cashList: [], // 提现列表
      wxInfo: {} // 微信绑定情况
    };

    return this;
  }

  // 获取提现信息
  getCashInfo(data) {
    return cashApi
      .getCashInfo(data)
      .then(res => {
        if (res.code === 200) {
          this.state.cashInfo = res.data;
        }
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  // 获取提现列表
  getCashList(data) {
    return cashApi
      .getCashList(data)
      .then(res => {
        if (res.code === 200) {
          this.state.cashList = res.data.list;
        }
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  // 获取微信绑定信息 是否绑定 头像 昵称
  checkWithDrawal(data) {
    return cashApi
      .checkWithDrawal(data)
      .then(res => {
        if (res.code === 200) {
          this.state.wxInfo = res.data;
        }
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  // 获取微信扫码的key值
  getBindKey(data) {
    return cashApi
      .getBindKey(data)
      .then(res => {
        if (res.code === 200) {
          // this.state.drawInfo = res.data;
        }
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  // 微信扫码绑定情况
  withdrawIsBind(data) {
    return cashApi
      .withdrawIsBind(data)
      .then(res => {
        if (res.code === 200) {
          // this.state.drawInfo = res.data;
        }
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  // 账户收益-提现
  withdraw(data) {
    return cashApi
      .withdraw(data)
      .then(res => {
        if (res.code === 200) {
          // this.state.drawInfo = res.data;
        }
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  // 账户收益-提现-发送手机验证码
  withdrawSendCode(data) {
    return cashApi.withdrawSendCode(data)
  }

  // 绑定手机号 发送验证码
  sendCode(data) {
    return cashApi
      .sendCode(data)
      .then(res => {
        if (res.code === 200) {
          // this.state.drawInfo = res.data;
        }
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  // wap提现校验
  withdrawalWap(data) {
    return cashApi
      .withdrawalWap(data)
      .then(res => {
        if (res.code === 200) {
          // this.state.drawInfo = res.data;
        }
        return res;
      })
      .catch(err => {
        return err;
      });
  }
}

export default function useCashServer() {
  return CashServer.getInstance();
}
