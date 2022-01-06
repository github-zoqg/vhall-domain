import { meeting } from '@/request/index.js';
import { setRequestHeaders } from '@/utils/http.js';
import { merge } from '@/utils/index.js';
/**
 * send:发起端
 * standard:标准直播
 * embed:嵌入直播
 * sdk:sdk直播
 */

const liveType = new Map([
  ['send', 'initSendLive'],
  ['standard', 'initStandardReceiveLive'],
  ['embed', 'initEmbeddedReceiveLive'],
  ['sdk', 'initSdkReceiveLive']
]);
export default class RoomBaseServer {
  constructor() {
    if (typeof RoomBaseServer.instance === 'object') {
      return RoomBaseServer.instance;
    }

    this.state = {
      inited: false,
      isLiveOver: false,
      webinarVo: {},
      watchInitData: {}, // 活动信息
      groupInitData: {
        isBanned: false, // 小组禁言
        discussState: false, // 是否开始讨论
        isInGroup: false // 是否在小组中
      }, // 分组信息
      watchInitErrorData: undefined, // 默认undefined，如果为其他值将触发特殊逻辑
      configList: {},
      isGroupWebinar: false, // 是否是分组直播
      clientType: ''
    };

    RoomBaseServer.instance = this;
    return this;
  }

  // 初始化房间信息,包含发起/观看(嵌入/标品)
  initLive(options) {
    return meeting[liveType.get(options.clientType)](options).then(res => {
      if (res.code === 200) {
        state.state.inited = true;
        state.watchInitData = res.data;
        setRequestHeaders({
          'interact-token': res.data.interact.interact_token
        });
        return res;
      }
    });
  }
  // 设置分组讨论是否正在讨论中
  setGroupDiscussState(type) {
    state.groupInitData.discussState = type;
  }

  // 设置子房间初始化信息
  setGroupInitData(data) {
    state.groupInitData = merge.recursive({}, data, state.groupInitData);
    if (state.groupInitData.group_id === 0) {
      state.groupInitData.isInGroup = false;
    }
  }

  // 获取分组初始化信息
  getGroupInitData(data) {
    return requestApi.roomBase.getGroupInitData(data).then(res => {
      state.groupInitData = {
        ...state.groupInitData,
        ...res.data,
        isBanned: res.data.is_banned == '1',
        isInGroup: res.code !== 513325
      };
      return res;
    });
  }

  // 获取活动信息
  getWebinarInfo(data) {
    return requestApi.roomBase.getWebinarInfo(data).then(res => {
      state.webinarVo = res.data;
      return res;
    });
  }

  // 获取房间权限配置列表
  getConfigList(data) {
    return requestApi.roomBase.getConfigList(data).then(res => {
      state.configList = JSON.parse(res.data.permissions);
      return res;
    });
  }

  // 设置设备检测状态
  setDevice(data) {
    return requestApi.roomBase.setDevice(data).then(res => {
      return res;
    });
  }

  // 开播startLive
  startLive(data = {}) {
    setDevice(data);
    return requestApi.live.startLive(data);
  }

  // 结束直播
  endLive(data) {
    return requestApi.live.endLive(data);
  }

  // 开始/恢复录制
  startRecord() {
    return requestApi.roomBase.recordApi({
      status: 1
    });
  }

  // 暂停录制
  pauseRecord() {
    return requestApi.roomBase.recordApi({
      status: 2
    });
  }

  // 结束录制
  endRecord() {
    return requestApi.roomBase.recordApi({
      status: 3
    });
  }

  //初始化回放录制
  initReplayRecord(params = {}) {
    return requestApi.roomBase.initRecordApi(params);
  }

  //获取房间内各工具的状态
  getRoomToolStatus(params = {}) {
    return requestApi.roomBase.getRoomToolStatus(params);
  }
}
