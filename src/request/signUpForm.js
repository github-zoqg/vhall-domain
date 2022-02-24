import request from '@/utils/http.js';
import env from './env';
/**
 * 检查报名表单是否开启独立链接以及独立链接是否有效
 * */
function fetchVerifyOpenLink(params={}){
  const url = env.signUpForm === 'v3' ? '/v3/webinars/registration-form/verify-open-link' : '';
  return request({
    url,
    method: 'GET',
    data: params
  });
}

/**
 * 获取报名表单题目列表
 * */
function fetchQuestionsList(params={}){
  const url = env.signUpForm === 'v3' ? '/v3/webinars/registration-form/get-form-question-list' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 获取表单基本信息
 * */
function fetchFormBaseInfo(params={}){
  const url = env.signUpForm === 'v3' ? '/v3/webinars/registration-form/get-form-base-info' : '';
  return request({
    url,
    method: 'GET',
    params: params
  });
}

/**
 * 发送手机验证码
 * */
function sendVerifyCode(params={}){
  const url = env.signUpForm === 'v3' ? '/v3/webinars/registration-form/send-verify-code' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 检查用户是否为已报名用户
 * */
function checkIsRegistered(params={}){
  const url = env.signUpForm === 'v3' ? '/v3/webinars/registration-form/check-is-registered' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 提交报名表单
 * */
function submitSignUpForm(params={}){
  const url = env.signUpForm === 'v3' ? '/v3/webinars/registration-form/submit' : '';
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 获取区域列表
 * */
function fetchAreaList(params={}){
  const url = env.signUpForm === 'v3' ? '//cnstatic01.e.vhall.com/saas/common_libs/area.json' : '';
  return request({
    url,
    method: 'GET',
    data: params
  });
}

export default {
  fetchVerifyOpenLink,
  fetchQuestionsList,
  fetchFormBaseInfo,
  sendVerifyCode,
  checkIsRegistered,
  submitSignUpForm,
  fetchAreaList
}