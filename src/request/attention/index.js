import request from '@/utils/http.js';
import env from '../env';

/**
 * @function attentionStatus 获取关注状态
 * @param {*} data
 */
const getAttentionStatus = (params = {}) => {
  const url = env.meeting === 'v3' ? '/v3/users/attentions/info' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
};
/**
 * @function attention 关注
 * @param {*} data
 */
const attention = (params = {}) => {
  const url = env.meeting === 'v3' ? '/v3/users/attentions/create' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
};
/**
 * @function no-attention 取消关注
 * @param {*} data
 */
const cancelAttention = (params = {}) => {
  const url = env.meeting === 'v3' ? '/v3/users/attentions/delete' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
};

const attentionApi = {
  getAttentionStatus,
  attention,
  cancelAttention
};

export default attentionApi;
