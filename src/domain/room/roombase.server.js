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
      groupInitData: {
        isBanned: false, // 小组禁言
        discussState: false, // 是否开始讨论
        isInGroup: false // 是否在小组中
      }, // 分组信息
      watchInitErrorData: undefined, // 默认undefined，如果为其他值将触发特殊逻辑
      configList: {},
      handleLowerConfig: false, // 黄金链路-是否触发标记
      faultTipMsg: '', // 黄金链路-降级提示文案
      lowerGradeInterval: null, // 黄金链路计时器
      clientType: '',
      interactToolStatus: {},
      roomVisibleModules: [],
      miniElement: 'stream-list' // 可能的值：doc  stream-list
    };
    RoomBaseServer.instance = this;
    return this;
  }

  setClientType(type) {
    this.state.clientType = type;
  }

  // 初始化房间信息,包含发起/观看(嵌入/标品)
  initLive(options) {
    if (!['send', 'standard', 'embed', 'sdk'].includes(options.clientType)) {
      throw new Error('不合法的客户端类型');
    }
    this.setClientType(options.clientType);
    return meeting[liveType.get(options.clientType)](options).then(res => {
      if (res.code === 200) {
        this.state.watchInitData = res.data;
        setRequestHeaders({
          'interact-token': res.data.interact.interact_token
        });
        return res;
      }
    });
  }
  // 设置分组讨论是否正在讨论中
  setGroupDiscussState(type) {
    this.state.groupInitData.discussState = type;
  }

  // 设置miniELement
  requestChangeMiniElement(requestEle) {
    switch (requestEle) {
      case 'stream-list':
        this.state.miniElement = this.state.miniElement == 'doc' ? 'stream-list' : 'doc';
        break;
    }
  }

  // 更新roomVisibleModule
  updateRoomVisibleModules(cb) {
    this.state.roomVisibleModules = cb(this.state.roomVisibleModules);
  }

  // 设置子房间初始化信息
  setGroupInitData(data) {
    this.state.groupInitData = merge.recursive({}, data, this.state.groupInitData);
    if (this.state.groupInitData.group_id === 0) {
      this.state.groupInitData.isInGroup = false;
    }
  }

  // 获取分组初始化信息
  getGroupInitData(data) {
    return meeting.getGroupInitData(data).then(res => {
      this.state.groupInitData = {
        ...this.state.groupInitData,
        ...res.data,
        isBanned: res.data.is_banned == '1',
        isInGroup: res.code !== 513325
      };
      return res;
    });
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

  /**
   * 功能介绍：黄金链路
   * 作用：系统崩溃 配置项降级处理方案
   * @param {*} data 接口入参
   * @param {*} time 计时器 - 计
   * @param {*} environment
   * @param {*} systemKey
   */
  getLowerConfigList(data = {}, time = 5, environment = 'test', systemKey = 2) {
    // 黄金链路 - 内置逻辑
    async function getLowerGradeConfig(that, meeting, params) {
      const { data, environment, systemKey } = params;
      const lowerGrade = await meeting.getLowerGradeConfigInfo(data, environment, systemKey);
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
    }

    // 黄金链路 - 功能流程[前题config调用完毕]
    if (!this.state.handleLowerConfig) {
      // 没有击中黄金链路配置项情况下，调用-黄金链路心跳调用
      if (this.state.lowerGradeInterval) {
        clearInterval(this.state.lowerGradeInterval);
      }
      this.state.lowerGradeInterval = setInterval(() => {
        getLowerGradeConfig(this, meeting, {
          data,
          environment,
          systemKey
        });
      }, (Math.random() * time + time) * 1000);
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

  // 设置设备检测状态
  setDevice(data = {}) {
    const defaultParams = {
      room_id: this.state.watchInitData.interact.room_id,
      status: 1,
      type: 2
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return meeting.setDevice(retParams).then(res => {
      return res;
    });
  }

  // 开播startLive
  startLive(data = {}) {
    return meeting.startLive(data).then(res => {
      if (res.code == 200) {
        this.state.watchInitData.webinar.type = 1;
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
}

export default function useRoomBaseServer() {
  return new RoomBaseServer();
}
