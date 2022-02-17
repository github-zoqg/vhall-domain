/**
 * 聊天服务
 * */
import { textToEmojiText } from './emoji';
import Msg from './msg-class';
import { im as iMRequest } from '@/request/index.js';
import BaseServer from '@/domain/common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import { debounce } from '@/utils';
//基础服务
const roomServer = useRoomBaseServer();
//消息服务
const msgServer = useMsgServer();
class ChatServer extends BaseServer {
  constructor() {
    if (typeof ChatServer.instance === 'object') {
      return ChatServer.instance;
    }
    super();

    const { roomId = '', roleName, avatar = '' } = roomServer.state.watchInitData;
    //消息sdk
    this.state = {
      //聊天记录
      chatList: [],
      //过滤的敏感词列表
      keywordList: [],
      //预览图片地址
      imgUrls: [],
      //当前用户禁言状态
      banned: 0, //1禁言 0取消禁言
      //当前频道全部禁言状态
      allBanned: 0, //1禁言 0取消禁言
      page: 0,
      limit: 10,
      roomId,
      avatar,
      roleName,
      curMsg: null //当前正在编辑的消息
    };
    this.listenEvents();
    this.controller = null;
    ChatServer.instance = this;
    return this;
  }

  //setSate
  setState(key, value) {
    this.state[key] = value;
  }
  //监听msgServer通知
  listenEvents() {
    msgServer.$onMsg('CHAT', rawMsg => {
      if (['text', 'image'].includes(rawMsg.data.type)) {
        //表情处理
        rawMsg.data.text_content = textToEmojiText(rawMsg.data.text_content);
        //格式化消息用于渲染并添加到消息列表
        this.state.chatList.push(Msg._handleGenerateMsg(rawMsg));
      }
      const { watchInitData } = roomServer.state;
      // 禁言某个用户
      if (rawMsg.data.type === 'disable') {
        console.log(roomServer.state);
        if (this.isMyMsg(rawMsg)) {
          this.state.banned = 1;
          console.log('handler', this.handlers);
          this.$emit('banned', this.state.banned);
        }
      }
      //取消禁言
      if (rawMsg.data.type === 'permit') {
        if (this.isMyMsg(rawMsg)) {
          this.state.banned = 0;
          this.$emit('banned', this.state.banned);
        }
      }
      // 开启全体禁言
      if (rawMsg.data.type === 'disable_all') {
        this.state.allBanned = 1;
        this.$emit('allBanned', this.state.allBanned);
      }
      // 关闭全体禁言
      if (rawMsg.data.type === 'permit_all') {
        this.state.allBanned = 0;
        this.$emit('allBanned', this.state.allBanned);
      }
    });
    msgServer.$on('changeChannel', () => {});
  }
  //判断是不是发送给当前用户的消息
  isMyMsg(msg) {
    const { watchInitData } = roomServer.state;
    console.log(msg.data.target_id, '-', watchInitData.join_info.third_party_user_id);
    return msg.data.target_id == watchInitData.join_info.third_party_user_id;
  }
  //接收聊天消息
  async getHistoryMsg(params = {}) {
    //请求获取聊天消息
    let historyList = await this.fetchHistoryData(params);
    console.log('historyList', historyList);
    let list = (historyList.data.list || [])
      .map(item => {
        //处理普通内容
        item.data.text_content &&
          (item.data.text_content = textToEmojiText(item.data.text_content));
        //处理图片预览
        item.data.image_urls && ChatServer._handleImgUrl.call(this, item.data.image_urls);

        //处理私聊列表
        if (
          item.context &&
          Array.isArray(item.context.at_list) &&
          item.context.at_list.length &&
          item.data.text_content
        ) {
          item.context.at_list = ChatServer._handlePrivateChatList(item, item.context.at_list);
          //发起端的特殊处理，可以考虑统一
          item.context.atList = item.context.at_list;
        }
        //实例化消息
        return Msg._handleGenerateMsg(item);
      })
      .reduce((acc, curr) => {
        const showTime = curr.showTime;
        acc.some(s => s.showTime === showTime)
          ? acc.push({ ...curr, showTime: '' })
          : acc.push(curr);
        return acc;
      }, [])
      .reverse()
      .filter(item => !['customPraise'].includes(item.type));

    // if (['观看端'].includes(from)) {
    //   list.forEach((msg, index) => {
    //     if (index !== 0) {
    //       const preMsgTime = list[index - 1].sendTime;
    //       if (preMsgTime.slice(0, 13) === msg.sendTime.slice(0, 13)) {
    //         msg.showTime = '';
    //       }
    //     }
    //   });
    // }
    this.state.chatList.unshift(...list);
    console.log('chatList', this.state.chatList);

    //返回原始数据等以方便使用
    return {
      historyList,
      list,
      chatList: this.state.chatList,
      imgUrls: this.state.imgUrls || []
    };
  }

