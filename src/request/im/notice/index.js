import request from '@/utils/http.js';
import env from '../../env';

/**
 * 发送公告消息
 * */
function sendNotice(params = {}) {
  const url =
    env.imNotice === 'v3' ? '/v3/interacts/chat/send-notice-message' : '/v4/im-chat/notice/send';

  console.log('params:', params);

  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 获取公告列表
 * */
function getNoticeList(params = {}) {
  const url =
    env.imNotice === 'v3'
      ? '/v3/interacts/chat/get-announcement-list'
      : '/v4/im-chat/notice/get-list';

  return request({
    url,
    method: 'POST',
    data: params
  });
}

export default {
  sendNotice,
  getNoticeList
};
