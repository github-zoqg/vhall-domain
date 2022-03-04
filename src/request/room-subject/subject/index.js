import request from '@/utils/http.js';
import env, { meetingApiList, roomApiList } from '@/request/env';



// 通过活动id获取活动拥有者用户id
function subjectInitBefore(params) {
  const url = roomApiList['subjectInitBefore']['v3'];
  return request({
    url,
    method: 'POST',
    data: params
  });
}

export default {

  subjectInitBefore

};