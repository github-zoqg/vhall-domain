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

  // 测试上报开关
  let isReport = true;


  // let isReport = sessionStorage.getItem('isReport');
  // if (!JSON.parse(isReport)) {
  //   isReport = confirm("是否开启上报功能");
  //   sessionStorage.setItem('isReport', isReport)
  // }


  let requestId = 'xxx';
  let cacheReportCode = {};
  const useRoomBaseState = options.useRoomBaseServer().state;
  const { watchInitData } = useRoomBaseState;
  const { join_info = {}, webinar = {}, interact = {}, sso = {} } = watchInitData;

  // 生成request_id 规则：用户ID + 活动ID + 时间戳 + 事件ID
  const randomCode = (type = 0) => {
    let onlyTimeStamp = new Date().getTime();
    return `${join_info.third_party_user_id}${webinar.id}${onlyTimeStamp}${type}`;
  }

  window.vhallFullLinkBurningPointReport = new VhallReportForProduct(options.reportOptions);

  // 上报地址
  window.vhallFullLinkBurningPointReport.BASE_URL = options.reportOptions.env === 'test' ? 'https://t-dc.e.vhall.com/login' : 'https://dc.e.vhall.com/login';

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

      // 处理中文 base64（window.btoa） 的编码错误
      options.report_extra = encodeURIComponent(JSON.stringify(options.report_extra))
      return execute(fn.bind(source, type, options))
    }
  }
  decorationExtensionReport('report', report => {
    options.reportCallback(requestId)
    // 设置请求Header 唯一值，用于上报信息关联
    // setRequestHeaders({
    //   'request-id': requestId
    // })
    // 上报开关
    isReport && report();
  })


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