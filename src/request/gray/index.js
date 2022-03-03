import request from '@/utils/http.js';
import env from '@/request/env';

/**
 * @function attention 专题页面灰度
 * @param {*} data
 */
const initGraySubject = params => {
  const url = env.gray === 'v3' ? '/v3/webinars/subject/init-before' : '';
  return request({
    url: url,
    method: 'GET',
    params: params
  });
};

export default {
  initGraySubject
};
