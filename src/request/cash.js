import request from '@/utils/http.js';

const biz_id = 2;

// 获取提现信息
const getCashInfo = (data = {}) => {
  return request({
    url: '/v3/fin/income',
    method: 'GET',
    data: {biz_id, ...data}
  })
}

// 获取提现列表
const getCashList = (data = {}) => {
  return request({
    url: 'v3/fin/income/withdraw-rp/list',
    method: 'GET',
    data: {biz_id, ...data}
  })
}

export default {
  getCashInfo,
  getCashList
}