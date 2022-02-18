import request from '@/utils/http.js';

// 签到
const sign = (params = {}) => {
  return request({
    url: '/v3/interacts/sign/user-sign',
    method: 'POST',
    data: params
  });
};

export default {
  sign
};
