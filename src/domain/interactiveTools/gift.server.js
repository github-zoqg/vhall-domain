/**
 * 礼物服务
 * @returns
 */
import BaseServer from '@/domain/common/base.server.js';
import roomBaseServer from '@/domain/room/roombase.server.js';
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

      const { type = '' } = temp.data || {};
      switch (type) {
        case 'gift_send_success': //接收送礼物消息
          this.$emit('gift_send_success', temp);
          break;
        default:
          break;
      }
    });
    // 自定义消息
    useMsgServer().$onMsg('CHAT', rawMsg => {
      let temp = Object.assign({}, rawMsg);

      if (typeof temp.data !== 'object') {
        temp.data = JSON.parse(temp.data);
        temp.context = JSON.parse(temp.context);
      }
      console.log(temp, '原始消息');
      const { event_type = '' } = temp.data || {};
      switch (event_type) {
        // 计时器暂停
        case 'free_gift_send':
          this.$emit('gift_send_success', temp);
          break;
        default:
          break;
      }
    });
  }

  queryGiftsList(params) {
    return giftsApi.queryGiftsList(params);
  }

  sendGift(params, msgContext) {
    // const { watchInitData } = roomBaseServer().state;
    // const msgData = {
    //   type: 'permit',
    //   event_type: 'free_gift_send',
    //   avatar: watchInitData.join_info.avatar,
    //   barrageTxt: '',
    //   text_content: '',
    //   nickname: watchInitData.join_info.nickname,
    //   role_name: 2,
    //   gift_name: msgContext.name,
    //   gift_url: msgContext.image_url,
    //   source_status: msgContext.source_status
    // };
    // const context = {
    //   avatar: watchInitData.join_info.avatar,
    //   nickname: watchInitData.join_info.nickname
    // };
    return giftsApi.sendGift(params);
    // .then(res => {
    //   if (res.code == 200) {
    //     useMsgServer().sendChatMsg(msgData, context);
    //     return res;
    //   }
    // });
  }
}

export default function useGiftsServer() {
  return new giftsServer();
}
