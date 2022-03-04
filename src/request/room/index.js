import request from '@/utils/http.js';
import env, { roomApiList } from '@/request/env';


/**
 * 设置房间观看端布局/清晰度
 * */
function setStream(params = {}) {
  return request({
    url: '/v3/interacts/room/set-stream',
    method: 'POST',
    data: params
  });
}


export default {
  setStream
};
