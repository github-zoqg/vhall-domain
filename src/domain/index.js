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
/**
 * options:{
    token,
    liveToken,
    plugins:['chat', 'player', 'doc', 'interaction']
  }
 */
class Domain {
  constructor(options) {
    //加载passSdk
    VhallPaasSDK.init({
      plugins: options.plugins || ['chat', 'player', 'doc', 'interaction']
    }).onSuccess((controllers) => {
      this.controllers = controllers
    })
    this.setRequestConfig(options);
  }
  //设置请求相关配置
  setRequestConfig(options) {
    const { token, liveToken, requestHeaders } = options
    setToken(token, liveToken);
    requestHeaders && setRequestHeaders(requestHeaders);
  }
  //初始化房间信息
  initRoom(options) {
    const roomBaseServer = new RoomBaseServer();
    roomBaseServer.initLive(options).then(res => {

    })
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
