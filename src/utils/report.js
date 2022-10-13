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
