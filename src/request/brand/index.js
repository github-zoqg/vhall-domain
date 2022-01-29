import request from '@/utils/http.js';
import env from '../env';

/**
 * 获取暖场视频详情
 * */
function getWarmInfo(params = {}) {
  const url = env.brand === 'v3' ? '/v3/brand/warm/info' : '/v4/brand/warm/info';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

export default {
  getWarmInfo
};
