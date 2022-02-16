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
  }
  listenMsg() {
    // 房间消息
    msgServer.$onMsg('CHAT', msg => {
      if (msg.data.type === 'customPraise') {
        this.$emit('customPraise', msg.data);
      }
    });
    msgServer.$onMsg('CUSTOM_MSG', msg => {
      if (msg.data.type === 'customPraise') {
        this.$emit('customPraise', msg.data);
      }
    });
  }
  // 点赞
  postPraiseIncrement(params = {}) {
    return praiseApi.postPraiseIncrement(params).then(res => {
      if (res.code == 200) {
        if (roomBaseServer.state.configList['ui.hide_chat_history'] == '1') {
          const msgData = {
            type: 'permit',
            event_type: 'customPraise',
            text_content: '',
            num: params.num,
            visitorId: roomBaseServer.state.watchInitData.visitor_id
          };
          const context = {};
          msgServer.sendChatMsg(msgData, context);
          return;
        }
        msgServer.sendCustomMsg({
          type: 'customPraise',
          num: params.num,
          visitorId: roomBaseServer.state.watchInitData.visitor_id
        });
      }
      return res;
    });
  }
}

export default function usePraiseServer() {
  return new PraiseServer();
}
