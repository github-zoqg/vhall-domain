import request from '@/utils/http.js';

const getPrizeList = params => {
  return request({
    url: '/v3/vss/lottery/post/get-prize-list',
    method: 'POST',
    data: {
      pos: 0,
      limit: 20,
      source: 0,
      ...params
    }
  });
};

const checkLottery = () => {
  return request({
    url: '/v3/vss/lottery/check',
    method: 'GET'
  });
};

// 发起抽奖
const pushLottery = params => {
  return request({
    url: '/v3/vss/lottery/add',
    method: 'POST',
    data: params
  });
};

// 获取可参与人数
const queryQualifiedPerson = params => {
  return request({
    url: '/v3/vss/lottery/search',
    method: 'GET',
    params: params
  });
};

// 更新在线用户
const updateUserStatus = params => {
  return request({
    url: '/v3/vss/lottery/update-user-status',
    method: 'GET',
    params: params
  });
};

// 结束抽奖
const endLottery = params => {
  return request({
    url: '/v3/vss/lottery/end',
    method: 'POST',
    params: params
  });
};

// 获取中奖人列表
const getWinnerList = params => {
  return request('/v3/vss/lottery/users-get', {
    method: 'POST',
    data: params
  });
};

// 检测是否已提交领奖信息
const checkLotteryResult = params => {
  return request('/v3/vss/lottery/award/check', {
    method: 'POST',
    data: params
  });
};

// 获取中奖页信息
const getDrawPrizeInfo = params => {
  return request('/v3/vss/lottery/watch/get-draw-prize-info', {
    method: 'POST',
    data: params
  });
};

// 提交中奖人信息
const acceptPrize = params => {
  return request('/v3/vss/lottery/award', {
    method: 'POST',
    data: params
  });
};

const joinLottery = params => {
  return request('/v3/vss/lottery/participation', {
    method: 'POST',
    data: params
  });
};


// /v3/vss/lottery/award/check 「聊天内点击」
function resultCheck() { }

// /v3/vss/lottery/users-get 「设置是否公布中奖结果」
function setPublishResult() { }

// /v3/vss/lottery/award
function getAwardInfo() { }

export default {
  getPrizeList,
  pushLottery,
  queryQualifiedPerson,
  updateUserStatus,
  checkLottery,
  endLottery,
  getWinnerList,
  checkLotteryResult,
  getDrawPrizeInfo,
  acceptPrize,
  joinLottery
};
