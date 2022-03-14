import request from '@/utils/http.js';

// 条件查询问卷
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
    params
  });
};
// 主持人复制问卷
const copyMainQuestionnaire = params => {
  return request({
    url: '/v3/vss/survey/copy-shared-survey',
    method: 'GET',
    params
  });
};
// 助理/嘉宾
const copyOtherQuestionnaire = params => {
  return request({
    url: '/v3/vss/survey/copy-shared-survey-others',
    method: 'GET',
    params
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

// 提交问卷
const submitQuestionnaire = params => {
  return request({
    url: '/v3/vss/survey/submit-answer',
    method: 'POST',
    data: params
  });
};
// 回放时，可以填写问卷
const getVodQuestion = params => {
  return request({
    url: '/v3/vss/survey/check-can-answer',
    method: 'GET',
    params
  });
};
// 是否提交问卷
const checkAnswerStatus = params => {
  return request({
    url: '/v3/vss/survey/check-can-answer',
    method: 'GET',
    params
  });
};
// 获取最后一次问卷
const getLastSurvey = params => {
  return request({
    url: '/v3/vss/survey/latest-publish-webinar-survey',
    method: 'GET',
    params
  });
};

export default {
  queryQuestionnaireList,
  copyMainQuestionnaire,
  copyOtherQuestionnaire,
  copyQuestionnaire,
  deleteQuestionnaire,
  createLiveQuestion,
  publishQuestionnaire,
  editQuestionnaire,
  submitQuestionnaire,
  checkAnswerStatus,
  getVodQuestion,
  getLastSurvey
};
