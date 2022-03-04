import BaseServer from '@/domain/common/base.server.js';
// import VhallPaasSDK from '@/sdk/index.js';
import { qa } from '@/request/index.js';
import { textToEmojiText, emojiToText } from '@/utils/emoji';
// import useRoomBaseServer from '../room/roombase.server';
import useMsgServer from '../common/msg.server';

/**
 * 问答服务
 * @returns
 */

class QaAdminServer extends BaseServer {
  constructor() {
    if (typeof QaAdminServer.instance === 'object') {
      return QaAdminServer.instance;
    }
    super();

    this.state = {
      activeIndex: 0, // 当前正在展示的Dom
      textDialogStatus: false, // 是否显示输入框
      // 当前展示 提交信息集合
      sendMessage: {
        text: '',
        Radio: '1' // 信息类型
      },
      isSearch: false, // 是否是正在搜索数据
      // testAnswer: 2,
      // testAnswerSelects: [
      //   {
      //     label: '全部回答',
      //     value: 2
      //   },
      //   {
      //     label: '公开回答',
      //     value: 1
      //   },
      //   {
      //     label: '悄悄回答',
      //     value: 0
      //   }
      // ],
      exactSearch: {
        exactSearch0: '', // 待处理检索
        exactSearch1: '', // 直播中问答检索
        exactSearch2: '', // 文字回复检索
        exactSearch3: '' // 未处理检索
      },
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
      activeObj: {}, // 当前正在展示的信息
      onlyChatMess: {}, // 当前私聊对象
      priteChatList: [] // 私聊列表
    };

    this.chatInstance = null; // 聊天实例
    // this.privateChat = null;

    QaAdminServer.instance = this;
    return this;
  }

  // 修改数据
  setState(key, value) {
    this.state[key] = value;
  }

  //监听msgServer通知
  listenEvents() {
    const msgServer = useMsgServer()
    msgServer.$onMsg("ROOM_MSG", msg => {
      const msgData = msg.data
      if (msgData.type == 'question_answer_create') {
        // 发起端收到消息
        msgData.user_id = msgData.account_id
        msgData.content = emojiToText(msgData.content);
        this.state.awaitList.push(msgData);
        this.state.List[0].count = this.state.awaitList.length;
      }
    });
  }

  // 初始化聊天实例
  async initQaAdmin(params = {}, callbackFn) {

    this.listenEvents();

    // 使用侧可以添加回调函数
    if (callbackFn) {
      callbackFn(vhallchat);
    }
  }

  // 根据问题id查询索引值
  static _findMsgItemByList(data, question_id) {
    let index = data.findIndex(item => {
      return item.id == question_id;
    });
    return index;
  }

  /**
   * 文本内容回复
   * @param {*} item 回复的当前内容
   * @param {*} index 回复的信息索引
   */
  replayIsText(item, index) {
    this.state.sendMessage.text = '';
    this.state.sendMessage.Radio = '1';
    this.state.sendMessage = Object.assign(this.state.sendMessage, item, {
      activeDom: this.state.activeIndex,
      index: index
    });
    this.state.textDialogStatus = true;
  }

  handlerAnswer(status) {
    if (status == 'public') {
      this.state.sendMessage.Radio = 1;
    } else {
      this.state.sendMessage.Radio = 0;
    }
  }

  initChatMess(params = {}) {
    return qa.list.initChatMess(params).then(res => {
      if (res.code == 200) {
        this.state.baseObj = res.data;
        sessionStorage.setItem('interact_token', res.data.interact.interact_token);
      }
      return res;
    });
  }

  replyUserQuestion(params = {}) {
    console.log('qa domain replyUserQuestion-------->', params, this.state.awaitList);
    return qa.list.replyUserQuestion(params).then(res => {
      if (res.code == 200) {
        if (params.type == 1) {
          this.state.List[0].count--;
          if (this.state.List[0].count <= 0) {
            this.state.List[0].count = 0;
          }
          this.state.List[3].count++;
          let questionIndex = QaServer._findMsgItemByList(this.state.awaitList, params.question_id);
          this.state.awaitList.splice(questionIndex, 1);
        } else if (params.type == 2) {
          this.state.List[0].count--;
          let questionIndex = QaServer._findMsgItemByList(this.state.awaitList, params.question_id);
          this.state.awaitList.splice(questionIndex, 1);
          this.state.List[1].count++;
        } else if (params.type == 3) {
          this.state.textDialogStatus = false;
          if (this.state.activeIndex != 2) {
            if (this.state.sendMessage.activeDom == 0) {
              // 点击的是待处理的 Dom
              this.state.awaitList.splice(this.state.sendMessage.index, 1);
            } else if (this.state.sendMessage.activeDom == 1) {
              // 点击的是直播中回答 Dom
              this.state.audioList.splice(this.state.sendMessage.index, 1);
            } else {
              // 点击的是文字回复 Dom
              this.state.textDealList.splice(this.state.sendMessage.index, 1);
            }
            this.state.List[2].count++;
            this.state.List[this.state.sendMessage.activeDom].count--;
            if (this.state.List[this.state.sendMessage.activeDom].count <= 0) {
              this.state.List[this.state.sendMessage.activeDom].count = 0;
            }
          }
        } else {
        }
      }
      return res;
    });
  }

  getQuestionByStatus(params = {}) {
    return qa.list.getQuestionByStatus(params).then(res => {
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
              if (this.state.activeIndex == 0) {
                this.state.activeObj.count = res.data.total;
              }
              break;
            case 1:
              // 不处理消息列表
              this.state.noDealList = res.data.list;
              this.state.List[3].count = res.data.total;
              if (this.state.activeIndex == 3) {
                this.state.activeObj.count = res.data.total;
              }
              break;
            case 2:
              this.state.audioList = res.data.list;
              this.state.List[1].count = res.data.total;
              if (this.state.activeIndex == 1) {
                this.state.activeObj.count = res.data.total;
              }
              break;
          }
        }
      }
      return res;
    });
  }

  chatPrivateSendMessage(params = {}) {
    return qa.list.chatPrivateSendMessage(params);
  }

  getTextReply(params = {}) {
    return qa.list.getTextReply(params).then(res => {
      if (res.code == 200) {
        try {
          res.data.list.forEach(item => {
            if (item.content) {
              item.content = textToEmojiText(item.content);
            }
          });
        } catch (error) {
          console.warn(error, '聊天消息过滤错误');
        }
        this.state.textDealList = res.data.list;
        this.state.List[2].count = res.data.total;
        if (this.state.activeIndex == 2) {
          this.state.activeObj.count = res.data.total;
        }
      }
      return res;
    });
  }

  // 撤销回复
  revokeReply(params = {}) {
    return qa.list.revokeReply(params).then(res => {
      if (res.code == 200) {
        this.state.textDealList[params.father_index].answer[params.index].is_backout = 1;
      }
      return res;
    });
  }

  chatPrivateGetRankList(params = {}) {
    return qa.list.chatPrivateGetRankList(params).then(res => {
      this.state.priteChatList = res.data.list;
      if (!(this.state.onlyChatMess && this.state.onlyChatMess.type)) {
        this.state.onlyChatMess = this.state.priteChatList[0];
      }
      return res;
    });
  }

  chatPrivateGetList(params = {}) {
    return qa.list.chatPrivateGetList(params).then(res => {
      return res;
    });
  }

  setRankList(params = {}) {
    return qa.list.setRankList(params).then(res => {
      return res;
    });
  }
}

export default function useQaAdminServer() {
  return new QaAdminServer();
}
