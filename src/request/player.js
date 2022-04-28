import request from '@/utils/http.js';

// 获取播放器配置项
const getPlayerConfig = (params = {}) => {
  return request({
    url: '/v3/interacts/union/player-config',
    method: 'POST',
    data: params
  });
};

export default {
  getPlayerConfig
};
