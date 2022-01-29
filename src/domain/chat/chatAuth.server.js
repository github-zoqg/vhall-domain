import requestApi from '@/request/index.js';
export default function useChatAuthServer() {
  let state = {};

  const imRequest = requestApi.im;
  /**
   * 开启/关闭聊天审核
   * /sdk/v2/message/set-channel-switch
   * */
  function toggleChatAuthStatus(params = {}) {
    return imRequest.chatAuth.toggleChatAuthStatus(params);
  }

  /**
   * 获取聊天审核列表
   * /sdk/v2/message/get-chat-audit-lists
   * */
  function getAuditMessageList() {}

  /**
   * 获取已通过列表
   * /sdk/v2/message/lists
   * */
  function getPassedMessageList() {}

  /**
   * 获取禁言列表
   * /v3/interacts/chat-user/get-banned-list
   * */
  function getBannedList(params = {}) {
    return imRequest.chat.getBannedList(params);
  }

  /**
   * 获取踢出列表
   * /v3/interacts/chat-user/get-kicked-list
   * */
  function getKickedList(params = {}) {
    return imRequest.chat.getKickedList(params);
  }

  /**
   * 对消息进行操作 (通过、阻止、通过并回复,全部阻止，全部通过)
   * /sdk/v2/message/apply-message-send
   * */
  function operateMessage() {}

  /**
   * 过滤设置开关 （过滤设置：未审核超过200条时自动发送 / 阻止）
   * /sdk/v2/message/set-channel-switch-options
   * */
  function setMessageFilterOptions() {}

  /**
   * 取消禁言
   * /v3/interacts/chat-user/set-banned
   * */
  function toggleBannedStatus(params = {}) {
    return imRequest.chat.setBanned(params);
  }

  /**
   * 取消踢出
   * /v3/interacts/chat-user/set-kicked
   * */
  function toggleKickedStatus(params = {}) {
    return imRequest.chat.setKicked(params);
  }

  return {
    state,
    toggleChatAuthStatus,
    getAuditMessageList,
    getPassedMessageList,
    getBannedList,
    getKickedList,
    operateMessage,
    setMessageFilterOptions,
    toggleBannedStatus,
    toggleKickedStatus
  };
}
