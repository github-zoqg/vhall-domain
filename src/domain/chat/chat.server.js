/**
 * 聊天服务
 * */
import moment from 'moment';
import { textToEmojiText } from '@/utils/emoji';
import Msg from './msg-class';
import { im as iMRequest } from '@/request/index.js';
import BaseServer from '@/domain/common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import useGroupServer from '../group/StandardGroupServer';
import useMicServer from '../media/mic.server'

import { debounce } from '@/utils';
class ChatServer extends BaseServer {
  constructor() {
    if (typeof ChatServer.instance === 'object') {
      return ChatServer.instance;
    }
    super();
    const { interactToolStatus } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state;
    //消息sdk
    this.state = {
      //聊天记录
      chatList: [],
      //私聊列表
      privateChatList: [],
      //预览图片地址
      imgUrls: [],
      //当前用户禁言状态
      banned: groupInitData.isInGroup ? (groupInitData.is_banned == 1 ? true : false) : (interactToolStatus.is_banned == 1 ? true : false), //1禁言 0取消禁言
      //当前频道全部禁言状态
      allBanned: groupInitData.isInGroup ? false : (interactToolStatus.all_banned == 1 ? true : false), //1禁言 0取消禁言
      //全体禁言状态下各模块生效信息
      allBannedModuleList: {
        chat_status: interactToolStatus.chat_status == 1 ? true : false, //1生效 0不生效
        qa_status: interactToolStatus.qa_status == 1 ? true : false, //1生效 0不生效
        private_chat_status: interactToolStatus.private_chat_status == 1 ? true : false //1生效 0不生效
      },
      limit: 10,
      curMsg: null,//当前正在编辑的消息
      prevTime: '',//用来记录每条消息的上一条消息发送的时间
      curPrivateTargetId: ''//当前私聊对象id
    };
    this.listenEvents();
    this.controller = null;
    ChatServer.instance = this;
    return this;
  }
  Events = {
    //个人禁言
    BANNED: "banned",
    //全体禁言
    ALLBANNED: 'allBanned'
  }
  //setSate
  setState(key, value) {
    ChatServer.instance.state[key] = value;
  }
  //监听msgServer通知
  listenEvents() {
    const msgServer = useMsgServer();
    const groupServer = useGroupServer();
    //监听聊天消息
    msgServer.$onMsg('CHAT', rawMsg => {
      const { role_name } = useRoomBaseServer().state.watchInitData.join_info;
      if (['text', 'image'].includes(rawMsg.data.type)) {
        //表情处理
        rawMsg.data.text_content = textToEmojiText(rawMsg.data.text_content);
        //格式化消息用于渲染并添加到消息列表
        //私聊我的消息，//自己发的消息不处理
        if (rawMsg.data.target_id) {
          if (this.isMyMsg(rawMsg)) {
            if (role_name == 2) {
              this.setCurPrivateTarget(rawMsg.sender_id)
            }
            if (role_name == 2 || this.state.curPrivateTargetId == rawMsg.sender_id) {
              this.state.privateChatList.push(Msg._handleGenerateMsg(rawMsg))
            }

            this.$emit('receivePrivateMsg', Msg._handleGenerateMsg(rawMsg));
          }
          return
        }
        const msg = Msg._handleGenerateMsg(rawMsg)
        msg.prevTime = this.state.prevTime;
        //自己发的消息不处理
        !this.isSelfMsg(rawMsg) && this.state.chatList.push(msg);
        this.state.prevTime = msg.sendTime;
        //消息过多时丢掉
        if (this.state.chatList.length > 10000) {
          this.state.chatList.splice(0, 5000)
        }
        //普通消息
        if (!this.isSelfMsg(rawMsg)) {
          this.$emit('receiveMsg', rawMsg);
        }
        //@当前用户
        if (this.isAtMe(rawMsg)) {
          this.$emit('atMe', rawMsg);
        }
        //回复当前用户
        if (this.isReplyMe(rawMsg)) {
          this.$emit('replyMe', rawMsg);
        }

      }
      // 禁言当前用户
      if (rawMsg.data.type === 'disable' && this.isMyMsg(rawMsg)) {
        this.setLocalBanned(true);
        useMicServer().speakOff();
        this.$emit('banned', this.state.banned);
      }
      //取消禁言当前用户
      if (rawMsg.data.type === 'permit' && this.isMyMsg(rawMsg)) {
        this.setLocalBanned(false);
        this.$emit('banned', this.state.banned);
      }
      // 开启全体禁言
      if (rawMsg.data.type === 'disable_all') {
        this.setLocalAllBanned(true)
        this.setAllBannedModuleList(rawMsg.data);
        if (role_name == 2) {
          useMicServer().speakOff();
        }
        this.$emit('allBanned', this.state.allBanned, rawMsg.data);

      }
      // 关闭全体禁言
      if (rawMsg.data.type === 'permit_all') {
        this.setLocalAllBanned(false)
        this.setAllBannedModuleList(rawMsg.data);
        this.$emit('allBanned', this.state.allBanned, rawMsg.data);
      }
    });
    msgServer.$onMsg('ROOM_MSG', rawMsg => {
      if (!this.isSelfMsg(rawMsg)) {
        //删除某条聊天消息
        if (rawMsg.data.type === 'chat_delete') {
          const _index = this.state.chatList.findIndex(chatMsg => {
            return chatMsg.msgId === rawMsg.data.msg_id;
          });
          _index > -1 && this.state.chatList.splice(_index, 1);
        }
      }
      if (rawMsg.data.type === 'room_kickout' && this.isMyMsg(rawMsg)) {
        this.$emit('roomKickout');
      }
    });
    //接收频道变更通知
    msgServer.$on(msgServer.EVENT_TYPE.CHANNEL_CHANGE, () => {
      this.$emit('changeChannel');
    });
    //监听进出子房间消息
    groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
      const { groupInitData } = groupServer.state
      const { interactToolStatus } = useRoomBaseServer().state;
      if (groupInitData.isInGroup) {
        this.setLocalAllBanned(false);
        this.setLocalBanned(groupInitData.is_banned == 1 ? true : false)
        this.$emit('banned', this.state.banned);
        this.$emit('allBanned', false);
      } else {
        this.setLocalAllBanned(interactToolStatus.all_banned == 1 ? true : false);
        this.setLocalBanned(interactToolStatus.is_banned == 1 ? true : false)
        this.$emit('allBanned', interactToolStatus.all_banned == 1 ? true : false);
        this.$emit('banned', interactToolStatus.is_banned == 1 ? true : false);
      }
    })
  }
  setCurPrivateTarget(targetId) {
    this.state.curPrivateTargetId = targetId
  }
  // 判断是不是自己发的消息
  isSelfMsg(msg) {
    const { watchInitData } = useRoomBaseServer().state;
    return msg.sender_id == watchInitData.join_info.third_party_user_id;
  }
  //判断是不是发送给当前用户的消息
  isMyMsg(msg) {
    const { watchInitData } = useRoomBaseServer().state;
    console.log(msg.data.target_id, '-', watchInitData.join_info);
    return msg.data.target_id == watchInitData.join_info.third_party_user_id;
  }
  //判断是不是@当前用户
  isAtMe(msg) {
    if (msg.context.atList && msg.context.atList.length && msg.data.text_content) {
      return msg.context.atList.some(a => {
        return a.accountId == useRoomBaseServer().state.watchInitData.join_info.third_party_user_id;
      });
    }
    return false;
  }
  //判断是不是回复当前用户
  isReplyMe(msg) {
    if (msg.context.replyMsg) {
      return (
        msg.context.replyMsg.sendId ==
        useRoomBaseServer().state.watchInitData.join_info.third_party_user_id
      );
    }
    return false;
  }
  //接收聊天消息
  async getHistoryMsg(params) {
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
        const msg = Msg._handleGenerateMsg(item, true)
        msg.prevTime = this.state.prevTime;
        this.state.prevTime = msg.sendTime;
        return msg; //第二个参数区别是否为历史消息
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
  //往聊天列表里手动添加消息
  addChatToList(item) {
    item.count = Msg.getcount();
    this.state.chatList.push(item);
  }
  // 清空普通聊天消息
  clearChatMsg() {
    this.state.chatList.splice(0, this.state.chatList.length);
  }
  //清空私聊列表
  clearPrivateChatMsg() {
    this.state.privateChatList.splice(0, this.state.privateChatList.length);
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
    const { role_name } = useRoomBaseServer().state.watchInitData.join_info;
    //判断私聊还是普通消息,私聊不做敏感词限制
    if (data.target_id || role_name != 2 || this.checkHasKeyword(data.text_content)) {
      useMsgServer().sendChatMsg(data, context);
    }
    const msg = Msg._handleGenerateMsg({ data, context })
    const date_time = moment().format('yyyy-MM-DD HH:mm:ss')
    msg.sendTime = date_time
    if (data.target_id) {
      this.state.privateChatList.push(msg)
    } else {
      msg.prevTime = this.state.chatList[this.state.chatList.length - 1]?.sendTime
      this.state.chatList.push(msg)
    }
    data.text_content = textToEmojiText(data.text_content);
  }

  //发起请求，或者聊天记录数据
  fetchHistoryData(params) {
    return iMRequest.chat.getChatList(params);
  }


  //检测是否包含敏感词
  checkHasKeyword(inputValue) {
    const keywordList = useRoomBaseServer().state.keywords.list
    console.log('keywordList', keywordList)
    let filterStatus = true;
    if (keywordList && keywordList.length) {
      //只要找到一个敏感词，消息就不让发
      filterStatus = !keywordList.some(item => inputValue.includes(item.name));
    }

    return filterStatus;
  }

  //私有方法，处理图片链接
  static _handleImgUrl(rawData) {
    this.state.imgUrls.push(...rawData);
  }

  //私有方法，处理私聊列表(待梳理)
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
  //设置本地个人禁言状态
  setLocalBanned(flag) {
    this.state.banned = flag
  }
  //设置本地全员禁言状态
  setLocalAllBanned(flag) {
    this.state.allBanned = flag
  }
  //设置全体禁言状态下各模块生效状态
  setAllBannedModuleList(data) {
    const { chat_status, qa_status, private_chat_status } = data;
    this.state.allBannedModuleList.chat_status = chat_status;
    this.state.allBannedModuleList.qa_status = qa_status;
    this.state.allBannedModuleList.private_chat_status = private_chat_status;
  }
  /**
   * 禁言/取消禁言
   * */
  setBanned(params = {}) {
    return iMRequest.chat.setBanned(params).then(res => {
      if (res.code == 200) {
        this.state.banned = params.status == 1 ? true : false;
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
        this.state.allBanned = params.status == 1 ? true : false;
      }
    });
  }

  /**
   * 删除消息
   * /v3/interacts/chat/delete-message
   * */
  deleteMessage(params) {
    const _index = this.state.chatList.findIndex(chatMsg => {
      return chatMsg.msgId === params.msg_id;
    });
    _index > -1 && this.state.chatList.splice(_index, 1);
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

  //获取私聊的联系人列表
  getPrivateContactList(params = {}) {
    return iMRequest.chat.fetchPrivateContactList(params);
  }
  //将联系人加入到私聊列表
  addToRankList(params = {}) {
    return iMRequest.privateChat.setRankList(params)
  }
  //获取私聊的记录列表
  getPrivateChatHistoryList(params = {}) {
    const { watchInitData } = useRoomBaseServer().state;
    params.room_id = watchInitData.interact.room_id;
    params.webinar_id = watchInitData.webinar.id
    return iMRequest.chat.fetchPrivateChatHistoryList(params).then(res => {
      if (res.code == 200) {
        let list = res.data.list.map(item => {
          item.data.text_content &&
            (item.data.text_content = textToEmojiText(item.data.text_content));
          //处理图片预览
          item.data.image_urls && ChatServer._handleImgUrl.call(this, item.data.image_urls);
          return Msg._handleGenerateMsg(item)
        }).reduce((acc, curr) => {
          const showTime = curr.showTime;
          acc.some(s => s.showTime === showTime)
            ? acc.push({ ...curr, showTime: '' })
            : acc.push(curr);
          return acc;
        }, [])
          .reverse()
        this.state.privateChatList.splice(0, 0, ...list)
      }
    });
  }
}

export default function useChatServer() {
  return new ChatServer();
}
