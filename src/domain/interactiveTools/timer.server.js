import BaseServer from '@/domain/common/base.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import { liveTimerApi } from '@/request/index.js';
/**
 * 计时器服务
 * @returns
 */
class timerServer extends BaseServer {
  constructor() {
    if (typeof timerServer.instance === 'object') {
      return timerServer.instance;
    }
    super();
    this.state = {};
    timerServer.instance = this;
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
        // 计时器开始
        case 'timer_start':
          this.$emit('timer_start', temp);
          break;
        // 计时器结束
        case 'timer_end':
          this.$emit('timer_end', temp);
          break;
        // 计时器重置
        case 'timer_reset':
          this.$emit('timer_reset', temp);
          break;
        // 计时器继续
        case 'timer_resume':
          this.$emit('timer_resume', temp);
          break;
        // 直播结束
        case 'live_over':
          this.$emit('timer_end', temp);
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

  timerCreate(params) {
    return liveTimerApi.timerCreate(params);
  }

  getTimerInfo(params) {
    return liveTimerApi.getTimerInfo(params);
  }

  timerEdit(params) {
    return liveTimerApi.timerEdit(params);
  }
}

export default function useTimerServer() {
  return new timerServer();
}
