/**
 * 独立报名表单
 * @returns
 */
import BaseServer from '@/domain/common/base.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import { entryformApi } from '@/request/index.js';

class entryformServer extends BaseServer {
  constructor() {
    if (typeof entryformServer.instance === 'object') {
      return entryformServer.instance;
    }
    super();

    this.state = {};

    this.listenMsg();

    entryformServer.instance = this;
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
        // 计时器开始
        //  case 'timer_start':
        //    this.$emit('timer_start', temp);
        //    break;

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
        //  case 'timer_pause':
        //    this.$emit('timer_pause', temp);
        //    break;
        default:
          break;
      }
    });
  }

  initGrayBefore(params) {
    return entryformApi.initGrayBefore(params);
  }

  verifyOpenLink(params) {
    return entryformApi.verifyOpenLink(params);
  }

  watchInit(params) {
    return entryformApi.watchInit(params);
  }
}

export default function useEntryformServer() {
  return new entryformServer();
}
