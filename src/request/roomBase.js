import $http from '@/utils/http.js';
import contextServer from '@/domain/common/context.server.js';

// 查询活动基础信息
const getWebinarInfo = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');

  const retParmams = {
    webinar_id: params.webinarId || state.watchInitData.webinar.id,
    is_no_check: 1 || params.is_no_check
  };

  return $http({
    url: '/v3/webinars/webinar/info',
    type: 'POST',
    data: retParmams
  });
};

// 查询活动配置信息
const getConfigList = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');

  const retParmams = {
    webinar_id: params.webinar_id || state.watchInitData.webinar.id,
    webinar_user_id: params.webinar_user_id || state.watchInitData.webinar.userinfo.user_id,
    scene_id: params.scene_id || 1
  };

  return $http({
    url: '/v3/users/permission/get-config-list',
    type: 'POST',
    data: retParmams
  });
};

// 设置设备检测状态
const setDevice = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');

  const retParmams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
    status: params.status || 1,
    type: params.type || 0
  };

  return $http({
    url: '/v3/interacts/room/set-device',
    type: 'POST',
    data: retParmams
  });
};

// 开始暂停结束录制api
const recordApi = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');
  const { state: roomInitGroupServerState } = contextServer.get('roomInitGroupServer');

  const retParmams = {
    webinar_id: params.webinarId || state.watchInitData.webinar.id,
    status: params.status || 1
  };

  if (params.live_token || roomInitGroupServerState.live_token) {
    retParmams.live_token = params.live_token || roomInitGroupServerState.live_token;
  }

  return $http({
    url: '/v3/webinars/record/ticker',
    type: 'POST',
    data: retParmams
  });
};

const getGroupInitData = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');

  const retParmams = {
    room_id: params.room_id || state.watchInitData.interact.room_id
  };

  return $http({
    url: '/v3/interacts/group/init',
    type: 'POST',
    data: retParmams
  });
};
//初始化回放录制
const initRecordApi = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');
  const { state: roomInitGroupServerState } = contextServer.get('roomInitGroupServer');
  const retParams = {
    webinar_id: params['webinarId'] || state.watchInitData.webinar.id
  };
  return $http({
    url: '/v3/webinars/record/init',
    type: 'POST',
    data: retParams
  });
};

//获取房间内各工具的状态
const getRoomToolStatus = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');
  const { state: roomInitGroupServerState } = contextServer.get('roomInitGroupServer');
  const retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id
  };
  return $http({
    url: '/v3/interacts/room/get-inav-tool-status',
    type: 'POST',
    data: retParams
  });
};

const setStream = (params = {}) => {
  return $http({
    url: '/v3/interacts/room/set-stream',
    method: 'POST',
    data: params
  });
};

const roomBase = {
  getWebinarInfo,
  getConfigList,
  setDevice,
  recordApi,
  getGroupInitData,
  initRecordApi,
  getRoomToolStatus,
  setStream
};

export default roomBase;
