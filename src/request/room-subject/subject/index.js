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


export default {
  getSubjectInfo,
  subjectInitBefore
};