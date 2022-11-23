import request from '@/utils/http.js';


// 获取快问快答鉴权信息
const getExamToken = params => {
  return request({
    url: '/v3/interacts/exam/get-init-data',
    method: 'post',
    data: params
  });
};
// 推送问卷
const pushExam = params => {
  return request({
    url: '/v3/interacts/exam/paper-send',
    method: 'post',
    data: params
  });
};

// 收卷
const collectExam = params => {
  return request({
    url: '/v3/interacts/exam/paper-end',
    method: 'post',
    data: params
  });
};

// 发布
const publishExam = params => {
  return request({
    url: '/v3/interacts/exam/paper-send-rank',
    method: 'post',
    data: params
  });
};



export default {
  getExamToken,
  pushExam,
  collectExam,
  publishExam
}
