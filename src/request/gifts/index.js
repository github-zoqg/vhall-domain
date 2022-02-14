import request from '@/utils/http.js';

// 发起端创建计时器
const queryGiftsList = (params = {}) => {
  const retParmams = {
    room_id: params.room_id
  };

  return request({
    url: '/v3/interacts/gift/get-webinar-using-gift-list',
    method: 'POST',
    data: retParmams
  });
};

const giftsApi = {
  queryGiftsList
};

export default giftsApi;
