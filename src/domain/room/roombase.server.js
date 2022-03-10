import { meeting, roomApi } from '@/request/index.js';
import { merge } from '@/utils/index.js';
import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import { configMap } from './js/configMap'

/**
 * send:发起端
 * standard:标准直播
 * embed:嵌入直播
 * sdk:sdk直播
 */
//客户端类型
const liveType = new Map([
  ['send', 'initSendLive'], //发起端
  ['standard', 'initStandardReceiveLive'], //标准观看端
  ['embed', 'initEmbeddedReceiveLive'], //嵌入直播
  ['clientEmbed', 'clientEmbed'], //客户端嵌入直播
  ['sdk', 'initSdkReceiveLive'], //sdk直播
  ['record', 'initRecordVideo'] //录制
]);
class RoomBaseServer extends BaseServer {
  constructor() {
    super();
    if (typeof RoomBaseServer.instance === 'object') {
      return RoomBaseServer.instance;
    }
    super();
    this.state = {
      watchInitData: {}, // 活动信息
      embedObj: {
        embed: false,
        embedVideo: false
      }, //是否是嵌入
      watchInitErrorData: undefined, // 默认undefined，如果为其他值将触发特殊逻辑
      configList: {},
      degradationOptions: {
        isDegraded: false, // 黄金链路-是否触发标记
        degradeInterval: null, // 黄金链路计时器
      },
      clientType: '',
      deviceType: '', // 设备类型   pc 或 手机
      skinInfo: {}, // 皮肤信息
      webinarTag: {}, //活动标识
      screenPosterInfo: {}, // 开屏海报信息
      officicalInfo: {}, //公众号信息
      customMenu: {}, // 自定义菜单
      goodsDefault: {}, // 商品
      advDefault: {}, //广告
      inviteCard: {}, // 邀请卡
      keywords: {}, //关键词
      redPacket: {}, // 红包
      priseLike: {}, // 点赞数
      noticeInfo: {}, // 公告
      signInfo: {}, //签到信息
      timerInfo: {}, //计时器
      interactToolStatus: {}, //互动工具状态信息
      roomVisibleModules: [],
      miniElement: 'stream-list', // 可能的值：doc  stream-list sceen
      //多语言信息
      languages: {
        curLang: 'zh',
        langList: []
      }
    };
    RoomBaseServer.instance = this;
    return this;
  }

  // 通过活动id获取活动拥有者用户id
  webinarInitBefore(params) {
    return roomApi.webinar.webinarInitBefore(params);
  }

  // 初始化房间信息,包含发起/观看(嵌入/标品)
  initLive(options) {
    if (
      !['send', 'standard', 'embed', 'sdk', 'record', 'clientEmbed'].includes(options.clientType)
    ) {
      throw new Error('不合法的客户端类型');
    }
    console.log('初始化初始化', options.clientType, liveType.get(options.clientType));
    if (['standard', 'embed'].includes(options.clientType) && !options.visitor_id) {
      options.visitor_id = sessionStorage.getItem('visitorId');
    }
    this.state.clientType = options.clientType;
    this.state.deviceType = options.deviceType;
    return new Promise((resolve, reject) => {
      meeting[liveType.get(options.clientType)](options).then(res => {
        if (res.code === 200) {
          this.state.watchInitData = res.data;
          // 设置发起端权限
          if (['send', 'record', 'clientEmbed'].includes(options.clientType)) {
            this.state.configList = configMap(res.data.permission)
          } else {
            // 用来判断是否是单点登录
            sessionStorage.setItem('kickId', res.data.sso.kick_id);
            sessionStorage.setItem('ssoEnabled', res.data.sso.enabled);
          }
          console.log('watchInitData', res.data);
          sessionStorage.setItem('interact_token', res.data.interact.interact_token);
          sessionStorage.setItem('visitorId', res.data.visitor_id);
          this.addListeners();
          resolve(res);
        } else {
          reject(res);
        }
      });
    });
  }

