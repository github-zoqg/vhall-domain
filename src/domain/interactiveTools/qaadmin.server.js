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
        { text: '未回复', count: 0, page: 1, status: 'UNANSWER' },
        { text: '已回复', count: 0, page: 1, status: 'TEXTANSWER' },
        { text: '不处理', count: 0, page: 1, status: 'UNHANDLE' },
        { text: '标记为直播中回答', count: 0, page: 1, status: 'LIVEANSWER' }
      ],
      baseObj: {}, //主办方信息
      awaitList: [], // 待处理
      textDealList: [], // 已回复
      audioList: [], // 标记为直播中回答
      noDealList: [], // 不处理
      activeObj: {}, // 当前正在展示的信息
      onlyChatMess: {}, // 当前私聊对象
      priteChatList: [], // 私聊列表
      pageSize: 20,
      qaName: '问答', // 修改[问答]显示名称，默认为“问答”
      questionIds: [], // 已经选中的待处理问题Ids
      isAllChecked: false // 是否本页已选中
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
        const { count, page } = this.state.List[0]
        if (count < this.state.pageSize * page) {
          msgData.user_id = msgData.account_id
          msgData.content = emojiToText(msgData.content);
          this.state.awaitList.push(msgData);
        }
        this.state.List[0].count++;
      } else if (msgData.type == 'question_answer_open' || msgData.type == 'question_answer_close' || msgData.type == 'question_answer_set') {
        this.state.qaName = msgData.name
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

  // 设定列表选项 的 选中状态值
  static _defaultCheckStatusByList(data = [], targetIds) {
    data.map(item => {
      if (targetIds.indexOf(item.id) != -1) {
        // 选择本页记录里有数据
        item.isCheckBox = true
      } else {
        item.isCheckBox = false
      }
      // 若之前设定item.isCheckBox为null，默认为false
      if (item.isCheckBox == null || item.isCheckBox == undefined) {
        item.isCheckBox = false
      }
      return item
    });
    return data
  }


  // 判定选中问题集合Ids中，是否包含当前页的问题Ids
  static isIncludeQuestionIds(questionList, questionIds) {
    const qaIds = questionList.map(item => { return item.id })
    let count = 0
    qaIds.forEach(item => {
      if (!questionIds.includes(item)) {
        count++;
      }
    })
    return count > 0
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

  // 主持人答复观众的提问
  replyUserQuestion(params = {}) {
    console.log('qa domain replyUserQuestion-------->', params, this.state.awaitList);
    return qa.list.replyUserQuestion(params).then(res => {
      if (res.code == 200) {
        // params.type：回复类型-消息类型，1-忽略；2-转给主持人即语音回复；3-文字回复。
        if (params.type == 1) {
          // 未回复消息列表总数-1 & 当前数据移除，不处理列表总数+1
          this.state.List[0].count--;
          if (this.state.List[0].count <= 0) {
            this.state.List[0].count = 0;
          }
          this.state.List[2].count++;
          let questionIndex = QaAdminServer._findMsgItemByList(this.state.awaitList, params.question_id);
          this.state.awaitList.splice(questionIndex, 1);
        } else if (params.type == 2) {
          // 未回复消息列表总数-1 & 当前数据移除，直播中回答总数+1
          if (this.state.List[0].count == 0) {
            this.state.List[0].count = 0;
          } else {
            this.state.List[0].count--;
          }
          let questionIndex = QaAdminServer._findMsgItemByList(this.state.awaitList, params.question_id);
          this.state.awaitList.splice(questionIndex, 1);
          this.state.List[3].count++;
        } else if (params.type == 3) {
          // 文字回复
          this.state.textDialogStatus = false;
          if (this.state.activeIndex != 1) {
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
            this.state.List[1].count++;
            this.state.List[this.state.sendMessage.activeDom].count--;
            if (this.state.List[this.state.sendMessage.activeDom].count <= 0) {
              this.state.List[this.state.sendMessage.activeDom].count = 0;
            }
          }
        } else {
        }
      } else if (res.code === 513123) {
        // 异常情况下，关闭弹出框
        this.state.textDialogStatus = false
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
          // 原来数组顺序 0 - 未回复；1-标记为直播中回答；2-文字回复；3-不处理
          // 现在数组顺序 0 - 未回复；1-文字回复；2-不处理；3-标记为直播中回答
          switch (type) {
            case 0:
              this.state.awaitList = QaAdminServer._defaultCheckStatusByList(res.data.list, this.state.questionIds)
              this.state.List[0].count = res.data.total;
              if (this.state.activeIndex == 0) {
                this.state.List[this.state.activeIndex].count = res.data.total;
              }
              break;
            case 1:
              // 不处理消息列表
              this.state.noDealList = res.data.list;
              this.state.List[2].count = res.data.total;
              if (this.state.activeIndex == 2) {
                this.state.List[this.state.activeIndex].count = res.data.total;
              }
              break;
            case 2:
              this.state.audioList = res.data.list;
              this.state.List[3].count = res.data.total;
              if (this.state.activeIndex == 3) {
                this.state.List[this.state.activeIndex].count = res.data.total;
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
        // 原来数组顺序 0 - 未回复；1-标记为直播中回答；2-文字回复；3-不处理
        // 现在数组顺序 0 - 未回复；1-文字回复；2-不处理；3-标记为直播中回答
        this.state.textDealList = QaAdminServer._defaultCheckStatusByList(res.data.list, this.state.questionIds)
        this.state.List[1].count = res.data.total;
        if (this.state.activeIndex == 1) {
          this.state.List[1].count = res.data.total;
        }
      }
      return res;
    });
  }

  getQuestionAnswer(params = {}) {
    // const queryStatusList = [0, 3, 1, 2]; //当前数组对应查询类型为 ['未回复', '已回复', '不处理', '在直播中回答']  => params.status 即是 当前数组值传入
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
        if (params.status === 1) {
          // 不处理 noDealList
          this.state.List[2].count = res.data.total;
          this.state.noDealList = res.data.list;
        } else if (params.status === 2) {
          // 直播间回复 audioList
          this.state.List[3].count = res.data.total;
          this.state.audioList = res.data.list;
        } else if (params.status === 3) {
          // 已回复 textDealList
          this.state.List[1].count = res.data.total;
          this.state.textDealList = QaAdminServer._defaultCheckStatusByList(res.data.list, this.state.questionIds)
        } else {
          // 待处理 awaitList
          this.state.List[0].count = res.data.total;
          this.state.awaitList = QaAdminServer._defaultCheckStatusByList(res.data.list, this.state.questionIds)
        }
      }
      return res;
    });
  }

  // 撤销回复
  revokeReply(params = {}) {
    return qa.list.revokeReply(params).then(res => {
      if (res.code == 200) {
        // 撤销回复后，修改对应集合的数据状态
        const listNames = ['awaitList', 'textDealList', 'noDealList', 'audioList']
        this.state[listNames[this.state.activeIndex]][params.father_index].answer[params.index].is_backout = 1;
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

  // 改变某一个选项的状态 （return null 表示不需要外面赋值）
  changeItemQuestionIds(checked, questionId, activeIndex) {
    const index = this.state.questionIds.indexOf(questionId)
    if (checked) {
      if (index == -1) {
        // 未设置过，可以push
        this.state.questionIds.push(questionId)
        // 通过选择的数据，判定当页是否全部选中
        if (activeIndex === 0 || activeIndex === 1) {
          return this.pageChangeAllCheck(activeIndex)
        } else {
          return null
        }
      } else {
        return null
      }
    } else {
      if (index != -1) {
        // 设置过，可以删除
        this.state.questionIds.splice(index, 1)
        // 通过选择的数据，判定当页是否全部选中
        if (activeIndex === 0 || activeIndex === 1) {
          return this.pageChangeAllCheck(activeIndex)
        } else {
          return null
        }
      } else {
        return null
      }
    }
  }

  // 全选 or 非全选
  changeAllQuestionIds(checked, activeIndex) {
    // 获取当前选中的tab情况
    if (checked) {
      if (activeIndex === 0) {
        // 未回复/待处理
        this.state.awaitList.map(item => item.isCheckBox = true)
        const qaIds = this.state.awaitList.map(item => { return item.id })
        // 已选中的内容，合并&去重
        this.state.questionIds = [...new Set(this.state.questionIds.concat(qaIds))]
      } else if (activeIndex === 1) {
        // 文字回复
        this.state.textDealList.map(item => item.isCheckBox = true)
        const qaIds = this.state.textDealList.map(item => { return item.id })
        // 已选中的内容，合并&去重
        this.state.questionIds = [...new Set(this.state.questionIds.concat(qaIds))]
      }
    } else {
      if (activeIndex === 0) {
        // 未回复/待处理
        this.state.awaitList.map(item => item.isCheckBox = false)
        const qaIds = this.state.awaitList.map(item => { return item.id })
        qaIds.forEach(item => {
          const index = this.state.questionIds.indexOf(item)
          if (index != -1) {
            this.state.questionIds.splice(index, 1)
          }
        })
      } else if (activeIndex === 1) {
        // 文字回复
        this.state.textDealList.map(item => item.isCheckBox = false)
        const qaIds = this.state.textDealList.map(item => { return item.id })
        qaIds.forEach(item => {
          const index = this.state.questionIds.indexOf(item)
          if (index != -1) {
            this.state.questionIds.splice(index, 1)
          }
        })
      }
    }
  }

  // 清空全选
  clearQuestionIds() {
    this.state.isAllChecked = false
    this.state.questionIds = []
  }

  // 切换分页的时候，更新全选状态等
  pageChangeAllCheck(activeIndex) {
    if (activeIndex === 0) {
      // 未回复/待处理 （当前列表中的问题ID，未在已选中数组里，当前全选状态重置为false，但是已选中数组-数据保留）
      const flag = !QaAdminServer.isIncludeQuestionIds(this.state.awaitList, this.state.questionIds)
      this.state.isAllChecked = flag
      return flag
    } else if (activeIndex === 1) {
      // 文字回复（当前列表中的问题ID，未在已选中数组里，当前全选状态重置为false，但是已选中数组-数据保留）
      const flag = !QaAdminServer.isIncludeQuestionIds(this.state.textDealList, this.state.questionIds)
      this.state.isAllChecked = flag
      return flag
    }
  }

  //  [发起端]批量更新问题状态
  updateBatchStatus(params = {}) {
    return qa.list.updateBatchStatus(params).then(res => {
      return res;
    });
  }

  // (标记为直播中回答 / 不处理) => 设置状态为未回复
  updateStatusToUNANSWER(item) {
    if (this.state.activeIndex === 3) {
      let questionIndex = QaAdminServer._findMsgItemByList(this.state.audioList, item.id);
      if (questionIndex !== null && questionIndex !== undefined) {
        this.state.List[3].count--;
        if (this.state.List[3].count <= 0) {
          this.state.List[3].count = 0;
        }
        this.state.List[0].count++;
        this.state.audioList.splice(questionIndex, 1);
      }
    } else if (this.state.activeIndex === 2) {
      let questionIndex = QaAdminServer._findMsgItemByList(this.state.noDealList, item.id);
      if (questionIndex !== null && questionIndex !== undefined) {
        this.state.List[2].count--;
        if (this.state.List[2].count <= 0) {
          this.state.List[2].count = 0;
        }
        this.state.List[0].count++;
        this.state.noDealList.splice(questionIndex, 1);
      }
    }
  }
  // (标记为直播中回答 / 不处理) => 设置状态为已回复
  updateStatusToTEXTANSWER(item) {
    if (this.state.activeIndex === 3) {
      let questionIndex = QaAdminServer._findMsgItemByList(this.state.audioList, item.id);
      if (questionIndex !== null && questionIndex !== undefined) {
        this.state.List[3].count--;
        if (this.state.List[3].count <= 0) {
          this.state.List[3].count = 0;
        }
        this.state.List[1].count++;
        this.state.audioList.splice(questionIndex, 1);
      }
    } else if (this.state.activeIndex === 2) {
      console.log('2222222222', this.state.noDealList, item.id)
      let questionIndex = QaAdminServer._findMsgItemByList(this.state.noDealList, item.id);
      if (questionIndex !== null && questionIndex !== undefined) {
        this.state.List[2].count--;
        if (this.state.List[2].count <= 0) {
          this.state.List[2].count = 0;
        }
        this.state.List[1].count++;
        console.log('2222222211', this.state.noDealList.length, questionIndex)
        this.state.noDealList.splice(questionIndex, 1);
        console.log('222222221122222222', this.state.noDealList.length, questionIndex)
      }
    }
  }
  // (未回复) => 设置状态为不处理 - 批量
  updateStatusToUNHANDLE(question_ids) {
    // 批量设置为不处理
    const list = question_ids.split(',') || []
    for (let i = 0; i < list.length; i++) {
      let questionIndex = QaAdminServer._findMsgItemByList(this.state.awaitList, list[i]);
      if (questionIndex !== null && questionIndex !== undefined) {
        this.state.List[0].count--;
        if (this.state.List[0].count <= 0) {
          this.state.List[0].count = 0;
        }
        this.state.List[2].count++;
        this.state.awaitList.splice(questionIndex, 1);
      }
    }
    // 清空选中过的数据
    this.state.questionIds = []
    this.state.isAllChecked = false
  }
  // 设置状态为直播中回答
  updateStatusToLIVEANSWER() {

  }

  // [发起端]批量删除问题及回复
  delQaAndAnswerMulti(params = {}) {
    return qa.list.delQaAndAnswerMulti(params).then(res => {
      if (res.code == 200) {
        const list = params.question_ids.split(',') || []
        for (let i = 0; i < list.length; i++) {
          let questionIndex = QaAdminServer._findMsgItemByList(this.state.textDealList, list[i]);
          if (questionIndex !== null && questionIndex !== undefined) {
            this.state.List[1].count--;
            if (this.state.List[1].count <= 0) {
              this.state.List[1].count = 0;
            }
            this.state.textDealList.splice(questionIndex, 1);
          }
        }
        if (list.length > 1) {
          // 批量多个 - 清空选中过的数据
          this.state.questionIds = []
          this.state.isAllChecked = false
        } else {
          // 批量1个 or 多个
          const index = this.state.questionIds.indexOf(Number(list[0]))
          if (index != -1) {
            this.state.questionIds.splice(index, 0)
            if (this.state.questionIds.length == 0) {
              this.state.isAllChecked = false
            }
          }
        }
      }
      return res;
    });
  }

  // [发起端]修改问答显示名称
  updateQaShowName(params = {}) {
    return qa.list.updateQaShowName(params).then(res => {
      if (res.code == 200) {
        this.state.qaName = params.name
      }
      return res;
    });
  }


  // [发起端] 获取已设定的问答名称
  getQaShowName(params = {}) {
    return qa.list.getQaShowName(params).then(res => {
      if (res.code == 200) {
        this.state.qaName = res.data.name || '问答'
      }
      return res;
    });
  }

  // 关闭弹出框
  closeTextDialogStatus() {
    this.state.textDialogStatus = false
  }
}

export default function useQaAdminServer() {
  return new QaAdminServer();
}
