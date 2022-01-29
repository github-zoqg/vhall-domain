import request from '@/utils/http.js';

/**
 * 查询活动基础信息
 * */
function getActivityBasicInfo(params = {}) {
  return request({
    url: '/v4/room/webinar/info',
    method: 'POST',
    data: params
  });
}

/**
 * 设置音视频设备状态接口
 * */
function setDeviceStatus(params) {
  return request({
    url: '/v3/interacts/room/set-device-status',
    method: 'POST',
    data: params
  });
}

export default {
  getActivityBasicInfo,
  setDeviceStatus
};
