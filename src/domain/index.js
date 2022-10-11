//common
import useMsgServer from '@/domain/common/msg.server.js';
import useInteractiveServer from '@/domain/media/interactive.server.js';
import useMediaCheckServer from '@/domain/media/mediaCheck.server.js';
import useMediaSettingServer from '@/domain/media/mediaSetting.server.js';
import useMediaStaticMicrophoneServer from '@/domain/media/mediaStaticMicrophone.server.js';
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
import FullLinkReport from '@/utils/fullLink.report.js'
import VhallPaasSDK, { ALLSDKCONFIG } from '../sdk';
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
import useCodeRedPacketServer from '@/domain/interactiveTools/redCodePacketServer.js';

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
      // 如果初始化存在 clientType，domain 会自动将 clientType 添加到请求头
      if (options.initRoom?.clientType) {
        setRequestHeaders({
          ...options.requestHeaders,
          'client-type': options.initRoom.clientType
        });
      } else {
        setRequestHeaders(options.requestHeaders);
      }
    }
    if (options.requestBody) {
      setRequestBody(options.requestBody);
    }

    let taskList = VhallPaasSDK.init(options.plugins, options.questionnaireNoDefer = false);
    // 是否在创建domain实例的时候初始化房间
    if (!options.isNotInitRoom) {
      taskList.push(this.initRoom(options.initRoom, options.devLogOptions))
    }
    return Promise.all(taskList).then(res => {
      //触发所有注册的依赖passsdk和房间初始化的回调
      // Dep.expenseDep(INIT_DOMAIN, res);
      for (const item of Object.values(ALLSDKCONFIG)) {
        if (item.name && window[item.name]) {
          VhallPaasSDK.modules[item.name] = window[item.name];
        }
      }
      return this;
    })
  }


  //初始化房间信息
  async initRoom(roomInitOptions, devLogOptions) {

    // 加载 report Sdk
    await VhallPaasSDK.loadReportSdk();

    // 初始化【开发侧】日志上报
    if (devLogOptions) {
      window.vhallLog = window.ITextbookLog(devLogOptions)
    }
    const roomBaseServer = useRoomBaseServer();
    return roomBaseServer.initLive(roomInitOptions);
  }

  // 初始化数据上报, 【客户】需要的统计数据
  initVhallReport(reportOptions) {
    window.vhallReport = new VhallReport(reportOptions);
  }


  // 微吼直播【产品侧】需要的数据(观看端,接入数据信息平台,与发起端区分)
  initVhallReportForWatch(reportOptions) {
    window.vhallReportForWatch = new VhallReportForProduct(reportOptions);
  }

  // 微吼直播【产品侧】需要的数据
  initVhallReportForProduct(reportOptions) {
    window.vhallReportForProduct = new VhallReportForProduct(reportOptions);

    // 链路埋点实例化
    const fullLinkReport = new FullLinkReport({
      reportOptions: reportOptions,
      useRoomBaseServer: useRoomBaseServer,
      reportCallback: rId => {
        rId && setRequestHeaders({
          'request-id': rId
        })
      }
    });
    window.vhallReportForProduct.toReport = fullLinkReport.report;
    window.vhallReportForProduct.toStartReporting = fullLinkReport.startReporting.bind(fullLinkReport)
    window.vhallReportForProduct.toResultsReporting = fullLinkReport.resultsReporting.bind(fullLinkReport)

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
  useMediaStaticMicrophoneServer,
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
  useCodeRedPacketServer,
  useKeyLoginServer,
  useSplitScreenServer,
  useVideoPollingServer,
  useHomepageServer,
  useRecommendServer,
  useZIndexServer
};
