import request from '@/utils/http.js';
import env from './env';

// 给在线观众分配小组
const groupCreate = (params = {}) => {
  const url = env.doc === 'v3' ? '/v3/interacts/group/create' : ''; // TODO 补充v4接口
  return request({
    url,
    method: 'POST',
    data: params
  });
};

export default {
  groupCreate
};
