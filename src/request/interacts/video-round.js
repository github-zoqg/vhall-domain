import request from '@/utils/http.js';
import { videoRoundApiList } from '../env';

/**
 * 获取视频轮询信息
 * */
function getVideoRoundInfo(params = {}) {
  const url = videoRoundApiList.videoRoundInfo.v3
  return request({
    url,
    method: 'GET',
    params: params
  });
}

/**
 * 开启视频轮询
 * */
function videoRoundStart(params = {}) {
  const url = videoRoundApiList.videoRoundStart.v3
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 结束视频轮询
 * */
function videoRoundEnd(params = {}) {
  const url = videoRoundApiList.videoRoundEnd.v3
  return request({
    url,
    method: 'GET',
    params: params
  });
}

/**
 * 获取轮询用户
 * */
function getRoundUsers(params = {}) {
  const url = videoRoundApiList.videoRoundGetUsers.v3
  return request({
    url,
    method: 'GET',
    params: params
  });
}

export default {
  getVideoRoundInfo,
  videoRoundStart,
  videoRoundEnd,
  getRoundUsers
};