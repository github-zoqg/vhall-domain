import $http from '@/utils/http.js';

// 获取播放器配置项
const getPlayerConfig = (params = {}) => {
  return $http({
    url: '/v3/interacts/union/player-config',
    type: 'POST',
    data: params
  });
};

export default {
  getPlayerConfig
};
