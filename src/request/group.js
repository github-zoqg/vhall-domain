import request from '@/utils/http.js';
import env from './env';

// 给在线观众分配小组
const groupCreate = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group/create' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 设置组长
const groupSetLeader = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group-join/set-leader' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 解散小组
const groupDisband = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group/disband' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 开始讨论
const groupStartDiscussion = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group-switch/start' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};
// 结束讨论
const groupEndDiscussion = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group-switch/end' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 获取分组待分配用户列表
const groupWaitList = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group-join/wait-listing' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 活动下分组列表
const groupListing = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group/listing' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 主持人、助理进入小组
const groupEnter = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group-join/enter' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 主持人、助理退出小组
const groupQuit = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group-join/quit' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 批量分配换组
const groupExchange = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group-join/exchange' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

export default {
  groupCreate,
  groupSetLeader,
  groupDisband,
  groupStartDiscussion,
  groupEndDiscussion,
  groupWaitList,
  groupListing,
  groupEnter,
  groupQuit,
  groupExchange
};
