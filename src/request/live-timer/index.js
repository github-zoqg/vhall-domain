import request from '@/utils/http.js';
import env from '../env';

// 发起端创建计时器
const timerCreate = (params = {}) => {
  const retParmams = {
    duration: params.duration,
    is_all_show: params.is_all_show ? 1 : 0,
    is_timeout: params.is_timeout ? 1 : 0
  };

  let url = env.liveTimer == 'v4' ? '' : '/v3/interacts/timer/create';

  return request({
    url: url,
    method: 'POST',
    data: retParmams
  });
};

// 发起端查询活动计时器信息
const getTimerInfo = (params = {}) => {
  let url = env.liveTimer == 'v4' ? '' : '/v3/interacts/timer/info';

  return request({
    url: url,
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

  let url = env.liveTimer == 'v4' ? '' : '/v3/interacts/timer/edit';

  return request({
    url: url,
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
