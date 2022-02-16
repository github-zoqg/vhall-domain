import request from '@/utils/http.js';

// 打赏
const createReward = (params = {}) => {
  const retParmams = {
    room_id: params.room_id
  };

  return request({
    url: '/v3/interacts/reward/create-user-reward',
    method: 'POST',
    data: params
  });
};

const rewardApi = {
  createReward
};

export default rewardApi;
