import request from '@/utils/http.js';
import env from '../env';

// 通过活动id获取活动拥有者用户id - 用于灰度存储
const initGrayBefore = (params = {}) => {
  // const retParmams = {
  //   room_id: params.room_id
  // };

  let url = env.entryform == 'v3' ? '/v3/webinars/webinar/init-before' : '';

  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 报名表单独立链接是否有效
const verifyOpenLink = (params = {}) => {
  let url = env.entryform == 'v3' ? '/v3/webinars/registration-form/verify-open-link' : '';

  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

// 获取当前活动状态，如果直播中，跳转到直播间
const watchInit = (params = {}) => {
  let url = env.entryform == 'v3' ? '/v3/webinars/watch/init' : '';

  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

const entryformApi = {
  initGrayBefore,
  verifyOpenLink,
  watchInit
};

export default entryformApi;
