import request from '@/utils/http.js';
import env, { meetingApiList, roomApiList } from '@/request/env';


/**
 * 查询活动基础信息
 * */
function getActivityBasicInfo(params = {}) {
  const url = roomApiList['getActivityBasicInfo']['v3'];
  return request({
    url: url,
    method: 'POST',
    data: params
  });
}

/**
 * 设置音视频设备状态接口
 * */
function setDeviceStatus(params) {
  const url = roomApiList['setDeviceStatus']['v3'];
  return request({
    url: url,
    method: 'POST',
    data: params
  });
}

export default {
  getActivityBasicInfo,
  setDeviceStatus
};
