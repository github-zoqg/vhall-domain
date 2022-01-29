import request from '@/utils/http.js';
/**
 * 发送公告消息
 * */
function sendNotice(params = {}) {
  return request({
    url: '/v4/im-chat/notice/send',
    method: 'POST',
    data: params
  });
}

/**
 * 获取公告列表
 * */
function getNoticeList(params = {}) {
  return request({
    url: '/v4/im-chat/notice/get-list',
    method: 'POST',
    data: params
  });
}

export default {
  sendNotice,
  getNoticeList
};
