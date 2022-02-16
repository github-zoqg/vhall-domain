import request from '@/utils/http.js';
import env from '../env';
import axios from 'axios/dist/axios';

// 发起端初始化
function initSendLive(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/live/init' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 观看端初始化（标品）
function initStandardReceiveLive(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/watch/init' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 观看端初始化（嵌入页）
function initEmbeddedReceiveLive(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/watch/inline-init' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 观看端初始化（SDK）
function initSdkReceiveLive(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/watch/sdk-init' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 开始直播
function startLive(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/live/start' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 结束直播
function endLive(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/live/end' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 进入直播前检测
function checkLive(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/live/check' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 查询活动配置信息
const getConfigList = (params = {}) => {
  const url = env.meeting === 'v3' ? '/v3/users/permission/get-config-list' : '';
  return request({
    url: '/v3/users/permission/get-config-list',
    method: 'POST',
    data: params
  });
};

// 查询活动互动状态
const getInavToolStatus = (params = {}) => {
  const url = env.meeting === 'v3' ? '/v3/interacts/room/get-inav-tool-status' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 观看端聚合接口
const getCommonConfig = (params = {}) => {
  const url = env.meeting === 'v3' ? '/v3/interacts/union/common-config' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 获取聊天服务链接参数
function getChatInitOptions(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/live/get-connect' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 心跳检测
function liveHeartBeat(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/live/heartbeat' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 获取live_token
function getLiveToken(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/live/get-live-token' : '';
  request({
    url,
    method: 'POST',
    data: params
  });
}

// 获取推流地址
function getStreamPushAddress(params) {
  const url = env.meeting === 'v3' ? '/v3/webinars/live/get-stream-push-address' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 设置设备检测状态
function setDevice(params) {
  const url = env.meeting === 'v3' ? '/v3/interacts/room/set-device' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 获取黄金链路内容
function getLowerGradeConfigInfo(params, environment = 'test', systemKey = 2) {
  const url =
    env.meeting === 'v3'
      ? `${
          environment == 'test'
            ? 'https://t-alistatic01.e.vhall.com'
            : 'https://cnstatic01.e.vhall.com'
        }/fault/${environment}/ops_fault_code_publish_${systemKey}.json`
      : '';
  return axios.get(url);
}

// 观看端反馈
function feedbackInfo(params) {
  const url = env.meeting === 'v3' ? '/v3/interacts/feedback/user-create-feedback' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 观看端举报
function tipOffInfo(params) {
  const url = env.meeting === 'v3' ? '/v3/interacts/report/user-create-report' : '';
  return request({
    url,
    method: 'POST',
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
  setDevice,
  getConfigList,
  getInavToolStatus,
  getCommonConfig,
  getLowerGradeConfigInfo,
  feedbackInfo,
  tipOffInfo
};

export default meeting;
