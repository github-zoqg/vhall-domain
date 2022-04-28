import request from '@/utils/http.js';

/**
 * 获取聊天关键词
 *
 * */
function getKeyWordsList(params = {}) {
  return request({
    url: '/v4/interacts/keyword/get-list',
    method: 'POST',
    data: params
  });
}

export default {
  getKeyWordsList
};
