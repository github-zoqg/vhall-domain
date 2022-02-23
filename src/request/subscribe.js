/**
 * @description 预约页面接口
 * @param {*} [params={}]
 * @return {*}
 */

import request from '@/utils/http.js';

//  预约页面校验权限
const watchAuth = (params = {}) => {
  return request({
    url: '/v3/webinars/watch/auth',
    method: 'POST',
    data: params
  });
};

const payWay = (params = {}) => {
  return request({
    url: '/v3/fin/webinar-pay',
    method: 'GET',
    params: params
  });
};

export default {
  watchAuth,
  payWay
};
