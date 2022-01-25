import request from '@/utils/http.js';
/**
 * 获取私聊聊天联系人列表
 * */
function getRankList(params = {}) {
  return request({
    url: '/v3/interacts/chat-private/get-rank-list',
    method: 'POST',
    data: params
  });
}

/**
 * 获取私聊聊天列表
 * */
function getPrivateChatList(params = {}) {
  return request({
    url: '/v3/interacts/chat-private/get-list',
    method: 'POST',
    data: params
  });
}
/**
 * 设置私聊聊天联系人列表
 * */
function setRankList(params = {}) {
  return request({
    url: '/v3/interacts/chat-private/set-rank-list',
    method: 'POST',
    data: params
  });
}

export default {
  getRankList,
  getPrivateChatList,
  setRankList
};
