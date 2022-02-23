import request from '@/utils/http.js';

// 复制问卷
const queryQuestionnaireList = params => {
  return request({
    url: '/v3/vss/survey/list-webinar-survey',
    method: 'GET',
    params: params
  });
};

// 复制问卷
const copyQuestionnaire = params => {
  return request({
    url: '/v3/vss/survey/copy-webinar-survey',
    method: 'GET',
    params: params
  });
};
// 删除问卷
const deleteQuestionnaire = params => {
  return request({
    url: '/v3/vss/survey/delete-webinar-surveys',
    method: 'POST',
    data: params
  });
};
//
const createLiveQuestion = params => {
  return request({
    url: '/v3/vss/survey/create-webinar-survey',
    method: 'POST',
    data: params
  });
};
// 主持人
const copyMainQuestion = params => {
  return request({
    url: '/v3/vss/survey/copy-shared-survey',
    method: 'GET',
    params
  });
};
// 助理/嘉宾
const copyQuestion = params => {
  return request({
    url: '/v3/vss/survey/copy-shared-survey-other',
    method: 'POST',
    data: params
  });
};

// 发布问卷
const publishQuestionnaire = params => {
  return request({
    url: '/v3/vss/survey/publish-survey',
    method: 'POST',
    data: params
  });
};

// 编辑问卷
const editQuestionnaire = params => {
  return request({
    url: '/v3/vss/survey/update-webinar-survey',
    method: 'POST',
    data: params
  });
};

export default {
  queryQuestionnaireList,
  copyQuestionnaire,
  deleteQuestionnaire,
  createLiveQuestion,
  copyMainQuestion,
  copyQuestion,
  publishQuestionnaire,
  editQuestionnaire
};
