import request from '@/utils/http.js';
import env from '@/request/env';

/**
 * 获取自定义菜单正文细节
 * @param {*} dat
 * @returns
 */
function getCustomMenuDetail(data = {}) {
  const v3 = '/v3/interacts/menu/menu-get-info';
  const middle = '/frontend/live/get-custom-menu';
  const url = env.customMenu ? v3 : middle;

  return request({
    url,
    method: 'POST',
    data
  });
}

/**
 * 获取活动列表
 * @param {*} data
 * @returns
 */
function getActiveList(data = {}) {
  const v3 = '/v3/webinars/webinar/batch-get-webinar-info';
  const middle = '';
  const url = env.customMenu ? v3 : middle;

  return request({
    url,
    method: 'POST',
    data
  });
}

/**
 * 获取专题列表, 批量查询专题详情
 * @param {*} data
 * @returns
 */
function getProjectList(data = {}) {
  const v3 = '/v3/webinars/subject/get-batch-info';
  const middle = '';
  const url = env.customMenu ? v3 : middle;

  return request({
    url,
    method: 'POST',
    data
  });
}

export default {
  getCustomMenuDetail,
  getActiveList,
  getProjectList
};
