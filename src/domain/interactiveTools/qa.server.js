/**
 * 聊天服务
 * */
import BaseServer from '@/domain/common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import { qa } from '@/request/index.js';
import { debounce } from '@/utils';
class QaServer extends BaseServer {
  constructor() {
    if (typeof QaServer.instance === 'object') {
      return QaServer.instance;
    }
    super();
    const { interactToolStatus } = useRoomBaseServer().state;
    //消息sdk
    this.state = {};
    this.listenEvents();
    this.controller = null;
    QaServer.instance = this;
    return this;
  }
  Events = {
    QA_OPEN: 'question_answer_open',
    QA_CLOSE: 'question_answer_close',
    QA_CREATE: 'question_answer_create',
    QA_COMMIT: 'question_answer_commit'
  };
  //setSate
  setState(key, value) {
    QaServer.instance.state[key] = value;
  }
  //监听msgServer通知
  listenEvents() {
    const msgServer = useMsgServer();
    msgServer.$onMsg('ROOM_MSG', msg => {
      switch (msg.data.type) {
        //开启问答
        case this.Events.QA_OPEN:
          // if (!this.isSelfMsg(msg)) {
          this.$emit(this.Events.QA_OPEN, msg);
          // }
          break;
        //关闭问答
        case this.Events.QA_CLOSE:
          // if (!this.isSelfMsg(msg)) {
          this.$emit(this.Events.QA_CLOSE, msg);
          // }
          break;
        //收到问答
        case this.Events.QA_CREATE:
          this.$emit(this.Events.QA_CREATE, msg);
          break;
        //问答回复
        case this.Events.QA_COMMIT:
          this.$emit(this.Events.QA_COMMIT, msg);
          break;
      }
    });
  }
  // 判断是不是自己发的消息
  isSelfMsg(msg) {
    const { watchInitData } = useRoomBaseServer().state;
    return msg.sender_id == watchInitData.join_info.third_party_user_id;
  }
  //判断是不是发送给当前用户的消息
  isMyMsg(msg) {
    const { watchInitData } = useRoomBaseServer().state;
    console.log(msg.data.target_id, '-', watchInitData.join_info.third_party_user_id);
    return msg.data.target_id == watchInitData.join_info.third_party_user_id;
  }
  qaEnable() {
    const { watchInitData } = useRoomBaseServer().state;
    return qa.list.qaEnable({ room_id: watchInitData.interact.room_id });
  }

  qaDisable() {
    const { watchInitData } = useRoomBaseServer().state;
    return qa.list.qaDisable({ room_id: watchInitData.interact.room_id });
  }
  sendQaMsg(params) {
    const { watchInitData } = useRoomBaseServer().state;
    params.room_id = watchInitData.interact.room_id;
    return qa.list.sendQaMsg(params);
  }
  getHistoryQaMsg() {
    const { watchInitData } = useRoomBaseServer().state;
    return qa.list.getHistoryQaMsg({ room_id: watchInitData.interact.room_id });
  }
  getCurrentPlayQuestionNum(params = {}) {
    const { watchInitData } = useRoomBaseServer().state;
    return qa.list.getCurrentPlayQuestionNum({ room_id: watchInitData.interact.room_id });
  }
}

export default function useQaServer() {
  return new QaServer();
}
