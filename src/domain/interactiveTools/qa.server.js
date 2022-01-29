import BaseServer from '@/domain/common/base.server.js';
import { qa } from '@/request/index.js';
import { textToEmojiText } from '@/domain/chat/emoji.js';

/**
 * 问答服务
 * @returns
 */

class QaServer extends BaseServer {
  constructor() {
    if (typeof QaServer.instance === 'object') {
      return QaServer.instance;
    }
    super();

    this.state = {
      List: [
        { text: '未回复', count: 0 },
        { text: '直播中回答', count: 0 },
        { text: '文字回复', count: 0 },
        { text: '不处理', count: 0 }
      ],
      baseObj: {}, //主办方信息
      awaitList: [], // 待处理
      textDealList: [], // 文字回复
      audioList: [], // 直播中回答
      noDealList: [], // 不处理
      activeObj: {} // 当前正在展示的信息
    };

    QaServer.instance = this;
    return this;
  }

  InitChatMess(params = {}) {
    return qa.list.InitChatMess(params).then(res => {
      if (res.code == 200) {
        this.state.baseObj = res.data;
        sessionStorage.setItem('interact_token', res.data.interact.interact_token);
      }
      return res;
    });
  }

  v3GetQa(params = {}) {
    return qa.list.v3GetQa(params);
  }

  v3CloseQa(params = {}) {
    return qa.list.v3CloseQa(params);
  }

  v3GetQaNum(params = {}) {
    return qa.list.v3GetQaNum(params);
  }

  v3ReplayUserQu(params = {}) {
    return qa.list.v3ReplayUserQu(params);
  }

  getAutherQa(params = {}) {
    return qa.list.getAutherQa(params).then(res => {
      if (res.code == 200) {
        if (res.data && res.data.list) {
          res.data.list.forEach(item => {
            if (item.content) {
              item.content = textToEmojiText(item.content);
            }
          });

          const { type } = params;

          switch (type) {
            case 0:
              this.state.awaitList = res.data.list;
              this.state.List[0].count = res.data.total;
              this.state.activeObj = Object.assign(this.state.activeObj, {
                active: 0,
                count: res.data.total
              });
              break;
            case 1:
              this.state.noDealList = res.data.list;
              this.state.List[3].count = res.data.total;
              this.state.activeObj.count = res.data.total;
              break;
            case 2:
              this.state.audioList = res.data.list;
              this.state.List[1].count = res.data.total;
              this.state.activeObj.count = res.data.total;
              break;
          }
        }
      }
      return res;
    });
  }

  sendPrivateMsg(params = {}) {
    return qa.list.sendPrivateMsg(params);
  }

  v3GetTextReply(params = {}) {}

  v3Revoke(params = {}) {}

  getPrivateList(params = {}) {
    return qa.list.getPrivateList(params).then(res => {
      this.state.priteChatList = res.data.list;
      return res;
    });
  }

  v3GetPrivCon(params = {}) {}

  v3SetUser(params = {}) {}
}

export default function useQaServer() {
  return new QaServer();
}
