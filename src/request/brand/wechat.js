import request from '@/utils/http.js';

const wechatShare = (data = {}) => {
  const v3 = '/v3/commons/auth/weixin-share';

  const url = v3;
  return request({
    url,
    method: 'POST',
    data
  });
};

export default {
  wechatShare
};
