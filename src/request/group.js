import request from '@/utils/http.js';
import env from './env';

// 小组初始化接口
const groupInit = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group/init' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

//预分组小组初始化
const initPresetGroup = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group/init-preset-group' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
};

//重新导入
const groupPresetImport = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group/preset-import' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 给在线观众分配小组
const groupCreate = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group/create' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 设置组长
const groupSetLeader = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-join/set-leader' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 解散小组
const groupDisband = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group/disband' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 开始讨论
const groupStartDiscussion = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-switch/start' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};
// 结束讨论
const groupEndDiscussion = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-switch/end' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 暂停讨论
const groupPauseDiscussion = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-switch/stop' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 继续讨论
const groupProceedDiscussion = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-switch/proceed' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
}

// 获取分组待分配用户列表
const groupWaitList = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-join/wait-listing' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 活动下分组列表
const groupListing = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group/listing' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 主持人、助理进入小组
const groupEnter = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-join/enter' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 主持人、助理退出小组
const groupQuit = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-join/quit' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 批量分配换组
const groupExchange = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-join/exchange' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 结束别的用户演示
const endOtherPresentation = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/inav/nopresentation' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 结束自己演示
const endSelfPresentation = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/inav-user/nopresentation' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 切换主讲人（用户上麦并开始演示）
const presentation = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/inav-user/presentation' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 小组中请求协助
const groupHelp = (params = {}) => {
  const url = env.group === 'v3' ? '/v3/interacts/group-join/help' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

export default {
  groupInit,
  initPresetGroup,
  groupCreate,
  groupSetLeader,
  groupDisband,
  groupStartDiscussion,
  groupEndDiscussion,
  groupPauseDiscussion,
  groupProceedDiscussion,
  groupWaitList,
  groupListing,
  groupEnter,
  groupQuit,
  groupExchange,
  endOtherPresentation,
  endSelfPresentation,
  presentation,
  groupHelp,
  groupPresetImport
};
