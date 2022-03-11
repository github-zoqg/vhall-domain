/**
 * 观看端点赞服务
 * @returns
 */
import { praiseApi } from '../../request/index';
import BaseServer from '@/domain/common/base.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import useRoomBaseServer from '@/domain/room/roombase.server.js';

const msgServer = useMsgServer();
const roomBaseServer = useRoomBaseServer();

class PraiseServer extends BaseServer {
  constructor() {
    super();
    this.state = {
      praiseTotalNum: roomBaseServer.state.priseLike.total
    };
    this.listenMsg();
  }
  listenMsg() {
    // 房间消息
    msgServer.$onMsg('CHAT', msg => {
      if (msg.data.type === 'permit' && msg.data.event_type == 'customPraiseTotal') {
        this.$emit('customPraise', msg.data);
      }
    });
    // 后端发消息，前端不用自己发消息了
    // msgServer.$onMsg('CUSTOM_MSG', msg => {
    //   if (msg.data.type === 'customPraise') {
    //     console.log(msg, '???1234325346')
    //     // this.$emit('customPraise', msg.data);
    //   }
    // });
  }
  // 点赞
  postPraiseIncrement(params = {}) {
    return praiseApi.postPraiseIncrement(params).then(res => {
      // 后端发消息，前端不用自己发消息了
      // if (res.code == 200) {
      //   if (roomBaseServer.state.configList['ui.hide_chat_history'] == '1') {
      //     const msgData = {
      //       type: 'permit',
      //       event_type: 'customPraise',
      //       text_content: '',
      //       num: params.num,
      //       visitorId: roomBaseServer.state.watchInitData.visitor_id
      //     };
      //     const context = {};
      //     msgServer.sendChatMsg(msgData, context);
      //     return;
      //   }
      //   msgServer.sendCustomMsg({
      //     type: 'customPraise',
      //     num: params.num,
      //     visitorId: roomBaseServer.state.watchInitData.visitor_id
      //   });
      // }
      return res;
    });
  }
}

export default function usePraiseServer() {
  return new PraiseServer();
}
