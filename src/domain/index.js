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
      setRequestHeaders(options.requestHeaders);
    }
    if (options.requestBody) {
      setRequestBody(options.requestBody);
    }

    let taskList = VhallPaasSDK.init(options.plugins);
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

  // 微吼直播【产品侧】需要的数据
  initVhallReportForProduct(reportOptions) {
    window.vhallReportForProduct = new VhallReportForProduct(reportOptions);
    this.fullLinkBurningPointReport(reportOptions);
  }

  // ** 微吼直播新加入埋点上报方式（代理，全链路） **
  fullLinkBurningPointReport(reportOptions) {

    // 测试上报开关
    let isReport = sessionStorage.getItem('isReport');
    if (!JSON.parse(isReport)) {
      isReport = confirm("是否开启上报功能");
      sessionStorage.setItem('isReport', isReport)
    }


    let requestId = 'xxx';
    let cacheReportCode = {};
    const useRoomBaseState = useRoomBaseServer().state;
    const { watchInitData } = useRoomBaseState;
    const { join_info = {}, webinar = {}, interact = {}, sso = {} } = watchInitData;

    // 生成request_id 规则：用户ID + 活动ID + 时间戳
    const randomCode = (type = 0) => {
      let onlyTimeStamp = new Date().getTime();
      return `${join_info.third_party_user_id}${webinar.id}${onlyTimeStamp}${type}`;
    }
    window.vhallFullLinkBurningPointReport = new VhallReportForProduct(reportOptions);

    // 上报地址
    window.vhallFullLinkBurningPointReport.BASE_URL = "https://t-dc.e.vhall.com/login";

    // 扩展实例后的全局通用上报属性
    window.vhallFullLinkBurningPointReport.commonParams = {
      ...{
        os: 10,
        // B端账号id
        business_uid: join_info.third_party_user_id,
        // 游客ID
        visitor_id: watchInitData.visitor_id,
        // 用户唯一id
        sso_union_id: sso.kick_id,
        // 用户昵称
        nickname: encodeURIComponent(join_info.nickname),
        // 回放ID
        record_id: webinar.id,
        // 活动名称(内容名称)
        webinar_name: webinar.userinfo.nickname,
        // 是否登录状态
        is_login: join_info.user_id,
        // 房间ID
        room_id: interact.room_id,
        // 互动房间id
        inav_id: interact.inav_id,
        // 聊天室id
        channel_id: interact.channel_id,
        // 直播场次ID
        switch_id: watchInitData.switch.switch_id,
        // 语言类型
        language_type: useRoomBaseState.languages.lang.type,
        // 用户类型
        role_name: join_info.role_name,
        // UA设备
        ua: window.navigator.userAgent,
        // 物料种类 【缺少】
        //file_type:,
      },
      ...window.vhallReportForProduct.commonParams,
      ...{
        s: watchInitData?.visitor_id || join_info?.third_party_user_id
      }
    };
    // 装饰report函数增加新能力
    const decorationExtensionReport = (name, execute, source = window.vhallFullLinkBurningPointReport) => {
      let fn = source[name]
      source[name] = function (type, options) {

        // options => null {} {report_extra:{}}

        requestId = randomCode(type);

        // 此处兼容历史上报数据扩展字段缺失问题
        if (!options) {
          options = { report_extra: { request_id: requestId } }
        } else if (!options.report_extra) {
          options.report_extra = {
            request_id: requestId
          }
        }

        // options => { report_extra: { request_id: 1 } }
        // 此处兼容老的上报参数，新上报参数，需要 report_extra 为必填项
        if (!('request_id' in options.report_extra))
          options.report_extra['request_id'] = requestId;
        else
          requestId = options.report_extra.request_id;

        return execute(fn.bind(source, type, options))
      }
    }
    decorationExtensionReport('report', report => {
      // 设置请求Header 唯一值，用于上报信息关联
      setRequestHeaders({
        'request-id': requestId
      })
      // 上报开关
      isReport && report();
    })


    // 开始上报
    window.vhallReportForProduct.toStartReporting = (eventId, relationalEventIds, extendOptions = {}) => {

      let _randomCode = randomCode(eventId);

      if (typeof relationalEventIds === 'number') relationalEventIds = [relationalEventIds];

      relationalEventIds.forEach(element => {
        cacheReportCode[element] = _randomCode
      });

      window.vhallFullLinkBurningPointReport.report(eventId, {
        report_extra: {
          ...{
            request_id: _randomCode
          },
          ...extendOptions
        }
      });
    }

    // 结果上报
    window.vhallReportForProduct.toResultsReporting = (eventId, extendOptions = {}) => {

      window.vhallFullLinkBurningPointReport.report(eventId, {
        report_extra: {
          ...{
            request_id: cacheReportCode[eventId]
          },
          ...extendOptions
        }
      });
    }

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
