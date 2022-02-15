import request from '@/utils/http.js';

// 发起端创建计时器
const timerCreate = (params = {}) => {
  const retParmams = {
    duration: params.duration,
    is_all_show: params.is_all_show ? 1 : 0,
    is_timeout: params.is_timeout ? 1 : 0
  };

  return request({
    url: '/v3/interacts/timer/create',
    method: 'POST',
    data: retParmams
  });
};

// 发起端查询活动计时器信息
const getTimerInfo = (params = {}) => {
  return request({
    url: '/v3/interacts/timer/info',
    method: 'POST'
  });
};

// 发起端计时器编辑
const timerEdit = (params = {}) => {
  const retParmams = {
    action_type: params.action_type,
    duration: params.duration,
    remain_time: params.remain_time,
    is_all_show: params.is_all_show ? 1 : 0,
    is_timeout: params.is_timeout ? 1 : 0
  };

  return request({
    url: '/v3/interacts/timer/edit',
    method: 'POST',
    data: retParmams
  });
};

const liveTimerApi = {
  timerCreate,
  getTimerInfo,
  timerEdit
};

export default liveTimerApi;
