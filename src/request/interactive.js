import $http from '@/utils/http.js';
import contextServer from '@/domain/common/context.server.js';

// 设置主屏
const setMainScreen = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');

  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id
  };
  retParams = Object.assign(retParams, params);

  return $http({
    url: '/v3/interacts/room/set-main-screen',
    type: 'POST',
    data: retParams
  });
};

// 设置主讲人
const setSpeaker = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');

  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id
  };
  retParams = Object.assign(retParams, params);

  return $http({
    url: '/v3/interacts/room/set-doc-permission',
    type: 'POST',
    data: retParams
  });
};

// 设置音视频设备开关
const setDeviceStatus = (params = {}) => {
  return $http({
    url: '/v3/interacts/room/set-device-status',
    type: 'POST',
    data: retParams
  });
};

export default {
  setMainScreen, // 设置主屏
  setSpeaker, // 设置主讲人
  setDeviceStatus // 设置音视频设备开关
};
