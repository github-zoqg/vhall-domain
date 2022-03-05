import BaseServer from '@/domain/common/base.server';
import useMsgServer from '@/domain/common/msg.server.js';
import { subscribeApi } from '../../request/index';

class SubscribeServer extends BaseServer {
  constructor() {
    super();
    this.state = {};
    this.listenMsg();
  }
  listenMsg() {
    const msgServer = useMsgServer();
    // 房间消息
    msgServer.$onMsg('ROOM_MSG', msg => {
      if (msg.data.type == 'live_start') {
        this.$emit('live_start', msg.data);
      }

      if (msg.data.type == 'pay_success') {
        this.$emit('pay_success', msg.data);
      }

      if (msg.data.type == 'live_over') {
        window.location.reload();
      }
    });
  }
  // 鉴权
  watchAuth(params = {}) {
    return subscribeApi.watchAuth(params).then(res => {
      return res;
    });
  }

  // 支付
  payWay(params = {}) {
    return subscribeApi.payWay(params).then(res => {
      return res;
    });
  }
}

export default function useSubscribeServer() {
  return new SubscribeServer();
}
