import request from '@/utils/http.js';

// 获取快问快答鉴权信息
const getExamToken = params => {
  return request({
    url: '/v3/interacts/exam/get-init-data',
    method: 'post',
    data: params
  });
};
export default {
  getExamToken
}