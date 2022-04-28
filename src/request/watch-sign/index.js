import request from '@/utils/http.js';
import env from '../env';

// 签到
const sign = (params = {}) => {
  let url = env.liveTimer == 'v4' ? '' : '/v3/interacts/sign/user-sign';

  return request({
    url: url,
    method: 'POST',
    data: params
  });
};
// 主持人发起签到的信息
const signInfo = (params = {}) => {
  let url = env.liveTimer == 'v4' ? '' : '/v3/interacts/sign/get-doing-sign';

  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 主持人创建签到
const signStart = (params = {}) => {
  let url = env.liveTimer == 'v4' ? '' : '/v3/interacts/sign/create-and-push';

  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 主持人结束签到
const signClose = (params = {}) => {
  let url = env.liveTimer == 'v4' ? '' : '/v3/interacts/sign/set-end-sign';

  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 主持人获取当前活动的签到记录
const getSignRecordList = (params = {}) => {
  let url = env.liveTimer == 'v4' ? '' : '/v3/interacts/sign/get-user-sign-list';

  return request({
    url: url,
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
