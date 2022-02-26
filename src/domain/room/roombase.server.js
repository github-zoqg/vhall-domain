import { meeting } from '@/request/index.js';
import { setRequestHeaders } from '@/utils/http.js';
import { merge } from '@/utils/index.js';
import BaseServer from '../common/base.server';
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
  ['sdk', 'initSdkReceiveLive'] //sdk直播
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
      handleLowerConfig: false, // 黄金链路-是否触发标记
      faultTipMsg: '', // 黄金链路-降级提示文案
      lowerGradeInterval: null, // 黄金链路计时器
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
      miniElement: 'stream-list', // 可能的值：doc  stream-list
      //多语言信息
      languages: {
        curLang: 'zh',
        langList: []
      }
    };
    RoomBaseServer.instance = this;
    return this;
  }

  // 初始化房间信息,包含发起/观看(嵌入/标品)
  initLive(options) {
    if (!['send', 'standard', 'embed', 'sdk'].includes(options.clientType)) {
      throw new Error('不合法的客户端类型');
    }
    console.log('初始化初始化', options.clientType);
    if (['standard', 'embed'].includes(options.clientType) && !options.visitor_id) {
      options.visitor_id = sessionStorage.getItem('visitorId');
    }
    this.state.clientType = options.clientType;
    this.state.deviceType = options.deviceType;
    return new Promise((resolve, reject) => {
      meeting[liveType.get(options.clientType)](options).then(res => {
        if (res.code === 200) {
          this.state.watchInitData = res.data;
          console.log('watchInitData', res.data);
          sessionStorage.setItem('interact_token', res.data.interact.interact_token);
          sessionStorage.setItem('visitorId', res.data.visitor_id);
          resolve(res);
        } else {
          reject(res);
        }
      });
    });
  }

  // 设置是否是嵌入
  setEmbedObj(param) {
    // 嵌入
    this.embedObj.embed = param.isEmbed;
    // 单视频嵌入
    this.embedObj.embedVideo = param.isEmbedVideo;
  }

  // 设置miniELement
  requestChangeMiniElement(requestEle) {
    switch (requestEle) {
      case 'stream-list':
        this.state.miniElement = this.state.miniElement == 'doc' ? 'stream-list' : 'doc';
        break;
    }
  }

  // 设置miniELement的值
  setChangeElement(val) {
    this.state.miniElement = val;
  }

  // 更新roomVisibleModule
  updateRoomVisibleModules(cb) {
    this.state.roomVisibleModules = cb(this.state.roomVisibleModules);
  }

  // 获取活动信息
  getWebinarInfo(data) {
    return meeting.getWebinarInfo(data).then(res => {
      // this.state.webinarVo = res.data;
      return res;
    });
  }

  // 获取房间权限配置列表
  getConfigList(data = {}) {
    const defaultParams = {
      webinar_id: this.state.watchInitData.webinar.id,
      webinar_user_id: this.state.watchInitData.webinar.userinfo.user_id,
      scene_id: 2
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.getConfigList(retParams).then(res => {
      if (res.code == 200) {
        this.state.configList = JSON.parse(res.data.permissions);
      }
      return res;
    });
  }
  //获取多语言配置
  getLangList() {
    return meeting.getLangList({ webinar_id: this.state.watchInitData.webinar.id }).then(res => {
      if (res.code == 200) {
        this.state.languages.langList = res.data.list;
        this.state.languages.curLang = res.data.list.find(item => {
          return item.language_type == res.data.default_language;
        });
      }
    });
  }
  /**
   * 功能介绍：黄金链路
   * 作用：系统崩溃 配置项降级处理方案
   * @param {*} data 接口入参
   * data.params 接口入参
   * data.environment 黄金链路环境
   * data.systemKey 渠道 2 - 直播；4 - 知客。
   * data.time 计时器 - 计时步骤
   */
  getLowerConfigList(data = { params: {}, environment: 'test', systemKey: 2, time: 5 }) {
    // 黄金链路 - 内置逻辑
    async function getLowerGradeConfig(that, meeting, obj) {
      const { params, environment, systemKey } = obj;
      try {
        const lowerGrade = await meeting.getLowerGradeConfigInfo(params, environment, systemKey);
        const { activity, user, global } = lowerGrade;
        const { watchInitData } = that.state;

        // 优先顺序：互动 > 用户 > 全局
        const activityConfig =
          activity && activity.length > 0 && watchInitData
            ? activity.find(option => option.audience_id == watchInitData.webinar.id)
            : null;

        const userConfig =
          user && user.length > 0 && watchInitData
            ? user.find(option => option.audience_id == watchInitData.webinar.userinfo.user_id)
            : null;

        if (activityConfig) {
          that.state.configList = Object.assign(
            {},
            that.state.configList,
            activityConfig.permissions
          );
          that.state.handleLowerConfig = true;
          that.state.faultTipMsg = activityConfig.tip_message;
        } else if (userConfig) {
          that.state.configList = Object.assign({}, that.state.configList, userConfig.permissions);
          that.state.handleLowerConfig = true;
          that.state.faultTipMsg = userConfig.tip_message;
        } else if (global && global.permissions) {
          that.state.configList = Object.assign({}, that.state.configList, global.permissions);
          that.state.handleLowerConfig = true;
          that.state.faultTipMsg = global.tip_message;
        }
      } catch (e) {
        // 调用异常情况下，计时器停止
        if (that.state.lowerGradeInterval) {
          clearInterval(that.state.lowerGradeInterval);
        }
      }
    }

    // 黄金链路 - 功能流程[前题config调用完毕]
    if (!this.state.handleLowerConfig) {
      // 没有击中黄金链路配置项情况下，调用-黄金链路心跳调用
      if (this.state.lowerGradeInterval) {
        console.log('计时器存在，先清空一次');
        clearInterval(this.state.lowerGradeInterval);
      }
      this.state.lowerGradeInterval = setInterval(() => {
        getLowerGradeConfig(this, meeting, data);
      }, (Math.random() * data.time + data.time) * 1000);
    } else {
      // 击中情况下，友好提示
      this.$emit(ROOM_BASE_LOWER_WARNING, this.state.faultTipMsg);
    }
  }

  //获取房间内各工具的状态
  getInavToolStatus(data = {}) {
    const defaultParams = {
      room_id: this.state.watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.getInavToolStatus(retParams).then(res => {
      if (res.code == 200) {
        this.state.interactToolStatus = res.data;
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
        this.state.interactToolStatus = res.data['room-tool'] ? res.data['room-tool'].data : {}; //互动工具状态信息
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

  // 直播结束生成回放
  createRecord(data = {}) {
    return meeting.createRecord(data);
  }

  // 设为默认回放
  setDefaultRecord(data = {}) {
    return meeting.setDefaultRecord(data);
  }

  // 开始/恢复录制
  startRecord() {
    return meeting.recordApi({
      status: 1
    });
  }

  // 暂停录制
  pauseRecord() {
    return meeting.recordApi({
      status: 2
    });
  }

  // 结束录制
  endRecord() {
    return meeting.recordApi({
      status: 3
    });
  }

  //初始化回放录制
  initReplayRecord(params = {}) {
    return meeting.initRecordApi(params);
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
