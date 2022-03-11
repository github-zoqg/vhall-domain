import request from '@/utils/http.js';
import { roomApiList } from '@/request/env';



// 通过活动id获取活动拥有者用户id
function webinarInitBefore(params) {
  const url = roomApiList['webinarInitBefore']['v3'];
  return request({
    url,
    method: 'POST',
    data: params
  });
}

/**
 * 通过中台接口走灰度
 * @param {*} data
 * @returns
 */
 function webinarInitBeforeByMiddle(params) {
  const url = roomApiList['webinarInitBefore']['middle'];
  return request({
    url: url,
    method: 'POST',
    data: params
  });
};

export default {

  webinarInitBefore,
  webinarInitBeforeByMiddle

};