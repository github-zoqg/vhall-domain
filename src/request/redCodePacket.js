/**
 * @description 口令红包
 */
import request from '@/utils/http.js';

// 发送红包（口令红包）
const createCodeRedpacket = params => {
  return request({
    url: '/v3/interacts/pwd-redpacket/create',
    method: 'POST',
    data: params
  });
};


// 获取红包信息
const getCodeRedPacketInfo = params => {
  return request({
    url: '/v3/interacts/pwd-redpacket/get-redpacket-status',
    method: 'POST',
    data: params
  });
};

// 开红包
const openCodeRedpacket = params => {
  return request('/v3/interacts/pwd-redpacket/open-redpacket', {
    method: 'POST',
    data: params
  });
};

// 红包获奖人列表
const getCodeRedPacketWinners = params => {
  return request('/v3/interacts/pwd-redpacket/get-redpacket-partition-recorder', {
    method: 'POST',
    data: params
  });
};

// 获取最后一个红包的领取信息
const getLatestCodeRedpacketUsage = params => {
  return request('/v3/interacts/pwd-redpacket/get-latest-redpacket-usage', {
    method: 'GET',
    params
  });
};

// 获取红包总人数
const getRedpacketTotal = params => {
  return request('/v3/interacts/chat-user/get-online-count', {
    method: 'POST',
    data: params
  });
};


export default {
  createCodeRedpacket,
  getCodeRedPacketInfo,
  openCodeRedpacket,
  getCodeRedPacketWinners,
  getLatestCodeRedpacketUsage,
  getRedpacketTotal
};
