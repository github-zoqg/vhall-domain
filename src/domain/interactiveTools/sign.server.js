/**
 * 礼物服务
 * @returns
 */
import BaseServer from '@/domain/common/base.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import { watchSignApi } from '@/request/index.js';
class SignServer extends BaseServer {
  constructor() {
    super();
    this.state = {};
  }

  setState(key, value) {
    this.state[key] = value;
  }

  listenMsg() {
    // 房间消息
    useMsgServer().$onMsg('ROOM_MSG', rawMsg => {
      let temp = Object.assign({}, rawMsg);

      if (typeof temp.data !== 'object') {
        temp.data = JSON.parse(temp.data);
        temp.context = JSON.parse(temp.context);
      }
      console.log(temp, '原始消息');
      const { type = '' } = temp.data || {};
      switch (type) {
        // 开始签到
        case 'sign_in_push':
          this.$emit('sign_in_push', temp);
          break;
        // 签到结束
        case 'sign_end':
          this.$emit('sign_in_push', temp);
          break;
        // 签到关闭
        case 'sign_in_push':
          this.$emit('live_over', temp);
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

  sign(params) {
    return watchSignApi.sign(params);
  }

  // sendGift(params) {
  //   return watchSignApi.sendGift(params);
  // }
}

export default function useSignServer() {
  return new SignServer();
}
