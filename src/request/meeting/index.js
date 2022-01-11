import $http from '@/utils/http.js';
// 发起端初始化
function initSendLive(params) {
  return $http({
    url: '/v3/webinars/live/init',
    type: 'GET',
    data: params
  });
}

// 观看端初始化（标品）
function initStandardReceiveLive(params) {
  return $http({
    url: '/v3/webinars/watch/init',
    type: 'GET',
    data: params
  });
}

// 观看端初始化（嵌入页）
function initEmbeddedReceiveLive(params) {
  return $http({
    url: '/v3/webinars/watch/inline-init',
    type: 'GET',
    data: params
  });
}

// 观看端初始化（SDK）
function initSdkReceiveLive(params) {
  return $http({
    url: '/v3/webinars/watch/sdk-init',
    type: 'GET',
    data: params
  });
}

// 开始直播
function startLive(params) {
  return $http({
    url: '/v3/webinars/live/start',
    type: 'POST',
    data: params
  });
}

// 结束直播
function endLive(params) {
  $http({
    url: '/v3/webinars/live/end',
    type: 'POST',
    data: params
  });
}

// 进入直播前检测
function checkLive(params) {
  return $http({
    url: '/v3/webinars/live/check',
    type: 'GET',
    data: params
  });
}

// 获取聊天服务链接参数
function getChatInitOptions(params) {
  return $http({
    url: '/v3/webinars/live/get-connect',
    type: 'GET',
    data: params
  });
}

// 心跳检测
function liveHeartBeat(params) {
  return $http({
    url: '/v3/webinars/live/heartbeat',
    type: 'GET',
    data: params
  });
}

// 获取live_token
function getLiveToken(params) {
  $http({
    url: '/v3/webinars/live/get-live-token',
    type: 'GET',
    data: params
  });
}

// 获取推流地址
function getStreamPushAddress(params) {
  $http({
    url: '/v3/webinars/live/get-stream-push-address',
    type: 'GET',
    data: params
  });
}

// 设置设备检测状态
function setDevice(params) {
  return $http({
    url: '/v3/interacts/room/set-device',
    type: 'POST',
    data: params
  });
}

const meeting = {
  initSendLive,
  initStandardReceiveLive,
  initEmbeddedReceiveLive,
  initSdkReceiveLive,
  startLive,
  endLive,
  checkLive,
  getChatInitOptions,
  liveHeartBeat,
  getLiveToken,
  getStreamPushAddress,
  setDevice
};

export default meeting;
