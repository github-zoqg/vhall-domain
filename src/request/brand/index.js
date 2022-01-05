import $http from '@/utils/http.js';

/**
 * 获取暖场视频详情
 * */
function getWarmInfo(params = {}) {
  return $http({
    url: '/v4/brand/warm/info',
    type: 'POST',
    data: params
  });
}

export default {
  getWarmInfo
};
