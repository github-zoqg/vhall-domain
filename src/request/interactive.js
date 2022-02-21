import request from '@/utils/http.js';
import contextServer from '@/domain/common/context.server.js';
import env from '@/request/env';

// 设置主屏
const setMainScreen = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');

  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id
  };
  retParams = Object.assign(retParams, params);

  return request({
    url: '/v3/interacts/room/set-main-screen',
    method: 'POST',
    data: retParams
  });
};

// 设置主讲人/文档控制权限
const setSpeaker = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');

  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id
  };
  retParams = Object.assign(retParams, params);

  const url = env.activity === 'v3' ? '/v3/interacts/room/set-doc-permission' : '/v4/room/set-doc-permission';

  return request({
    url: url,
    method: 'POST',
    data: retParams
  });
};

export default {
  setMainScreen, // 设置主屏
  setSpeaker // 设置主讲人
};
