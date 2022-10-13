
export default class FullLinkReport {
  constructor(_option) {

    this.debug = false;
    this.isReport = 'ON';
    this.requestId = 'xxx';
    this.cacheReportCode = {};
    this.options = _option;
    this.useRoomBaseState = this.options.useRoomBaseServer().state;

    // 实例化上报服务
    this.vhallFullLinkBurningPointReport = new VhallReportForProduct(this.options.reportOptions);

    // 设定上报地址
    this.vhallFullLinkBurningPointReport.BASE_URL = this.options.reportOptions.env === 'test' ? 'https://t-dc.e.vhall.com/login' : 'https://dc.e.vhall.com/login';

    this.extendInstanceReport('report', report => {
      this.vhallFullLinkBurningPointReport.commonParams = this.getCommonParams();
      this.options.reportCallback(this.requestId)

      // 上报开关 (TODO 预留开关)
      this.isReport = sessionStorage.getItem('isReport') || 'ON'
      this.isReport == 'ON' && report();
    }, this.vhallFullLinkBurningPointReport);

    this.report = this.vhallFullLinkBurningPointReport.report;
  }



  // 上报基础参数配置
  getCommonParams() {
    const { watchInitData } = this.useRoomBaseState;
    const { join_info = {}, webinar = {}, interact = {}, sso = {}, record = {} } = watchInitData;
    return {
      ...{
        os: 10,
        // 游客ID
        visitor_id: watchInitData.visitor_id,
        // 用户唯一id
        sso_union_id: sso.kick_id,
        // 用户昵称 todo 需要判断来源
        nickname: encodeURIComponent(join_info.nickname),
        // 回放ID
        record_id: record.paas_record_id || '',
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
      ...window.vhallReportForProduct.commonParams || {},
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


  // 生成唯一链路ID（request-id）
  createRequestId(eventId = 0) {
    const { join_info = {}, webinar = {} } = this.useRoomBaseState.watchInitData;
    let onlyTimeStamp = new Date().getTime();
    return `${join_info.third_party_user_id}${webinar.id}${onlyTimeStamp}${eventId}`;
  }

  // 包装器 ：装饰 window.vhallReportForProduct.report 函数增加新能力【核心】
  extendInstanceReport(name, execute, source = {}) {
    let fn = source[name]
    source[name] = function (eventId, options) {

      // options => null {} {report_extra:{}}
      this.requestId = this.createRequestId(eventId);

      // 此处兼容历史上报数据扩展字段缺失问题
      if (!options) {
        options = { report_extra: { request_id: this.requestId } }
      } else if (!options.report_extra) {
        options.report_extra = {
          request_id: this.requestId
        }
      }

      // options => { report_extra: { request_id: 1 } }
      // 此处兼容老的上报参数，新上报参数，需要 report_extra 为必填项
      if (!('request_id' in options.report_extra))
        options.report_extra['request_id'] = this.requestId;
      else
        this.requestId = options.report_extra.request_id;

      try {
        // 处理中文 base64（window.btoa） 的编码错误
        options.report_extra = JSON.parse(JSON.stringify(options.report_extra).replace(/([^\u0000-\u00FF])/g, $ => encodeURIComponent($)))
      } catch (err) {
        console.log(err)
      }

      return execute(fn.bind(source, eventId, options))
    }

  }

  /**
   * 链路开始上报
   * @param {Number} eventId 事件ID
   * @param {Array} relationalEventIds  事件ID对应的结果链路ID
   * @param {Object} extendOptions 扩展参数
   */
  startReporting(eventId, relationalEventIds, extendOptions = {}) {

    let _requestId = this.createRequestId(eventId);

    if (typeof relationalEventIds === 'number') relationalEventIds = [relationalEventIds];

    relationalEventIds.forEach(element => {
      this.cacheReportCode[element] = _requestId
    });
    this.report(eventId, {
      report_extra: {
        ...{
          request_id: _requestId
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
  resultsReporting(resultEventId, extendOptions = {}) {
    this.report(resultEventId, {
      report_extra: {
        ...{
          request_id: this.cacheReportCode[resultEventId]
        },
        ...extendOptions
      }
    })
  }

}