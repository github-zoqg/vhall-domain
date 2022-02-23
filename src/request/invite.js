import request from '@/utils/http.js';

// 获取播放器配置项
const createInvite = (data = {}) => {
  const v3 = '/v3/interacts/invite-card/watch-get-info';
  const url = v3;

  return request({
    url,
    method: 'POST',
    data
  });
};

const createInviteItem = (data = {}) => {
  const v3 = '/v3/interacts/invite-card/create-invite-self-relation';

  const url = v3;
  return request({
    url,
    method: 'POST',
    data
  });
};

const wechatShare = (data = {}) => {
  const v3 = '/v3/commons/auth/weixin-share';

  const url = v3;
  return request({
    url,
    method: 'POST',
    data
  });
};

export default {
  createInvite,
  createInviteItem,
  wechatShare
};
