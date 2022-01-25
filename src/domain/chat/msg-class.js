let count = 0;
import useRoomBaseServer from '../room/roombase.server';
const defaultAvatar = 'https://cnstatic01.e.vhall.com/3rdlibs/vhall-static/img/default_avatar.png';
export default class Msg {
  constructor(params) {
    const roomserver = useRoomBaseServer();
    const { avatar, nickname, role_name, user_id } = roomserver.state.watchInitData.join_info;
    //分组相关逻辑判断
    const { groupInitData = {} } = roomserver.state;
    this.data = {
      type: 'text',
      image_urls: []
    };
    this.context = {
      atList: [],
      replyMsg: {},
      avatar,
      nickname,
      role_name: groupInitData.isInGroup && groupInitData.join_role == 20 ? 20 : role_name,
      user_id
    };
  }
  //给消息添加文本
  setText(val) {
    this.data.barrageTxt = val.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    this.data.text_content = val;
  }
  //给消息添加图片
  setImge(imglist) {
    if (imglist.length < 1) {
      this.data.type = 'text';
    }
    this.data.image_urls = imglist;
  }
  //给消息添加回复相关信息
  setReply(replay = {}) {
    this.context.replay = replay;
  }
  //给消息添加@相关信息
  setAt(atlist = []) {
    this.context.atList = atlist;
  }

  //私有方法，组装消息用于渲染（暂时按照的h5版本的,大致数据一致，具体业务逻辑操作有差异，后续返回一个promise，并返回未处理的原始数据，由视图自己决定如何处理）
  static _handleGenerateMsg(item = {}) {
    let resultMsg = {
      type: item.data.type,
      avatar: item.context.avatar || defaultAvatar,
      sendId: item.sender_id || item.sourceId,
      showTime: item.context.showTime,
      nickname: item.nickname || item.context.nickname,
      roleName: item.context.role_name,
      sendTime: item.date_time,
      content: item.data,
      replyMsg: item.context.reply_msg || {},
      atList: item.context.atList || [],
      msgId: item.msg_id,
      channel: item.channel_id,
      isHistoryMsg: true,
      count: count++
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
