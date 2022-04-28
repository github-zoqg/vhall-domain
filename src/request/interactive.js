import request from '@/utils/http.js';
// import contextServer from '@/domain/common/context.server.js';
import useRoomBaseServer from '@/domain/room/roombase.server';

import env from '@/request/env';

// 设置主屏
const setMainScreen = (params = {}) => {
  const { watchInitData } = useRoomBaseServer().state;
  let retParams = {
    room_id: params.room_id || watchInitData.interact.room_id
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
  const { watchInitData } = useRoomBaseServer().state;

  let retParams = {
    room_id: params.room_id || watchInitData.interact.room_id
  };
  retParams = Object.assign(retParams, params);

  const url =
    env.activity === 'v3' ? '/v3/interacts/room/set-doc-permission' : '/v4/room/set-doc-permission';

  return request({
    url: url,
    method: 'POST',
    data: retParams
  });
}
// 设置主讲人/文档控制权限
const setDesktop = (params = {}) => {
  const { watchInitData } = useRoomBaseServer().state;

  let retParams = {
    room_id: params.room_id || watchInitData.interact.room_id
  };
  retParams = Object.assign(retParams, params);

  const url =
    env.activity === 'v3' ? '/v3/interacts/room/set-desktop' : '/v4/room/set-desktop';

  return request({
    url: url,
    method: 'POST',
    data: retParams
  });
};

export default {
  setMainScreen, // 设置主屏
  setSpeaker, // 设置主讲人
  setDesktop, // 开启桌面共享自动最大化
};
