import request from '@/utils/http.js';

// 获取礼物列表
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

// 发送礼物
const sendGift = (params = {}) => {
  const retParmams = {
    gift_id: params.gift_id,
    channel: params.channel,
    service_code: params.service_code,
    room_id: params.room_id
  };

  return request({
    url: '/v3/interacts/gift/send-gift',
    method: 'POST',
    data: retParmams
  });
};

const giftsApi = {
  queryGiftsList,
  sendGift
};

export default giftsApi;
