/**
 * 礼物服务
 * @returns
 */
import BaseServer from '@/domain/common/base.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import { giftsApi } from '@/request/index.js';

const msgServer = useMsgServer();
class giftsServer extends BaseServer {
  constructor() {
    super();
    this.state = {};
  }

  setState(key, value) {
    this.state[key] = value;
  }

  listenMsg() {
    // 房间消息
    msgServer.$onMsg('ROOM_MSG', rawMsg => {
      let temp = Object.assign({}, rawMsg);

      if (typeof temp.data !== 'object') {
        temp.data = JSON.parse(temp.data);
        temp.context = JSON.parse(temp.context);
      }
      console.log(temp, '原始消息');
      const { type = '' } = temp.data || {};
      switch (type) {
        // 计时器开始
        case 'timer_start':
          this.$emit('timer_start', temp);
          break;
        default:
          break;
      }
    });
    // 自定义消息
    msgServer.$onMsg('CUSTOM_MSG', rawMsg => {
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
}

export default function useGiftsServer() {
  return new giftsServer();
}
