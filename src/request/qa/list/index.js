import request from '@/utils/http.js';
import env from '@/request/env';
// import contextServer from '@/domain/common/context.server.js';

// 初始化问答信息----予以提供聊天实例化
function initChatMess(params) {
  const url = env.qa === 'v3' ? '/v3/webinars/live/get-connect' : '';
  return request({
    url: url,
    method: 'GET',
    params: params
  });
}

// 主持人开启问答
const qaEnable = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/qa/enable' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 主持人关闭问答
const qaDisable = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/qa/disable' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 获取当前场次收集到的问题个数
const getCurrentPlayQuestionNum = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/qa/get-current-play-question-num' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 获取当前场次收集到的历史问答 主持人
const replyUserQuestion = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/qa/reply-user-question' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 提问列表
const getQuestionByStatus = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/qa/get-question-by-status' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 发送私聊信息
const chatPrivateSendMessage = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/chat-private/send-message' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 文字回复---私密
const getTextReply = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/qa/get-answer-list' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 主持人撤销回复
const revokeReply = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/qa/revoke-reply' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 获取私聊列表
const chatPrivateGetRankList = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/chat-private/get-rank-list' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 获取私聊内容
const chatPrivateGetList = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/chat-private/get-list' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 设置联系人列表
const setRankList = (params = {}) => {
  const url = env.qa === 'v3' ? '/v3/interacts/chat-private/set-rank-list' : '';
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

export default {
  initChatMess,
  qaEnable,
  qaDisable,
  getCurrentPlayQuestionNum,
  replyUserQuestion,
  getQuestionByStatus,
  chatPrivateSendMessage,
  getTextReply,
  revokeReply,
  chatPrivateGetRankList,
  chatPrivateGetList,
  setRankList
};
