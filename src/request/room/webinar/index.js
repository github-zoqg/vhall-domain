import request from '@/utils/http.js';
import env, { meetingApiList, roomApiList } from '@/request/env';



// 通过活动id获取活动拥有者用户id
function webinarInitBefore(params) {
  const url = roomApiList['webinarInitBefore']['v3'];
  return request({
    url,
    method: 'POST',
    data: params
  });
}

export default {

  webinarInitBefore

};