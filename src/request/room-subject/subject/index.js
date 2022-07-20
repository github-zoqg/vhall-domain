import request from '@/utils/http.js';
import { roomSubjectApiList } from '@/request/env';



// 通过活动id获取活动拥有者用户id
function subjectInitBefore(params) {
  const url = roomSubjectApiList['subjectInitBefore']['v3'];
  return request({
    url,
    method: 'POST',
    data: params
  });
}
function getSubjectInfo(data = {}) {
  const url = roomSubjectApiList['getSubjectInfo']['v3'];
  return request({
    url,
    method: 'POST',
    data
  });
};


// 专题初始化
function initSubjectInfo(params = {}) {
  const url = roomSubjectApiList['initSubjectInfo']['v3'];
  return request({
    url,
    method: 'Get',
    params
  });
};


// 专题鉴权
function getSubjectWatchAuth(data = {}) {
  const url = roomSubjectApiList['subjectWatchAuth']['v3'];
  return request({
    url,
    method: 'POST',
    data
  });
};


export default {
  getSubjectInfo,
  subjectInitBefore,
  getSubjectWatchAuth,
  initSubjectInfo
};