  // 清空聊天消息
  clearHistoryMsg() {
    this.state.chatList.splice(0, this.state.chatList.length);
  }
  //创建当前编辑消息
  createCurMsg() {
    this.curMsg = this.curMsg || new Msg();
    return this.curMsg;
  }
  //销毁当前编辑消息
  clearCurMsg() {
    this.curMsg = null;
  }
  //防抖处理发送聊天消息
  sendMsg = debounce(this.sendChatMsg.bind(this), 300, true);
  //发送聊天消息
  sendChatMsg({ data, context }) {
    msgServer.sendChatMsg(data, context);
  }

  //发起请求，或者聊天记录数据
  fetchHistoryData(params) {
    return iMRequest.chat.getChatList(params);
  }

  //获取keywordList
  setKeywordList(list = []) {
    this.state.keywordList = list;
  }

  //检测是否包含敏感词
  checkHasKeyword(needFilter = true, inputValue) {
    let filterStatus = true;

    if (needFilter && this.state.keywordList.length) {
      //只要找到一个敏感词，消息就不让发
      filterStatus = !this.state.keywordList.some(item => inputValue.includes(item.name));
    }

    return filterStatus;
  }

  //私有方法，处理图片链接
  static _handleImgUrl(rawData) {
    this.state.imgUrls.push(...rawData);
  }

  //私有方法，处理私聊列表
  static _handlePrivateChatList(item, list = [], from = '观看端') {
    if (['观看端'].includes(from)) {
      return list.map(a => {
        item.data.text_content = item.data.text_content.replace(
          `***${a.nick_name}`,
          `@${a.nick_name}`
        );
        return a;
      });
    }

    if (['h5'].includes(from)) {
      return list.map(a => {
        // 向前兼容fix 14968  历史消息有得是@
        if (item.data.text_content.indexOf('***') >= 0) {
          item.data.text_content = item.data.text_content.replace(
            `***${a.nick_name}`,
            `<span style='color:#4da1ff;float:left'>@${a.nick_name} &nbsp;</span> `
          );
        } else {
          item.data.text_content = item.data.text_content.replace(
            `@${a.nick_name}`,
            `<span style='color:#4da1ff;float:left'>@${a.nick_name} &nbsp;</span> `
          );
        }
        return a;
      });
    }
  }

  /**
   * 禁言/取消禁言
   * */
  setBanned(params = {}) {
    return iMRequest.chat.setBanned(params).then(res => {
      if (res.code == 200) {
        this.state.banned = params.status;
      }
    });
  }

  /**
   * 全体禁言
   * /v3/interacts/chat-user/set-all-banned
   * */
  setAllBanned(params = {}) {
    return iMRequest.chat.setAllBanned(params).then(res => {
      if (res.code == 200) {
        this.state.allBanned = params.status;
      }
    });
  }

  /**
   * 删除消息
   * /v3/interacts/chat/delete-message
   * */
  deleteMessage(params) {
    return iMRequest.chat.deleteMessage(params);
  }

  /**
   * 踢出
   * /v3/interacts/chat-user/set-kicked
   * */
  setKicked(params = {}) {
    return iMRequest.chat.setKicked(params);
  }

  /**
   * 获取关键词
   * */
  getKeyWordsList(params = {}) {
    return iMRequest.keyWords.getKeyWordsList(params);
  }
  //获取禁言用户列表
  getBannedList(params = {}) {
    return iMRequest.chat.getBannedList(params);
  }
  //获取提出用户列表
  getKickedList(params = {}) {
    return iMRequest.chat.getKickedList(params);
  }
}

export default function useChatServer() {
  return new ChatServer();
}
