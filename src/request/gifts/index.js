import request from '@/utils/http.js';
import env from '../env';

// 获取礼物列表
const queryGiftsList = (params = {}) => {
  const retParmams = {
    room_id: params.room_id
  };

  let url = env.gifts == 'v3' ? '/v3/interacts/gift/get-webinar-using-gift-list' : '';

  return request({
    url: url,
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

  let url = env.gifts == 'v3' ? '/v3/interacts/gift/send-gift' : '';

  return request({
    url: url,
    method: 'POST',
    data: retParmams
  });
};

const giftsApi = {
  queryGiftsList,
  sendGift
};

export default giftsApi;