  addListeners() {
    useMsgServer().$onMsg('ROOM_MSG', msg => {

      if (msg.data.type == 'live_start') {
        this.state.watchInitData.webinar.type = 1;
        // 消息中未提供开播时间字段 start_time
        this.state.watchInitData.switch.switch_id = msg.data.switch_id;
        this.state.watchInitData.switch.switch_type = msg.data.switch_type;

      } else if (msg.data.type == 'live_over' || (msg.data.type == 'group_switch_end' && msg.data.over_live === 1)) {
        this.state.watchInitData.webinar.type = 3;
      }

      switch (msg.data.type) {
        // 切换主讲人
        case 'vrtc_speaker_switch':
          this.state.interactToolStatus.doc_permission = msg.data.room_join_id
          this.state.interactToolStatus.presentation_screen = msg.data.room_join_id
          this.$emit('VRTC_SPEAKER_SWITCH', msg);
          break;
        // 踢出消息
        case 'room_kickout':
          console.log('踢出房间消息----domain----', msg);
          if (msg.data.target_id == this.state.watchInitData.join_info.third_party_user_id) {
            this.$emit('ROOM_KICKOUT')
          }
      }
    });
    // 单点登录逻辑
    useMsgServer().$onMsg('JOIN', msg => {
      if (sessionStorage.getItem('ssoEnabled') == 1) {
        const kickId = sessionStorage.getItem('kickId');
        const kickMark = `${sessionStorage.getItem('kickMark')}${this.state.watchInitData.webinar.id
          }`;
        if (kickId) {
          if (
            kickId == msg.context.kick_id &&
            kickMark != msg.context.kick_mark
          ) {
            this.$emit('ROOM_SIGNLE_LOGIN');
            setTimeout(() => {
              useMsgServer().destroy()
            }, 2000)
          }
        }
      }
    })
  }

  // 设置是否是嵌入
  setEmbedObj(param) {
    // 嵌入
    this.state.embedObj.embed = param.isEmbed;
    // 单视频嵌入
    this.state.embedObj.embedVideo = param.isEmbedVideo;
  }

  // 设置miniELement
  requestChangeMiniElement(requestEle) {
    switch (requestEle) {
      case 'stream-list':
        if (this.state.isShareScreen) {
          this.state.miniElement = this.state.miniElement == 'screen' ? 'stream-list' : 'screen';
        } else {
          this.state.miniElement = this.state.miniElement == 'doc' ? 'stream-list' : 'doc';
        }
        break;
    }
  }

  // 设置miniELement的值
  setChangeElement(val) {
    this.state.miniElement = val;
  }

  // 设置转播信息
  setRebroadcastInfo(data) {
    this.state.watchInitData.rebroadcast = {
      ...this.state.watchInitData.rebroadcast,
      ...data
    };
  }

  // 更新roomVisibleModule
  updateRoomVisibleModules(cb) {
    this.state.roomVisibleModules = cb(this.state.roomVisibleModules);
  }

  // 获取活动信息
  getWebinarInfo(data) {
    return roomApi.activity.getActivityBasicInfo(data).then(res => {
      // this.state.webinarVo = res.data;
      return res;
    });
  }

