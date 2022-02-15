import request from '@/utils/http.js';
import env from '../../env';
import Qs from 'qs';

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
 * 审核消息操作
 * 注意，这里进行了入参转换，因为这个接口比较特殊
 * */
function applyMessageSend(params = {}) {
  return request({
    url: '//api.vhallyun.com/sdk/v2/message/apply-message-send',
    method: 'POST',
    data: Qs.stringify(params),
  });
}

/**
 * 获取未审核的消息列表
 * */
function getChatAuditList(params = {}) {
  return request({
    url: '//api.vhallyun.com/sdk/v2/message/get-chat-audit-lists',
    method: 'GET',
    params: params
  });
}

/**
 * 获取已通过的消息列表
 * */
function getPassedMessageList(params = {}) {
  return request({
    url: '//api.vhallyun.com/sdk/v2/message/lists',
    method: 'GET',
    params: params
  });
}

/**
 * 切换关闭 / 开启人工审核状态
 * */
function toggleChatAuthStatus(params = {}) {
  return request({
    url: env.imChat === 'v3' ? '//api.vhallyun.com/sdk/v2/message/set-channel-switch' : '/manage/chat-auth/set-manual',
    method: env.imChat === 'v3' ? 'GET' : 'POST',
    params: params
  });
}

/**
 * 获取人工审核状态
 * */
function getChatAuthStatus(params = {}) {
  return request({
    url: env.imChat === 'v3' ? '//api.vhallyun.com/sdk/v2/message/get-channel-switch' : '/manage/chat-auth/get-manual',
    method: env.imChat === 'v3' ? 'GET' : 'POST',
    params: params
  });
}

/**
 * 设置聊天消息超过200条时候的操作
 * */
function setMessageFilterOptions(params = {}) {
  return request({
    url: env.imChat === 'v3' ? '//api.vhallyun.com/sdk/v2/message/set-channel-switch-options' : '',
    method: 'GET',
    params: params
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
  setAutoSetting,
  applyMessageSend,
  getChatAuditList,
  getPassedMessageList,
  setMessageFilterOptions
};
