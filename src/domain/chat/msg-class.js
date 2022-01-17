let count = 0;
let count2 = 0;
let count3 = 0;
export default class Msg {
  constructor(params) {
    this.data = {};
  }
  //给消息添加文本
  addText() {}

  addImge() {}
  addReply() {}
  addAt() {}
  //私有方法，组装消息用于渲染（暂时按照的h5版本的,大致数据一致，具体业务逻辑操作有差异，后续返回一个promise，并返回未处理的原始数据，由视图自己决定如何处理）
  static _handleGenerateMsg(item = {}) {
    let resultMsg = {
      type: item.data.type,
      avatar: item.context.avatar ? item.context.avatar : this.state.defaultAvatar,
      sendId: item.sender_id || item.sourceId,
      showTime: item.context.showTime,
      nickname: item.context.nickname,
      roleName: item.context.role_name,
      sendTime: item.date_time,
      content: item.data,
      replyMsg: item.context.reply_msg,
      atList: item.context.atList,
      msgId: item.msg_id,
      channel: item.channel_id,
      isHistoryMsg: true
    };
    if (item.data.event_type) {
      resultMsg = {
        ...resultMsg,
        type: item.data.event_type,
        event_type: item.data.event_type,
        content: {
          source_status: item.data.source_status,
          gift_name: item.data.gift_name,
          gift_url: item.data.gift_url
        }
      };
    }
    return resultMsg;
  }
}