  // 获取房间权限配置列表
  getConfigList(data = {}) {
    const defaultParams = {
      webinar_id: this.state.watchInitData.webinar && this.state.watchInitData.webinar.id,
      webinar_user_id: this.state.watchInitData.webinar && this.state.watchInitData.webinar.userinfo.user_id,
      scene_id: 2
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.getConfigList(retParams).then(res => {
      if (res.code == 200) {
        const configList = JSON.parse(res.data.permissions);
        for (let key in configList) {
          configList[key] = Number(configList[key])
        }
        this.state.configList = configList
      }
      return res;
    });
  }

  //获取多语言配置
  getLangList() {
    return meeting.getLangList({ webinar_id: this.state.watchInitData.webinar.id }).then(res => {
      if (res.code == 200) {
        this.state.languages.langList = res.data.list;
        let defaultLanguage = sessionStorage.getItem('lang') ? parseInt(sessionStorage.getItem('lang')) : res.data.default_language
        this.state.languages.curLang = res.data.list.find(item => {
          return item.language_type == defaultLanguage;
        });
      }
    });
  }

  /**
   * 黄金链路定时器启动
   * @param {*} options
   * options.staticDomain 静态资源域名
   * options.environment 请求环境 test product
   * options.systemKey 系统key 2 直播   4 知客
   * options.time 间隔时间 5 ——> 5+options.time 之间的随机数
   */
  async startGetDegradationInterval(options = { staticDomain: '', environment: 'test', systemKey: 2 }) {
    // 启动立即执行一次
    await this.getDegradationConfig(options)
    // 如果没有命中
    if (!this.state.degradationOptions.isDegraded) {
      // 定时执行
      this.state.degradationOptions.degradeInterval = setInterval(() => {
        this.getDegradationConfig(options);
      }, (Math.random() * 5 + 5) * 1000);
    }
  }

  /**
   * 黄金链路接口请求
   * @param {*} options
   * options.staticDomain 静态资源域名
   * options.environment 请求环境 test product
   * options.systemKey 系统key 2 直播   4 知客
   */
  async getDegradationConfig(options = { staticDomain: '', environment: 'test', systemKey: 2 }) {
    const { staticDomain, environment, systemKey } = options;
    try {
      const lowerGrade = await meeting.getLowerGradeConfigInfo(staticDomain, environment, systemKey);
      const { activity, user, global } = lowerGrade.data;
      const { watchInitData } = this.state;

      // 优先顺序：活动 > 用户 > 全局
      const activityConfig =
        activity && activity.length > 0 && watchInitData
          ? activity.find(option => option.audience_id == watchInitData.webinar.id)
          : null;

      const userConfig =
        user && user.length > 0 && watchInitData
          ? user.find(option => option.audience_id == watchInitData.webinar.userinfo.user_id)
          : null;

      if (activityConfig) {
        // 活动级别降级命中
        this.handleDegradationHit(activityConfig.permissions, activityConfig.tip_message);
      } else if (userConfig) {
        // 用户级别降级命中
        this.handleDegradationHit(userConfig.permissions, userConfig.tip_message);
      } else if (global && global.permissions) {
        // 全局级别降级命中
        this.handleDegradationHit(global.permissions, global.tip_message);
      }
    } catch (e) {
      // 调用异常情况下，计时器停止
      if (this.state.degradationOptions.degradeInterval) {
        clearInterval(this.state.degradationOptions.degradeInterval);
      }
    }
  }

  // 黄金链路命中之后的处理
  handleDegradationHit(permissions, tip_message) {
    // 设置发起端权限
    if (['send', 'record', 'clientEmbed'].includes(this.state.clientType) && permissions && permissions.initiator && permissions.initiator.length) {
      // 发起端需要将数组转成json
      this.state.configList = configMap(permissions.initiator, 0, this.state.configList);
    } else if (['standard', 'embed', 'sdk'].includes(this.state.clientType) && permissions) {
      this.state.configList = Object.assign({}, this.state.configList, permissions);
    } else {
      return;
    }
    this.state.degradationOptions.isDegraded = true;
    // 击中情况下，友好提示
    this.$emit('DEGRADED_TIP', tip_message);
    if (this.state.degradationOptions.degradeInterval) {
      clearInterval(that.state.degradationOptions.degradeInterval);
    }
  }

  //获取房间内各工具的状态
  async getInavToolStatus(data = {}) {
    const defaultParams = {
      room_id: this.state.watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.getInavToolStatus(retParams).then(res => {
      if (res.code == 200) {
        this.state.interactToolStatus = res.data;
        if (!this.state.interactToolStatus.presentation_screen) {
          // 演示人没有，设置主讲人是演示人
          this.state.interactToolStatus.presentation_screen =
            this.state.interactToolStatus.doc_permission;
        }
      }
      return res;
    });
  }

  // 观看端获取公众号、广告推荐、邀请卡等信息
  getCommonConfig(data = {}) {
    const defaultParams = {
      webinar_id: this.state.watchInitData.webinar.id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.getCommonConfig(retParams).then(res => {
      if (res.code == 200) {
        this.state.skinInfo = res.data['skin'] ? res.data['skin'].data : {}; // 皮肤信息
        this.state.webinarTag = res.data['webinar-tag'] ? res.data['webinar-tag'].data : {}; //活动标识
        this.state.screenPosterInfo = res.data['screen-poster']
          ? res.data['screen-poster'].data
          : {}; // 开屏海报信息
        this.state.officicalInfo = res.data['public-account']
          ? res.data['public-account'].data
          : {}; //公众号信息
        this.state.interactToolStatus = res.data['room-tool'] && res.data['room-tool'].data ? res.data['room-tool'].data : {}; //互动工具状态信息
        this.state.customMenu = res.data['menu'] ? res.data['menu'].data : {}; // 自定义菜单
        this.state.goodsDefault = res.data['goods-default'] ? res.data['goods-default'].data : {}; // 商品
        this.state.advDefault = res.data['adv-default'] ? res.data['adv-default'].data : {}; // 广告
        this.state.inviteCard = res.data['invite-card'] ? res.data['invite-card'].data : {}; // 邀请卡
        this.state.keywords = res.data['keywords'] ? res.data['keywords'].data : {}; //关键词
        this.state.redPacket = res.data['red-packet'] ? res.data['red-packet'].data : {}; //红包
        this.state.priseLike = res.data['like'] ? res.data['like'].data : {}; //点赞数
        this.state.noticeInfo = res.data['announcement'] ? res.data['announcement'].data : {}; //公告
        this.state.signInfo = res.data['sign'] ? res.data['sign'].data : {}; //签到信息
        this.state.timerInfo = res.data['timer'] ? res.data['timer'].data : {}; //计时器
      }
      return res;
    });
  }

  // 打开观看端是微信分享
  bindShare(data = {}) {
    const defaultParams = {
      room_id: this.state.watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.bindShare(retParams).then(res => {
      return res;
    })
  }

  // 设置互动
  setInavToolStatus(props, val) {
    if (!props || typeof props !== 'string') return;
    const its = merge.recursive({}, this.state.interactToolStatus);
    its[props] = val;
    this.state.interactToolStatus = its;
  }

  // 开播startLive
  startLive(data = {}) {
    return meeting.startLive(data).then(res => {
      if (res.code == 200) {
        this.state.watchInitData.webinar.type = 1;
        this.state.watchInitData.switch = res.data;
      }
      return res;
    });
  }

  // 结束直播
  endLive(data = {}) {
    return meeting.endLive(data).then(res => {
      if (res.code == 200) {
        this.state.watchInitData.webinar.type = 3;
      }
      return res;
    });
  }

  // 回放录制页面，开始录制
  startRecord(data = {}) {
    return meeting.startRecord(data).then(res => {
      if (res.code == 200) {
        this.state.watchInitData.is_recording = 1;
      }
      return res;
    });
  }

  // 回放录制页面，结束录制
  endRecord(data = {}) {
    return meeting.endRecord(data).then(res => {
      if (res.code == 200) {
        this.state.watchInitData.is_recording = 0;
      }
      return res;
    });
  }

  // 录制结束生成回放
  createRecordInRecord(data = {}) {
    return meeting.createRecordInRecord(data);
  }

  // 直播结束生成回放
  createRecordInLive(data = {}) {
    return meeting.createRecordInLive(data);
  }

  // 设为默认回放
  setDefaultRecord(data = {}) {
    return meeting.setDefaultRecord(data);
  }

  // 开始/恢复打点录制
  startRecordInLive(params = {}) {
    const retParmams = {
      webinar_id: params.webinarId || this.state.watchInitData.webinar.id,
      status: 1
    };
    return meeting.recordApi(retParmams);
  }

  // 暂停打点录制
  pauseRecordInLive(params = {}) {
    const retParmams = {
      webinar_id: params.webinarId || this.state.watchInitData.webinar.id,
      status: 2
    };
    return meeting.recordApi(retParmams);
  }

  // 结束打点录制
  endRecordInLive(params = {}) {
    const retParmams = {
      webinar_id: params.webinarId || this.state.watchInitData.webinar.id,
      status: 3
    };
    return meeting.recordApi(retParmams);
  }

  // 获取第三方推流地址
  getThirdPushStreamAddress(data = {}) {
    const defaultParams = {
      webinar_id: this.state.watchInitData.webinar.id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.getStreamPushAddress(retParams).then(res => {
      return res;
    });
  }

  // 观看端底部反馈
  feedbackInfo(data = {}) {
    const defaultParams = {
      webinar_id: this.state.watchInitData.webinar.id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.feedbackInfo(retParams).then(res => {
      return res;
    });
  }

  // 观看端底部举报
  tipOffInfo(data = {}) {
    const defaultParams = {
      webinar_id: this.state.watchInitData.webinar.id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.tipOffInfo(retParams).then(res => {
      return res;
    });
  }

  // 关闭开屏海报事件
  screenPostClose(data = {}) {
    this.$emit('screenPostClose', data);
  }

  // 获取上麦状态
  getSpeakStatus() {
    const {
      interactToolStatus: { speaker_list },
      watchInitData: { join_info }
    } = this.state;
    if (!speaker_list) return false;
    if (speaker_list.length) {
      return speaker_list.some(item => item.account_id == join_info.third_party_user_id);
    } else {
      return false;
    }
  }
}

export default function useRoomBaseServer() {
  return new RoomBaseServer();
}
