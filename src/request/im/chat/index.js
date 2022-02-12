import request from '@/utils/http.js';
import env from '../../env';

/**
 * 获取历史聊天消息
 * */
function getChatList(params = {}) {
  const url = env.imChat === 'v3' ? '/v3/interacts/chat/get-list' : '/v4/im-chat/chat/get-list';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 删除聊天消息
 * */
function deleteMessage(params = {}) {
  const url = env.imChat === 'v3' ? '/v3/interacts/chat/delete' : '/v4/im-chat/chat/delete';
  return request({
    url,
    method: 'POST',
    data: params
  });
}
/**
 * 批量删除聊天消息
 * */
function batchDeleteMessage(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat/batch-delete-message'
      : '/v4/interacts/chat/batch-delete-message';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 删除活动所有聊天的消息
 * */
function deleteRoomMessage(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat/delete-room-message'
      : '/v4/interacts/chat/delete-room-message';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 删除用户所有聊天的消息
 * */
function deleteUserMessage(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat/delete-user-message'
      : '/v4/im-chat/chat/delete-user-message';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 获取禁言用户列表
 * */
function getBannedList(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat-user/get-banned-list'
      : '/v4/interacts/chat-user/get-banned-list';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 获取踢出用户列表
 * */
function getKickedList(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat-user/get-kicked-list'
      : '/v4/interacts/chat-user/get-kicked-list';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 获取在线用户列表
 * */
function getOnlineList(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat-user/get-online-list'
      : '/v4/interacts/chat-user/get-online-list';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 获取受限用户列表
 * */
function getBoundedList(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat-user/get-bounded-list'
      : '/v4/interacts/chat-user/get-bounded-list';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 设置 / 取消用户禁言
 * */
function setBanned(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat-user/set-banned'
      : '/v4/interacts/chat-user/set-banned';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 设置 / 取消全体用户禁言
 * */
function setAllBanned(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat-user/set-all-banned'
      : '/v4/interacts/chat-user/set-all-banned';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 踢出用户 / 取消踢出
 * */
function setKicked(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat-user/set-kicked'
      : '/v4/interacts/chat-user/set-kicked';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 发送自定义消息
 * */
function sendCustomMessage(params = {}) {
  const url =
    env.imChat === 'v3'
      ? '/v3/interacts/chat/send-custom-message'
      : '/v4/interacts/chat/send-custom-message';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

export default {
  getChatList,
  getBannedList,
  getKickedList,
  getOnlineList,
  getBoundedList,
  setBanned,
  setAllBanned,
  setKicked,
  deleteMessage,
  batchDeleteMessage,
  deleteRoomMessage,
  deleteUserMessage,
  sendCustomMessage
};
