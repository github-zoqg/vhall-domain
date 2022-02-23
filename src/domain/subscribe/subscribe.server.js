import BaseServer from '@/domain/common/base.server';
import useMsgServer from '@/domain/common/msg.server.js';
import { subscribeApi } from '../../request/index';

class SubscribeServer extends BaseServer {
  constructor() {
    super();
    this.state = {};
  }
  listenMsg() {
    const msgServer = useMsgServer();
    // 房间消息
    msgServer.$onMsg('CHAT', msg => {
      if (msg.data.type === 'live_start') {
        this.$emit('live_start', msg.data);
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
