import { meeting, roomApi } from '@/request/index.js';
import { merge, getQueryString } from '@/utils/index.js';
import { player } from '../../request';
import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useMediaSettingServer from '../media/mediaSetting.server';

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
  ['record', 'initRecordVideo'], //录制
  ['sendYun', 'initSendLiveYun'] //云导播推流页面初始化
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
      isThirdStream: false,  // 是否第三方发起
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
      pwdredPacket: {}, // 口令红包
      priseLike: {}, // 点赞数
      noticeInfo: {}, // 公告
      signInfo: {}, //签到信息
      timerInfo: {}, //计时器
      interactToolStatus: {}, //互动工具状态信息
      roomVisibleModules: [],
      miniElement: 'stream-list', // 可能的值：doc  stream-list sceen
      //多语言信息
      languages: {
        curLang: {},
        lang: {
          type: 'zh'
        },
        langList: []
      },
      customRoleName: {},
      director_stream: 0,
      streamStatus: 0,   //直播间内是否有流：0-无，1-有
      thirdPullStreamUrl: '',   //第三方拉流地址
      thirdPullStreamMode: 1,   //第三方拉流模式  1,2
      isWapBodyDocSwitch: false, // 播放器文档位置是否切换
      unionConfig: {}, //通用配置 - 基本配置，播放器跑马灯配置，文档水印配置等
      warmUpVideo: {
        warmup_paas_record_id: [],
        warmup_player_type: 1
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
      !['send', 'standard', 'embed', 'sdk', 'record', 'clientEmbed', 'sendYun'].includes(options.clientType)
    ) {
      throw new Error('不合法的客户端类型');
    }
    console.log('初始化初始化', options.clientType, liveType.get(options.clientType));
    if (['standard', 'embed'].includes(options.clientType) && !options.visitor_id) {
      options.visitor_id = localStorage.getItem('visitorId');
    }
    if (['embed'].includes(options.clientType)) {
      // v6.5.9新增 - 分组直播是单视频嵌入的时候，不支持。
      options.embed_type = this.state.embedObj.embedVideo ? 'video' : 'full'
    }

    this.state.watchInitData.live_type = options.live_type
    this.state.clientType = options.clientType;
    this.state.deviceType = options.deviceType;
    return new Promise((resolve, reject) => {
      meeting[liveType.get(options.clientType)](options).then(res => {
        if (res.code === 200) {
          this.state.watchInitData = res.data;
          // 设置转发初始值(初始化数据实体)
          if (this.state.watchInitData?.rebroadcast) {
            this.setRebroadcastInfo(this.state.watchInitData.rebroadcast)
          }

          // 设置发起端权限
          if (['send', 'record', 'clientEmbed', 'sendYun'].includes(options.clientType)) {
            this.state.configList = res.data.permissionKey
            // 发起端结束直播时，将多语言缓存清除 主要是为了防止测试 在测过程中浏览器缓存不清空，一会登录观看端，一会登录发起端，缓存会翻译发起端，使发起端变成英文
            localStorage.removeItem('lang')
          } else {
            // 用来判断是否是单点登录
            sessionStorage.setItem('kickId', res.data.sso.kick_id);
            sessionStorage.setItem('ssoEnabled', res.data.sso.enabled);
            // 回放时 不显示推流列表等，所以要把miniElement设置为空
            if (this.state.watchInitData.webinar.type != 1) {
              this.state.miniElement = ''
            }
            if (this.state.embedObj.embedVideo) {
              this.state.watchInitData.webinar.no_delay_webinar = 0
            }

            // 判断暖场视频数据
            if (this.state.watchInitData.status === 'subscribe' && res.data.warmup && res.data.warmup.warmup_paas_record_id.length) {
              this.state.warmUpVideo = res.data.warmup;
            }

          }
          // 判断是不是第三方推流
          if (res.data.switch && res.data.switch.start_type == 4) {
            this.state.isThirdStream = true;
          }
          console.log('watchInitData', res.data);
          sessionStorage.setItem('interact_token', res.data.interact.interact_token);
          localStorage.setItem('visitorId', res.data.visitor_id);
          // 解决多个主持人同时在线问题
          if (!!res.data.visitor_id) {
            sessionStorage.setItem('visitorId_home', res.data.visitor_id);
          }
          this.addListeners();
          resolve(res);
        } else {
          reject(res);
        }
      });
    });
  }

  addListeners() {
    const msgServer = useMsgServer()
    msgServer.$onMsg('ROOM_MSG', msg => {

      if (msg.data.type == 'live_start') {
        // 观看端如果在看回放，直播时没刷新，不能显示直播的页面，故type不能改成1
        if (['send', 'sdk', 'record', 'clientEmbed'].includes(this.state.clientType)) {
          // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
          this.state.watchInitData.webinar.type = 1;
          this.state.watchInitData.live_type = msg.data.live_type;

          // 第三方推流监听消息
          if (this.state.isThirdStream) {
            this.$emit('LIVE_START')
          }
          // 初始化播放器
          if (msg.data.switch_type != 1 && this.state.watchInitData.join_info.role_name == 3 && this.state.watchInitData.webinar.no_delay_webinar != 1) {
            this.$emit('LIVE_BROADCAST_START', {
              start_type: msg.data.switch_type
            })
          }
        }

        // 消息中未提供开播时间字段 start_time
        this.state.watchInitData.switch.switch_id = msg.data.switch_id;
        this.state.watchInitData.switch.start_type = msg.data.switch_type;

      } else if (msg.data.type == 'live_over' || (msg.data.type == 'group_switch_end' && msg.data.over_type)) {
        this.state.watchInitData.webinar.type = 3;
        // 观众不需要重制场次类型
        if (this.state.watchInitData.join_info.role_name != 2) {
          this.state.watchInitData.live_type = 0;
        }

        // 直播结束还原位置切换的状态
        this.state.isWapBodyDocSwitch = false
        // 把演示人、主讲人、主屏人都设置成主持人
        this.state.interactToolStatus.presentation_screen = this.state.watchInitData.webinar.userinfo.user_id;
        this.state.interactToolStatus.doc_permission = this.state.watchInitData.webinar.userinfo.user_id;
        this.state.interactToolStatus.main_screen = this.state.watchInitData.webinar.userinfo.user_id;

        // 结束直播时，将第三方推流标识关闭
        if (this.state.isThirdStream) {
          this.state.isThirdStream = false;
          this.state.interactToolStatus.start_type = 1;
        }

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
        // 云导播台有流消息
        case 'director_stream':
          console.log('director_stream', msg);
          this.state.director_stream = msg.data.status
      }
    });
    // 单点登录逻辑
    msgServer.$onMsg('JOIN', msg => {
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
    });
    msgServer.$onMsg('CUSTOM_MSG', msg => {
      switch (msg.data.type) {
        case 'edit_webinar_role_name':
          this.state.customRoleName[Number(msg.data.role_type)] = msg.data.name
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
    const obj = {
      ...this.state.watchInitData.rebroadcast,
      ...data,
    }

    // 衍生值
    const byProductData = {
      isRebroadcasting: Boolean(obj.id)
    }

    this.state.watchInitData.rebroadcast = {
      ...obj,
      ...byProductData
    };
  }

  // 记录桌面共享流id
  setDesktopStreamId(data) {
    this.state.watchInitData.localDesktopStreamId = data
    console.log(this.state.watchInitData, 'this.state.watchInitData')
  }

  // 记录插播流id
  setInsertFileStreamId(data) {
    this.state.watchInitData.insertFileStreamId = data
    console.log(this.state.watchInitData, 'this.state.watchInitData')
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

  // 获取皮肤详情
  getSkinsInfo(data) {
    return meeting.getSkinsInfo(data).then(res => {
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

  // 获取观看协议状态查询
  getAgreementStatus() {
    const webinarId = this.state.watchInitData?.webinar?.id
    return meeting.restrictions({ webinar_id: webinarId })
  }

  // 同意条款
  agreeWitthTerms(params = {}) {
    const webinarId = this.state.watchInitData?.webinar?.id
    const visitorId = localStorage.getItem('visitorId') || ''
    return meeting.setUserAgree({
      webinar_id: webinarId,
      visitor_id: visitorId,
      email: params.email || '',
      third_user_id: params.third_user_id || ''
    })
  }

  // 获取视频论巡权限
  // TODO: 后续观看端统一处理配置项权限之后，这个就不用了
  getVideoPollingConfig() {
    const defaultParams = {
      webinar_id: this.state.watchInitData.webinar && this.state.watchInitData.webinar.id,
      webinar_user_id: this.state.watchInitData.webinar && this.state.watchInitData.webinar.userinfo.user_id,
      scene_id: 1
    };
    return meeting.getConfigList(defaultParams).then(res => {
      if (res.code == 200) {
        const configList = JSON.parse(res.data.permissions);
        for (let key in configList) {
          if (key === 'video_polling') {
            this.state.configList = {
              ...this.state.configList,
              video_polling: Number(configList[key])
            }
          }
        }
      }
    });
  }

  //获取多语言配置
  getLangList(params) {
    return meeting.getLangList({ webinar_id: params || this.state.watchInitData.webinar.id }).then(res => {
      if (res.code == 200) {
        const langMap = {
          1: {
            label: '简体中文',
            type: 'zh',
            key: 1
          },
          2: {
            label: 'English',
            type: 'en',
            key: 2
          }
        };
        // 默认从地址栏中取值语言参数
        let defaultLanguage = Number(getQueryString('lang'));

        // 如果地址栏中没有语言参数或者 语言参数不符合规定，是非法字符，就从缓存中取值
        if (!(defaultLanguage && [1, 2].includes(defaultLanguage))) {
          if (localStorage.getItem('lang')) {
            defaultLanguage = Number(localStorage.getItem('lang'));
          } else {
            // 如果缓存也没有，就从接口中取值
            defaultLanguage = res.data.default_language;
          }
        }
        // 因为开发、测试用的需要活动较多，每个活动都需要比较当前语言值在接口语言列表中是否存在
        // eg: 第一个活动语言包是英文.第二个活动只有一个中文并且没清理缓存，设置语言为英文就有问题，所以需要看语言列表是否存在当前默认语言
        if (!(res.data.language_types.split(',').includes((defaultLanguage).toString()))) {
          defaultLanguage = res.data.default_language;
        }
        localStorage.setItem('lang', defaultLanguage)
        // 获取当前活动的简介和标题 是个对象
        this.state.languages.curLang = res.data.list.find(item => {
          return item.language_type == defaultLanguage;
        });
        // 多语言列表
        this.state.languages.langList = res.data.list.map(item => {
          return langMap[item.language_type];
        });
        // 当前语言的对象
        this.state.languages.lang = langMap[defaultLanguage]
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
    // 更新 configList
    this.state.configList = Object.assign({}, this.state.configList, permissions);

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

        const layout = res.data.layout ? res.data.layout : useMediaSettingServer().state.layout;
        useMediaSettingServer().state.layout = layout || 'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE'
      }
      return res;
    });
  }

  // 观看端获取公众号、广告推荐、邀请卡等信息
  getCommonConfig(data) {
    // 第一次调用的时候存储一下入参，后续如果不传 data 就用第一次保存的参数
    if (!this._isNotFirstGetCommonConfig) {
      this._getCommonConfigData = data
      this._isNotFirstGetCommonConfig = true
    }
    const defaultParams = {
      webinar_id: this.state.watchInitData.webinar.id
    };
    const retParams = merge.recursive({}, defaultParams, data || this._getCommonConfigData || {});
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
        this.state.redPacket = res.data['red-packet'] ? res.data['red-packet'].data : {};
        this.state.pwdredPacket = res.data['pwd-red-packet'] ? res.data['pwd-red-packet'].data : {};
        //红包
        // this.$emit('commonConfigRepacketChange') // 通知红包组件获取最新的状态
        // this.$emit('commonConfigCodeRepacketChange') // 通知口令红包组件获取最新的状态
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

  // 获取微信分享信息（若传递了活动ID，按照传入的获取活动下分享信息）
  getShareSettingInfo(params = {}) {
    return meeting.getShareSettingInfo({
      webinar_id: params.webinarId || this.state.watchInitData.webinar.id
    }).then(res => {
      return res;
    })
  }
  wechatShare(data = {}) {
    return meeting.wechatShare(data).then(res => {
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
        this.state.watchInitData.live_type = res.data.type;
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
        this.state.watchInitData.record.is_recording = 1;
      }
      return res;
    });
  }

  // 回放录制页面，结束录制
  endRecord(data = {}) {
    return meeting.endRecord(data).then(res => {
      if (res.code == 200) {
        this.state.watchInitData.record.is_recording = 0;
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

  // 设置第三方推流
  setThirdPushStream(value) {
    this.state.isThirdStream = value;
  }

  // 设置用户信息的头像和昵称
  setChangeUserInfo(type, info) {
    type == 1 ? this.state.watchInitData.join_info.avatar = info.avatar : this.state.watchInitData.join_info.nickname = info.nick_name;
  }


  getCustomRoleName() {
    return meeting.getCustomRoleName({
      webinar_id: this.state.watchInitData.webinar && this.state.watchInitData.webinar.id,
    }).then(res => {
      if (res.code == 200) {
        this.state.customRoleName[1] = res.data.host_name;
        this.state.customRoleName[3] = res.data.assistant_name
        this.state.customRoleName[4] = res.data.guest_name
      }
    })
  }

  // 获取云导播台是否有流
  getStreamStatus() {
    return meeting.getStreamStatus({
      webinar_id: this.state.watchInitData.webinar && this.state.watchInitData.webinar.id,
    }).then(res => {
      this.state.director_stream = res.data.director_stream
    })
  }

  // 获取云导播机位是否占用
  selectSeat(params) {
    return meeting.selectSeat(params).then(res => {
      if (res.code == 200) {
        return true
      } else {
        return false
      }
    })
  }

  // 获取直播间流状态
  getLiveStreamStatus(params = {}) {
    return meeting.getLiveStreamStatus({
      webinar_id: params.webinarId || this.state.watchInitData.webinar.id,
    }).then(res => {
      if (res.code == 200) {
        this.state.streamStatus = res.data.status;
      }
      return res;
    });
  }

  // 开播startLiveThird  第三方
  startLiveThird(data = {}) {
    return meeting.startLiveThird(data).then(res => {
      if (res.code == 200) {
        // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
        this.state.watchInitData.webinar.type = 1;
        this.state.watchInitData.switch = res.data;
        this.state.watchInitData.live_type = res.data.type
      }
      return res;
    });
  }

  // 设置第三方拉流地址
  setThirdPullStreamUrl(value) {
    this.state.thirdPullStreamUrl = value;
  }
  // 设置第三方拉流地址模式
  setThirdPullStreamMode(value) {
    this.state.thirdPullStreamMode = value;
  }
  setUnionConfig(data) {
    this.state.unionConfig = Object.assign({}, this.state.unionConfig, data)
  }

  //获取播放器以及文档水印相关配置
  getUnionConfig(webinar_id, tags = ['basic-config', 'definition', 'screen-config', 'water-mark']) {
    return player.getPlayerConfig({
      webinar_id: webinar_id || this.state.watchInitData.webinar.id,
      tags: tags
    }).then(res => {
      if (res.code == 200) {
        this.setUnionConfig(res.data)
      }
    });
  }
}

export default function useRoomBaseServer() {
  return new RoomBaseServer();
}
