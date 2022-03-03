import request from '@/utils/http.js';

const createInvite = (data = {}, options = {}) => {
  const v3 = '/v3/interacts/invite-card/watch-get-info';
  const url = v3;

  const { headers = {} } = options
  return request({
    url,
    method: 'POST',
    data,
    headers
  });
};

const createInviteItem = (data = {}, options = {}) => {
  const v3 = '/v3/interacts/invite-card/create-invite-self-relation';

  const url = v3;

  const { headers = {} } = options
  return request({
    url,
    method: 'POST',
    data,
    headers
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
