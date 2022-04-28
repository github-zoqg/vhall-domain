import request from '@/utils/http.js';
import env from '../env';

/**
 * @function postPraiseIncrement 提交点赞数量
 * @param {*} data
 */
const postPraiseIncrement = (params = {}) => {
  const url = env.meeting === 'v3' ? '/v3/interacts/like/create-user-like' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
};

const praiseApi = {
  postPraiseIncrement
};

export default praiseApi;
