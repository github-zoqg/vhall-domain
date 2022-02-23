import request from '@/utils/http.js';

// 签到
const sign = (params = {}) => {
  return request({
    url: '/v3/interacts/sign/user-sign',
    method: 'POST',
    data: params
  });
};
// 主持人发起签到的信息
const signInfo = (params = {}) => {
  return request({
    url: '/v3/interacts/sign/get-doing-sign',
    method: 'POST',
    data: params
  });
};

// 主持人创建签到
const signStart = (params = {}) => {
  return request({
    url: '/v3/interacts/sign/create-and-push',
    method: 'POST',
    data: params
  });
};

// 主持人结束签到
const signClose = (params = {}) => {
  return request({
    url: '/v3/interacts/sign/set-end-sign',
    method: 'POST',
    data: params
  });
};

// 主持人获取当前活动的签到记录
const getSignRecordList = (params = {}) => {
  return request({
    url: '/v3/interacts/sign/get-user-sign-list',
    method: 'POST',
    data: params
  });
};

export default {
  sign,
  signInfo,
  signStart,
  signClose,
  getSignRecordList
};
