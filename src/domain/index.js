//common
import useMsgServer from '@/domain/common/msg.server.js';
import useInteractiveServer from '@/domain/media/interactive.server.js';
import useMediaCheckServer from '@/domain/media/mediaCheck.server.js';
import useMediaSettingServer from '@/domain/media/mediaSetting.server.js';
import usePlayerServer from '@/domain/player/player.server.js';
import useDocServer from '@/domain/doc/doc.server.js';

import useRoomBaseServer from '@/domain/room/roombase.server.js';
import useUserServer from '@/domain/user/userServer.js';
import useVirtualAudienceServer from '@/domain/audience/virtualAudience.server.js';
import useInsertFileServer from '@/domain/media/insertFile.server.js';

import useDesktopShareServer from '@/domain/media/desktopShare.server.js';
import useChatServer from '@/domain/chat/chat.server.js';
import useMicServer from '@/domain/media/mic.server.js';
import useNoticeServer from '@/domain/notice/notice.server.js';
import useMemberServer from '@/domain/member/member.server.js';
import useGroupServer from '@/domain/group/StandardGroupServer';
import useLiveTimerServer from '@/domain/live-timer/liveTimer.server.js';
import useGiftsServer from '@/domain/gifts/gifts.server.js';

import useCustomMenuServer from '@/domain/brand/customMenu.server';

// 问答
import useQaServer from '@/domain/interactiveTools/qa.server.js';

import { setToken, setRequestHeaders } from '@/utils/http.js';
import VhallPaasSDK from '../sdk';
import { Dep } from '@/domain/common/base.server';
import { INIT_DOMAIN } from '@/domain/common/dep.const';
import useChatAuthServer from './chat/chatAuth.server';
/**
 * options:{
    token,
    liveToken,
    plugins:['chat', 'player', 'doc', 'interaction']
  }
 */
class Domain {
  constructor(options) {
    if (options.requestHeaders) {
      this.setRequestConfig(options.requestHeaders);
    }
    let taskList = [];
    // 是否在创建domain实例的时候初始化房间
    if (options.isNotInitRoom) {
      taskList = [this.paasSdkInit(options.plugins)];
    } else {
      taskList = [this.paasSdkInit(options.plugins), this.initRoom(options.initRoom)];
    }
    return Promise.all(taskList).then(res => {
      //触发所有注册的依赖passsdk和房间初始化的回调
      // Dep.expenseDep(INIT_DOMAIN, res);
      return this;
    });
  }

  // 加载paasSdk
  paasSdkInit(options) {
    return new Promise(resolve => {
      VhallPaasSDK.init({
        plugins: options || ['chat', 'player', 'doc', 'interaction']
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
    const roomBaseServer = useRoomBaseServer();
    return roomBaseServer.initLive(options);
  }

  // 初始化数据上报
  initVhallReport(reportOptions, logOptions) {
    window.vhallReport = new VhallReport(reportOptions);
    window.vhallLog = ITextbookLog(logOptions);
  }
}
export {
  Domain,
  useMsgServer,
  useRoomBaseServer,
  useUserServer,
  usePlayerServer,
  useVirtualAudienceServer,
  // useRoomInitGroupServer,
  useInteractiveServer,
  useMediaCheckServer,
  useMediaSettingServer,
  useInsertFileServer,
  useDesktopShareServer,
  useChatServer,
  useChatAuthServer,
  useMicServer,
  useDocServer,
  useNoticeServer,
  useMemberServer,
  useGroupServer,
  useQaServer,
  useCustomMenuServer,
  useLiveTimerServer,
  useGiftsServer
};
