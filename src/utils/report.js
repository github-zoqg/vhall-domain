/**
 * domain 数据埋点
 * 尽量减少侵入式埋点对业务逻辑的影响，在本文件封装上报方法，进行数据的组装、上报。
 * 方法命名规则：report_{server名称}_{事件名称}
 */

import { _toString } from '@/utils/index'

/**
 * 获取通用上报信息
 * @returns commonData
 */
function getCommonReportInfo() {
  return {
    // 浏览器信息
    ua: navigator.userAgent,
    // 用户信息
    visitorId: sessionStorage.getItem('visitorId'),
    token: localStorage.getItem('token'),
    interact_token: sessionStorage.getItem('interact_token'),
  }
}

/**
 * 远端流视频或音频 mute 更改事件
 * @param {Object} eventData
 */
export function report_interactive_stream_mute(eventData) {
  try {
    const resultData = {
      ...eventData?.event?.data,
      speakerList: eventData?.speakerList && JSON.parse(eventData?.speakerList)
    }
    // stream 对象非常大且是本事件不关心的信息，故不上报
    if (Object.prototype.hasOwnProperty.call(resultData, 'stream')) {
      delete resultData.stream
    }
    window.vhallLog && window.vhallLog({
      tag: 'domain_interactive_stream_mute', // 日志所属功能模块，命名规则：domain_{server名称}_{事件名称}
      commonData: getCommonReportInfo(),
      eventData: _toString(resultData),
      type: 'log' // log 日志埋点，event 业务数据埋点
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * 全链路上报
 * @param {Object} options
 */
export function fullLinkBurningPointReport(options) {


  // let isReport = sessionStorage.getItem('isReport');
  // if (!JSON.parse(isReport)) {
  //   isReport = confirm("是否开启上报功能");
  //   sessionStorage.setItem('isReport', isReport)
  // }


  let requestId = 'xxx';
  let cacheReportCode = {};
  const useRoomBaseState = options.useRoomBaseServer().state;

  const { watchInitData } = useRoomBaseState;
  const { join_info = {}, webinar = {}, interact = {}, sso = {}, record = {} } = watchInitData;

  // 生成request_id 规则：用户ID + 活动ID + 时间戳 + 事件ID
  const randomCode = (eventId = 0) => {
    let onlyTimeStamp = new Date().getTime();
    return `${join_info.third_party_user_id}${webinar.id}${onlyTimeStamp}${eventId}`;
  }

  window.vhallFullLinkBurningPointReport = new VhallReportForProduct(options.reportOptions);

  // 上报地址
  window.vhallFullLinkBurningPointReport.BASE_URL = options.reportOptions.env === 'test' ? 'https://t-dc.e.vhall.com/login' : 'https://dc.e.vhall.com/login';



  // 扩展实例后的全局通用上报属性
  const setGeneralProperties = () => {

    window.vhallFullLinkBurningPointReport.commonParams = {
      ...{
        os: 10,
        // 游客ID
        visitor_id: watchInitData.visitor_id,
        // 用户唯一id
        sso_union_id: sso.kick_id,
        // 用户昵称 todo 需要判断来源
        nickname: encodeURIComponent(join_info.nickname),
        // 回放ID
        record_id: record.paas_record_id,
        // 活动名称(内容名称)
        webinar_name: encodeURIComponent(webinar.subject),
        // 是否登录状态
        is_login: join_info.user_id == 0 ? 0 : 1,
        // 房间ID
        room_id: interact.room_id,
        // 互动房间id
        inav_id: interact.inav_id,
        // 聊天室id
        channel_id: interact.channel_id,
        // 直播场次ID
        switch_id: watchInitData.switch.switch_id,
        // 语言类型
        // language_type: useRoomBaseState.languages.lang.type,
        language_type: localStorage.getItem('lang') || 1,
        // 用户类型
        role_name: join_info.role_name,
        // UA设备
        ua: window.navigator.userAgent,
        // 物料种类 【缺少】
        file_type: webinar.type,
        // 活动类型
        webinar_type: webinar.mode,
        // 活动ID
        webinar_id: webinar.id,
        // 参会ID
        reg_id: join_info.join_id,

        // 创建时间
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
      ...window.vhallReportForProduct.commonParams,
      ...{
        user_id: join_info.user_id,
        // B端账号id
        business_uid: webinar.userinfo.user_id,
        // 应用ID 来源于paas
        app_id: interact.paas_app_id,
        // 播放平台类型
        pf: VhallPaasSDK.modules.VhallRTC.isMobileDevice() ? 10 : 7,
        // 会话ID
        s: (() => {
          const current = new Date().getTime();
          const visitorId = watchInitData?.visitor_id || join_info?.third_party_user_id;
          return `${interact.paas_app_id}_${visitorId}${current}`;
        })()

      }
    };
  }

  // 装饰report函数增加新能力
  const decorationExtensionReport = (name, execute, source = window.vhallFullLinkBurningPointReport) => {
    let fn = source[name]
    source[name] = function (eventId, options) {

      // options => null {} {report_extra:{}}
      requestId = randomCode(eventId);

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

      try {
        // 处理中文 base64（window.btoa） 的编码错误
        options.report_extra = JSON.parse(JSON.stringify(options.report_extra).replace(/([^\u0000-\u00FF])/g, $ => encodeURIComponent($)))
      } catch (err) {
        console.log(err)
      }

      return execute(fn.bind(source, eventId, options))
    }
  }
  decorationExtensionReport('report', report => {

    setGeneralProperties();
    options.reportCallback(requestId)
    // 设置请求Header 唯一值，用于上报信息关联
    // setRequestHeaders({
    //   'request-id': requestId
    // })

    // 上报开关 (TODO 预留开关)
    const isReport = sessionStorage.getItem('isReport') || 'ON'
    isReport == 'ON' && report();
  })


  window.vhallReportForProduct.toReport = window.vhallFullLinkBurningPointReport.report;

  /**
   * 链路开始上报
   * @param {Number} eventId 事件ID
   * @param {Array} relationalEventIds  事件ID对应的结果链路ID
   * @param {Object} extendOptions 扩展参数
   */
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


  /**
   * 链路结果上报
   * @param {Number} resultEventId 事件ID
   * @param {Object} extendOptions 扩展参数
   */
  window.vhallReportForProduct.toResultsReporting = (resultEventId, extendOptions = {}) => {

    window.vhallFullLinkBurningPointReport.report(resultEventId, {
      report_extra: {
        ...{
          request_id: cacheReportCode[resultEventId]
        },
        ...extendOptions
      }
    });
  }

}