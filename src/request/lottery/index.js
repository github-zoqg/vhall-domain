import request from '@/utils/http.js';

// 奖品列表(该接口必须为FormData)
const getPrizeList = params => {
  return request({
    url: '/v3/vss/lottery/post/get-prize-list',
    method: 'POST',
    data: {
      pos: 0,
      limit: 20,
      source: 0,
      ...params
    },
    dataType: 'FormData'
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
    data: params,
    dataType: 'FormData'
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

// /v3/vss/lottery/award/check 「聊天内点击」
function resultCheck() {}

// /v3/vss/lottery/users-get 「设置是否公布中奖结果」
function setPublishResult() {}

// /v3/vss/lottery/watch/get-draw-prize-info 「填写信息采集表单，中奖用户」
function getDrawPrizeInfo() {}

// /v3/vss/lottery/award
function getAwardInfo() {}

// /v4/lottery/count 「获取在线人数」
function getLotteryCount() {}

export default {
  getPrizeList,
  pushLottery,
  queryQualifiedPerson,
  updateUserStatus,
  checkLottery,
  endLottery
};
