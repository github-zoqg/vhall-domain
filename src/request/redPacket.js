/**
 * @description 红包
 */

import request from '@/utils/http.js';

// 查询活动配置信息
const createRedpacket = params => {
  console.log(params);
  return request({
    url: '/v3/interacts/redpacket/create',
    type: 'POST',
    data: params
  });
};

export default {
  createRedpacket
};
