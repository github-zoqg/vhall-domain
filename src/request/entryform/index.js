import request from '@/utils/http.js';
import env from '@/request/env.js';

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
  watchInit
};

export default entryformApi;
