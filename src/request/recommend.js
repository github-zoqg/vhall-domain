import request from '@/utils/http.js';

const queryAdsList = (data = {}, options = {}) => {
  const v3 = '/v3/interacts/recommend-adv/watch-get-adv-list';
  const url = v3;

  const { headers = {} } = options
  return request({
    url,
    method: 'POST',
    data,
    headers
  });
};


export default {
  queryAdsList
};
