/**
 * 礼物服务
 * @returns
 */
import BaseServer from '@/domain/common/base.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import { watchSignApi } from '@/request/index.js';
class SignServer extends BaseServer {
  constructor() {
    if (typeof SignServer.instance === 'object') {
      return SignServer.instance;
    }
    super();
    this.state = {};
    SignServer.instance = this;
    this.listenMsg()
    return this;
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
      // console.log(temp, '原始消息');
      const { type = '' } = temp.data || {};
      switch (type) {
        // 开始签到
        case 'sign_in_push':
          this.$emit('sign_in_push', temp);
          break;
        // 签到结束
        case 'sign_end':
          this.$emit('sign_end', temp);
          break;
        // 直播结束
        case 'live_over':
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

  getSignInfo(params) {
    return watchSignApi.signInfo(params).then(res => {
      return res;
    });
  }

  signStart(params) {
    return watchSignApi.signStart(params).then(res => {
      return res;
    });
  }

  signClose(params) {
    return watchSignApi.signClose(params).then(res => {
      return res;
    });
  }

  getSignRecordList(params) {
    return watchSignApi.getSignRecordList(params);
  }
}

export default function useSignServer() {
  return new SignServer();
}
