/**
 * 礼物服务
 * @returns
 */
import BaseServer from '@/domain/common/base.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import { giftsApi } from '@/request/index.js';
class giftsServer extends BaseServer {
  constructor() {
    if (typeof giftsServer.instance === 'object') {
      return giftsServer.instance;
    }
    super();

    this.state = {};

    this.listenMsg();

    giftsServer.instance = this;
    return this;
  }

  setState(key, value) {
    this.state[key] = value;
  }

  /**
   * 监听消息服务
   */
  listenMsg() {
    // 房间消息
    useMsgServer().$onMsg('ROOM_MSG', rawMsg => {
      let temp = Object.assign({}, rawMsg);
      if (typeof temp.data !== 'object') {
        temp.data = JSON.parse(temp.data);
        temp.context = JSON.parse(temp.context);
      }
      console.log('domain giftsServer---------->', temp);

      const { type = '' } = temp.data || {};
      switch (type) {
        case 'timer_start': // 计时器开始
          this.$emit('timer_start', temp);
          break;
        case 'gift_send_success': //接收送礼物消息
          this.$emit('gift_send_success', temp);
          break;
        default:
          break;
      }
    });
    // 自定义消息
    useMsgServer().$onMsg('CUSTOM_MSG', rawMsg => {
      let temp = Object.assign({}, rawMsg);

      if (typeof temp.data !== 'object') {
        temp.data = JSON.parse(temp.data);
        temp.context = JSON.parse(temp.context);
      }
      console.log(temp, '原始消息');
      const { type = '' } = temp.data || {};
      switch (type) {
        // 计时器暂停
        case 'timer_pause':
          this.$emit('timer_pause', temp);
          break;
        default:
          break;
      }
    });
  }

  queryGiftsList(params) {
    return giftsApi.queryGiftsList(params);
  }

  sendGift(params) {
    return giftsApi.sendGift(params);
  }
}

export default function useGiftsServer() {
  return new giftsServer();
}
