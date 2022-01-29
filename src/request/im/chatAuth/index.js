import request from '@/utils/http.js';

/**
 * 获取聊天审核相关信息
 * */
function getChatAuthSetting(params = {}) {
  return request({
    url: '/frontend/live/get-chat-auth-setting',
    method: 'POST',
    data: params
  });
}

/**
 * 更新人工审核状态
 * */
function toggleChatAuthStatus(params = {}) {
  return request({
    url: '/manage/chat-auth/set-manual',
    method: 'POST',
    data: params
  });
}

/**
 * 获取人工审核状态
 * */
function getChatAuthStatus(params = {}) {
  return request({
    url: '/manage/chat-auth/get-manual',
    method: 'POST',
    data: params
  });
}

/**
 * 获取自动处理聊天严禁词
 * */
function getAutoSetting(params = {}) {
  return request({
    url: '/manage/chat-auth/get-auto-setting',
    method: 'POST',
    data: params
  });
}

/**
 * 设置自动处理聊天严禁词
 * */
function setAutoSetting(params = {}) {
  return request({
    url: '/manage/chat-auth/set-auto-setting',
    method: 'POST',
    data: params
  });
}

export default {
  getChatAuthSetting,
  toggleChatAuthStatus,
  getChatAuthStatus,
  getAutoSetting,
  setAutoSetting
};
