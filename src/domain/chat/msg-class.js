let count = 0;
let count2 = 0;
let count3 = 0;
export default class Msg {
  constructor(params) {
    this.generateMsg(params);
  }
  //组装消息
  generateMsg(params = {}) {
    let {
      avatar = '',
      sendId = '',
      nickname = '',
      type = 'text',
      showTime = '',
      roleName = '',
      content = {},
      sendTime = '',
      client = '',
      replyMsg = {},
      msgId = '',
      channel = '',
      atList = [],
      isHistoryMsg = false
    } = params;

    // 用户id
    this.type = type;
    this.avatar = avatar;
    this.sendId = sendId;
    this.nickname = nickname;
    this.roleName = roleName;
    this.content = content;
    this.showTime = showTime;
    this.sendTime = sendTime;
    this.client = client;
    this.count = count++;
    this.replyMsg = replyMsg;
    this.msgId = msgId;
    this.channel = channel;
    this.atList = atList;
    this.isHistoryMsg = isHistoryMsg;
  }
  createReply() {}
}
