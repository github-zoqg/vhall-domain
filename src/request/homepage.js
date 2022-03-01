/**
 * @description 个人主页相关接口
 * @param {*} [params={}]
 * @return {*}
 */

import request from '@/utils/http.js';
import env from './env';

/**
* 获取直播列表
* */
const getlivingList = (params = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/webinars/webinar/get-list' : '',
    method: 'POST',
    data: params
  });
};

/**
* 获取专题列表
* */
const getSubjectList = (params = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/webinars/subject/get-list' : '',
    method: 'POST',
    data: params
  });
};

/**
* 个人主页查询接口
* */
const getUserHomeList = (params = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/users/homepage/get-info' : '',
    method: 'POST',
    data: params
  });
};


export default {
  getlivingList,
  getSubjectList,
  getUserHomeList
}