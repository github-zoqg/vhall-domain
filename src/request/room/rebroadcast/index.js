import request from '@/utils/http.js';
import env from '@/request/env';

// 列表
function getRebroadcastList(data = {}) {
  const v3 = '/v3/webinars/rebroadcast/list';
  const middle = '';
  const url = env.rebroadcast === 'v3' ? v3 : middle;

  return request({
    url,
    method: 'POST',
    data
  });
}

// 预览
function rebroadcastPreview(data = {}) {
  const v3 = '/v3/webinars/rebroadcast/preview';
  const middle = '';
  const url = env.rebroadcast === 'v3' ? v3 : middle;

  return request({
    url,
    method: 'POST',
    data
  });
}

// 开始转播
function startRebroadcast(data = {}) {
  const v3 = '/v3/webinars/rebroadcast/start';
  const middle = '';
  const url = env.rebroadcast === 'v3' ? v3 : middle;

  return request({
    url,
    method: 'POST',
    data
  });
}

// 结束转播
function stopRebroadcast(data = {}) {
  const v3 = '/v3/webinars/rebroadcast/stop';
  const middle = '';
  const url = env.rebroadcast === 'v3' ? v3 : middle;

  return request({
    url,
    method: 'POST',
    data
  });
}

export default {
  getRebroadcastList,
  rebroadcastPreview,
  startRebroadcast,
  stopRebroadcast
};
