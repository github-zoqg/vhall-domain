import { rewardApi } from '@/request/index.js';

export default function watchRewardServer() {
  function createReward(params) {
    return rewardApi.createReward(params);
  }
  return { createReward };
}
