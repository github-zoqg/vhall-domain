import request from '@/utils/http.js';

const getSubjectInfo = (data = {}) => {
  const v3 = '/v3/webinars/subject/info';

  const url = v3;
  return request({
    url,
    method: 'POST',
    data
  });
};

export default {
  getSubjectInfo
};
