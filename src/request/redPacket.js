/**
 * @description 红包
 */
import request from '@/utils/http.js';

// 发送红包
const createRedpacket = params => {
  return request({
    url: '/v3/interacts/redpacket/create',
    method: 'POST',
    data: params
  });
};

// 获取红包信息
const getRedPacketInfo = params => {
  return request({
    url: '/v3/interacts/redpacket/get-redpacket-status',
    method: 'POST',
    data: params
  });
};

// 开红包
const openRedpacket = params => {
  return request('/v3/interacts/redpacket/open-redpacket', {
    method: 'POST',
    data: params
  });
};

// 红包获奖人列表
const getRedPacketWinners = params => {
  return request('/v3/interacts/redpacket/get-redpacket-partition-recorder', {
    method: 'POST',
    data: params
  });
};

export default {
  createRedpacket,
  getRedPacketInfo,
  openRedpacket,
  getRedPacketWinners
};
