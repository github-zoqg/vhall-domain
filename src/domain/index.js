//common
import useMsgServer from '@/domain/common/msg.server.js';
import useInteractiveServer from '@/domain/media/interactive.server.js';
import useMediaCheckServer from '@/domain/media/mediaCheck.server.js';
import useMediaSettingServer from '@/domain/media/mediaSetting.server.js';
import usePlayerServer from '@/domain/player/player.server.js';
import useDocServer from '@/domain/doc/doc.server.js';
import useCanvasStreamServer from '@/domain/media/canvasStream.server.js';

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
import useTimerServer from '@/domain/interactiveTools/timer.server.js';
import useGiftsServer from '@/domain/interactiveTools/gift.server.js';
import useWatchRewardServer from '@/domain/interactiveTools/reward.server.js';
import useAttentionServer from '@/domain/interactiveTools/attention.server.js';
import usePraiseServer from '@/domain/interactiveTools/praise.server.js';
import useSignServer from '@/domain/interactiveTools/sign.server.js';
import useSignUpFormServer from '@/domain/interactiveTools/signUpForm.server.js';
import useKeyLoginServer from '@/domain/keyLogin/keyLogin.server.js';

import useCustomMenuServer from '@/domain/brand/customMenu.server';

import useRebroadcastServer from '@/domain/interactiveTools/rebroadcast.server';
import useZIndexServer from '@/domain/interactiveTools/zindexServer.js';

// 问答关联
import useQaAdminServer from '@/domain/interactiveTools/qaadmin.server.js';
import useQaServer from '@/domain/interactiveTools/qa.server.js';
import { setRequestBody, setRequestHeaders } from '@/utils/http.js';
import VhallPaasSDK from '../sdk';
import { Dep } from '@/domain/common/base.server';
import { INIT_DOMAIN } from '@/domain/common/dep.const';
import useChatAuthServer from './chat/chatAuth.server';

import useCashServer from '@/domain/cash/cash.server.js';
// 商品
import useGoodServer from '@/domain/interactiveTools/good.server.js';
import useLotteryServer from '@/domain/interactiveTools/lotteryServer.js';
import useQuestionnaireServer from '@/domain/interactiveTools/questionnaireServer.js';

import useMenuServer from '@/domain/brand/menu.server';
import useInviteServer from '@/domain/interactiveTools/invite.server.js';
import useEntryformServer from '@/domain/entryform/entry.server.js';
import useSubscribeServer from '@/domain/subscribe/subscribe.server';
import useSubjectServer from '@/domain/brand/subject.server';
import useRedPacketServer from '@/domain/interactiveTools/redPacketServer.js';

import useSplitScreenServer from '@/domain/media/splitScreen.server';
import useVideoPollingServer from '@/domain/media/videoPolling.server';

import useHomepageServer from '@/domain/brand/homepage.server';

import useRecommendServer from '@/domain/brand/recommend.server'

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
      setRequestHeaders(options.requestHeaders);
    }
    if (options.requestBody) {
      setRequestBody(options.requestBody);
    }
    let taskList = [];
    // 是否在创建domain实例的时候初始化房间
    if (options.isNotInitRoom) {
      taskList = [this.paasSdkInit(options.plugins)];
    } else {
      taskList = [this.paasSdkInit(options.plugins), this.initRoom(options.initRoom, options.devLogOptions)];
    }
    return Promise.all(taskList).then(res => {
      //触发所有注册的依赖passsdk和房间初始化的回调
      // Dep.expenseDep(INIT_DOMAIN, res);
      return this;
    })
  }

  // 加载paasSdk
  paasSdkInit(options) {
    return new Promise(resolve => {
      console.log('----------------测试异步--------------------------paas sdk开始加载前-----------')
      VhallPaasSDK.init({
        plugins: options || ['chat', 'player', 'doc', 'interaction']
      }).onSuccess(controllers => {
        this.controllers = controllers;
        console.log('----------------测试异步--------------------------paas sdk加载完成后-----------')
        resolve();
      });
    });
  }

  //初始化房间信息
  async initRoom(roomInitOptions, devLogOptions) {
    console.log('----------------测试异步--------------------------日志sdk开始加载前-----------')
    await VhallPaasSDK.loadSdk(['report'])
    console.log('----------------测试异步--------------------------日志sdk加载完成后-----------')
    // 初始化日志上报
    if (devLogOptions) {
      this.initVhallReportForDev(devLogOptions)
    }
    const roomBaseServer = useRoomBaseServer();
    return roomBaseServer.initLive(roomInitOptions);
  }

  // 初始化数据上报, 客户需要的统计数据
  initVhallReport(reportOptions) {
    window.vhallReport = new VhallReport(reportOptions);
  }

  // 开发日志上报
  initVhallReportForDev(logOptions) {
    window.vhallLog = ITextbookLog(logOptions);
  }

  // 微吼直播产品侧需要的数据
  initVhallReportForProduct(reportOptions) {
    window.vhallReportForProduct = new VhallReportForProduct(reportOptions);
  }
}
const version = '__VERSION__';

export {
  Domain,
  useMsgServer,
  useRoomBaseServer,
  useUserServer,
  usePlayerServer,
  useVirtualAudienceServer,
  // useRoomInitGroupServer,
  useInteractiveServer,
  useCanvasStreamServer,
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
  useQaAdminServer,
  useQaServer,
  useCustomMenuServer,
  useRebroadcastServer,
  useTimerServer,
  useGiftsServer,
  useWatchRewardServer,
  useCashServer,
  useAttentionServer,
  useGoodServer,
  usePraiseServer,
  useLotteryServer,
  useSignServer,
  useMenuServer,
  useQuestionnaireServer,
  useInviteServer,
  version,
  useEntryformServer,
  useSignUpFormServer,
  useSubscribeServer,
  useSubjectServer,
  useRedPacketServer,
  useKeyLoginServer,
  useSplitScreenServer,
  useVideoPollingServer,
  useHomepageServer,
  useRecommendServer,
  useZIndexServer
};
