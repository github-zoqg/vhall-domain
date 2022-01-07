//common
import useMsgServer from '@/domain/common/msg.server.js';
import useInteractiveServer from '@/domain/media/interactive.server.js';
import useMediaCheckServer from '@/domain/media/mediaCheck.server.js';
import usePlayerServer from '@/domain/player/player.server.js';
import useDocServer from '@/domain/doc/doc.server.js';

import RoomBaseServer from '@/domain/room/roombase.server.js';
import useUserServer from '@/domain/user/user.server.old.js';
import useVirtualAudienceServer from '@/domain/audience/virtualAudience.server.js';
import useInsertFileServer from '@/domain/media/insertFile.server.js';

import useDesktopShareServer from '@/domain/media/desktopShare.server.js';
import useChatServer from '@/domain/chat/chat.server.js';
import useMicServer from '@/domain/media/mic.server.js';
import useNoticeServer from '@/domain/notice/notice.server.js';
import useMemberServer from '@/domain/member/member.server.js';
import useGroupDiscussionServer from '@/domain/room/groupDiscussion.server.js';

import { getBaseUrl, setToken, setRequestHeaders } from '@/utils/http.js';
import VhallPaasSDK from '../sdk';
import { Dep } from '@/domain/common/base.server';
import { INIT_DOMAIN } from '@/domain/common/dep.const';
/**
 * options:{
    token,
    liveToken,
    plugins:['chat', 'player', 'doc', 'interaction']
  }
 */
class Domain {
  constructor(options) {
    this.setRequestConfig(options);
    Promise.all([this.paasSdkInit(), this.initRoom(options)]).then(res => {
      //触发所有注册的依赖passsdk和房间初始化的回调
      Dep.expenseDep(INIT_DOMAIN, res);
    });
  }

  // 加载paasSdk
  paasSdkInit() {
    return new Promise(resolve => {
      VhallPaasSDK.init({
        plugins: options.plugins || ['chat', 'player', 'doc', 'interaction']
      }).onSuccess(controllers => {
        this.controllers = controllers;
        resolve();
      });
    });
  }

  //设置请求相关配置
  setRequestConfig(options) {
    const { token, liveToken, requestHeaders } = options;
    setToken(token, liveToken);
    requestHeaders && setRequestHeaders(requestHeaders);
  }

  //初始化房间信息
  initRoom(options) {
    const roomBaseServer = new RoomBaseServer();
    return roomBaseServer.initLive(options);
  }
}
export {
  Domain,
  useMsgServer,
  RoomBaseServer,
  useUserServer,
  usePlayerServer,
  useVirtualAudienceServer,
  // useRoomInitGroupServer,
  useInteractiveServer,
  useMediaCheckServer,
  useInsertFileServer,
  useDesktopShareServer,
  useChatServer,
  useMicServer,
  useDocServer,
  useNoticeServer,
  useMemberServer,
  useGroupDiscussionServer
};
