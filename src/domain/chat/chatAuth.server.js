import { im as iMRequest } from '@/request/index.js';
import BaseServer from '@/domain/common/base.server.js';

class ChatAuthServer extends BaseServer {
  constructor() {
    if (typeof ChatAuthServer.instance === 'object') {
      return ChatAuthServer.instance;
    }
    super();
    this.state = {};
    ChatAuthServer.instance = this;
    return this;
  }

  /**
   * 开启/关闭聊天审核
   * /sdk/v2/message/set-channel-switch
   * */
  toggleChatAuthStatus(params = {}) {
    return iMRequest.chatAuth.toggleChatAuthStatus(params);
  }

  /**
   * 获取聊天审核列表
   * /sdk/v2/message/get-chat-audit-lists
   * */
  getAuditMessageList() {
  }

  /**
   * 获取已通过列表
   * /sdk/v2/message/lists
   * */
  getPassedMessageList() {
  }

  /**
   * 获取禁言列表
   * /v3/interacts/chat-user/get-banned-list
   * */
  getBannedList(params = {}) {
    return iMRequest.chat.getBannedList(params);
  }

  /**
   * 获取踢出列表
   * /v3/interacts/chat-user/get-kicked-list
   * */
  getKickedList(params = {}) {
    return iMRequest.chat.getKickedList(params);
  }

  /**
   * 对消息进行操作 (通过、阻止、通过并回复,全部阻止，全部通过)
   * /sdk/v2/message/apply-message-send
   * */
  operateMessage() {
  }

  /**
   * 过滤设置开关 （过滤设置：未审核超过200条时自动发送 / 阻止）
   * /sdk/v2/message/set-channel-switch-options
   * */
  setMessageFilterOptions() {
  }

  /**
   * 取消禁言
   * /v3/interacts/chat-user/set-banned
   * */
  toggleBannedStatus(params = {}) {
    return iMRequest.chat.setBanned(params);
  }

  /**
   * 取消踢出
   * /v3/interacts/chat-user/set-kicked
   * */
  toggleKickedStatus(params = {}) {
    return iMRequest.chat.setKicked(params);
  }
}

export default function useChatAuthServer() {
  return new ChatAuthServer();
}