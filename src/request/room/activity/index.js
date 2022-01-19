import $http from '@/utils/http.js';

/**
 * 查询活动基础信息
 * */
function getActivityBasicInfo(params = {}) {
  return $http({
    url: '/v4/room/webinar/info',
    type: 'POST',
    data: params
  });
}

/**
 * 设置音视频设备状态接口
 * */
function setDeviceStatus(params) {
  return $http({
    url: '/v3/interacts/room/set-device-status',
    type: 'POST',
    data: params
  });
}

export default {
  getActivityBasicInfo,
  setDeviceStatus
};
