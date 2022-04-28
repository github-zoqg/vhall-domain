import request from '@/utils/http.js';
import env from '../env';

// 打赏
const createReward = (params = {}) => {
  let url = env.liveTimer == 'v4' ? '' : '/v3/interacts/reward/create-user-reward';

  const retParmams = {
    room_id: params.room_id
  };

  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

const rewardApi = {
  createReward
};

export default rewardApi;
