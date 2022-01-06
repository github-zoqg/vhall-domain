import { mic } from '../../request';
export default class InteractiveServer {
  constructor() {
    if (typeof InteractiveServer.instance === 'object') {
      return InteractiveServer.instance;
    }
    InteractiveServer.instance = this;
    return this;
  }
  state = {
    vhallSaasInstance: null, // vhallsdk的实例
    interactiveInstance: null, // 互动实例
    streamId: null,
    remoteStreams: [] // 远端流数组
  };
  //初始化
  init(option) {
    const roomInitGroupServer = contextServer.get('roomInitGroupServer');
    this.state.vhallSaasInstance = roomInitGroupServer.state.vhallSaasInstance;
    return this.state.vhallSaasInstance.createInteractive(option).then(interactives => {
      this.state.interactiveInstance = interactives;
      return interactives;
    });
  }
  //销毁实例
  destroyInit() {
    return state.interactiveInstance.destroyInit();
  }
  //监听事件
  on(type, callback) {
    return this.state.interactiveInstance.$on(type, callback);
  }
  // 基础api
  // 常见本地流
  createLocalStream(options = {}, addConfig = {}) {
    return this.state.interactiveInstance.createLocalStream(options);
  }
  // 创建摄像头视频流
  createLocalVideoStream(options = {}, addConfig = {}) {
    return this.state.interactiveInstance.createLocalVideoStream(options, addConfig);
  }
  // 创建桌面共享流
  createLocaldesktopStream(options = {}, addConfig = {}) {
    return this.state.interactiveInstance.createLocaldesktopStream(options, addConfig);
  }
  // 创建本地音频流
  createLocalAudioStream(options = {}, addConfig = {}) {
    return this.state.interactiveInstance.createLocalAudioStream(options, addConfig);
  }
  // 创建图片推流
  createLocalPhotoStream(options = {}, addConfig = {}) {
    return this.state.interactiveInstance.createLocalPhotoStream(options, addConfig);
  }
  // 销毁额本地流
  destroyStream(streamId) {
    return this.state.interactiveInstance.destroyStream(streamId || state.streamId);
  }
  // 推送本地流到远端
  publishStream(options = {}) {
    return this.state.interactiveInstance.publishStream({
      streamId: options.streamId || this.state.streamId
    });
  }
  // 取消推送到远端的流
  unpublishStream(streamId) {
    return this.state.interactiveInstance.unpublishStream(streamId || this.state.streamId);
  }
  // 订阅远端流
  subscribeStream(options = {}) {
    return this.state.interactiveInstance.subscribeStream(options);
  }
  // 取消订阅远端流
  unSubscribeStream(streamId) {
    return this.state.interactiveInstance.unSubscribeStream(streamId);
  }
  // 设置大小流
  setDual(options = {}) {
    return this.state.interactiveInstance.setDual(options);
  }
  // 改变视频的禁用和启用
  muteVideo(options = {}) {
    return this.state.interactiveInstance.muteVideo(options);
  }
  // 改变音频的禁用和启用
  muteAudio(options = {}) {
    return this.state.interactiveInstance.muteAudio(options);
  }
  // 开启旁路
  startBroadCast(options = {}, addConfig = {}) {
    return this.state.interactiveInstance.startBroadCast(options, addConfig);
  }
  // 停止旁路
  stopBroadCast() {
    return this.state.interactiveInstance.stopBroadCast();
  }
  // 动态配置指定旁路布局模板
  setBroadCastLayout(options = {}) {
    return this.state.interactiveInstance.setBroadCastLayout(options);
  }
  // 配置旁路布局自适应模式
  setBroadCastAdaptiveLayoutMode(options = {}) {
    return this.state.interactiveInstance.setBroadCastAdaptiveLayoutMode(options);
  }
  // 动态配置旁路主屏
  setBroadCastScreen(mainScreenStreamId = '') {
    return this.state.interactiveInstance.setBroadCastScreen(mainScreenStreamId);
  }
  // 获取全部音视频列表
  getDevices() {
    return this.state.interactiveInstance.getDevices();
  }
  // 获取摄像头列表
  getCameras() {
    return this.state.interactiveInstance.getCameras();
  }
  // 获取麦克风列表
  getMicrophones() {
    return this.state.interactiveInstance.getMicrophones();
  }
  // 获取扬声器列表
  getSpeakers() {
    return this.state.interactiveInstance.getSpeakers();
  }
  // 获取设备的分辨率
  getVideoConstraints(deviceId = '') {
    return this.state.interactiveInstance.getVideoConstraints(deviceId);
  }
  // 配置本地流视频质量参数
  setVideoProfile(options = {}) {
    return this.state.interactiveInstance.setVideoProfile(options);
  }
  // 是否支持桌面共享
  isScreenShareSupported() {
    return this.state.interactiveInstance.isScreenShareSupported();
  }
  // 检查当前浏览器支持性
  async checkSystemRequirements() {
    if (!this.state.interactiveInstance) return;
    return this.state.interactiveInstance.checkSystemRequirements();
  }
  // 获取上下行丢包率
  getPacketLossRate() {
    return this.state.interactiveInstance.getPacketLossRate();
  }
  // 获取流上下行丢包率
  getStreamPacketLoss(options = {}) {
    return this.state.interactiveInstance.getStreamPacketLoss(options);
  }
  // 获取房间流信息
  getRoomStreams() {
    return this.state.interactiveInstance.getRoomStreams();
  }
  // 获取房间总的流信息(本地流加远端流)
  getRoomInfo() {
    return this.state.interactiveInstance.getRoomInfo();
  }
  // 获取流音频能量
  getAudioLevel(streamId) {
    return this.state.interactiveInstance.getAudioLevel(streamId);
  }
  // 获取流的mute状态
  getStreamMute(streamId) {
    return this.state.interactiveInstance.getStreamMute(streamId);
  }
  // 获取当前流的信息,返回一个数组
  currentStreams() {
    return this.state.interactiveInstance.currentStreams;
  }
  // 上麦
  speakOn(data = {}) {
    return mic.speakOn(data);
  }
  // 下麦
  speakOff(data = {}) {
    return mic.speakOff(data);
  }
  speakUserOff(data = {}) {
    return mic.speakUserOff(data);
  }
  // 设置主屏
  setMainScreen(data = {}) {
    return interactive.setMainScreen(data);
  }
  // 设置主讲人
  setSpeaker(data = {}) {
    return interactive.setSpeaker(data);
  }
  // 设置（麦克风-1 摄像头-2）
  setRoomDevice(data = {}) {
    return interactive.setRoomDevice(data);
  }
  // 允许举手
  setHandsup(data = {}) {
    return mic.setHandsUp(data);
  }
  // 邀请上麦
  inviteMic(data = {}) {
    return mic.inviteMic(data);
  }
  // 取消申请
  cancelApply(data = {}) {
    return mic.cancelApply(data);
  }
  // 拒绝邀请
  refuseInvite(data = {}) {
    return mic.refuseInvite(data);
  }
  // 组合api
  startPushStream() {
    console.log('state:', this.state);
    createLocalAndStream(this.state.interactiveInstance);
  }
  // 创建本地的推流和推流
  createLocalAndStream(interactive) {
    let camerasList = null,
      micropsList = null,
      videoConstraintsList = null,
      streamId = null;
    return interactive
      .getDevices()
      .then(data => {
        console.log('devices list::', data);
        camerasList = data.videoInputDevices.filter(d => d.label && d.deviceId != 'desktopScreen');
        micropsList = data.audioInputDevices.filter(
          d => d.deviceId != 'default' && d.deviceId != 'communications' && d.label
        );
      })
      .then(() => {
        const RESOLUTION_REG =
          /((^VIDEO_PROFILE_(720P|540P|480P|360P)_1$)|(^RTC_VIDEO_PROFILE_(720P|540P|480P|360P)_16x9_M$))/;
        interactive
          .getVideoConstraints(camerasList[0].deviceId)
          .then(data => {
            console.log('constrainList', data);
            videoConstraintsList = data.filter(item => RESOLUTION_REG.test(item.label));
          })
          .then(() => {
            let params = {
              videoNode: 'vhall-video',
              videoDevice: camerasList[0].deviceId,
              audioDevice: micropsList[0].deviceId,
              profile: videoConstraintsList[0]
            };
            interactive
              .createLocalVideoStream(params)
              .then(res => {
                console.log('create local stream success::', res);
                state.streamId = res;
                streamId = res;
                return res;
              })
              .catch(err => {
                console.log('local stream failed::', err);
              });
          })
          .catch(err => {
            console.log('constrainlist is failed::', err);
          });
      })
      .catch(err => {
        console.log('getDevies is failed::', err);
      });
  }
  pulishStream(streamId) {
    interactive
      .publishStream({ streamId })
      .then(res => {
        console.log('publish stream success::', streamId);
      })
      .catch(err => {
        console.log('publish is failed::', err);
      });
  }
  // 订阅流列表
  remoteStreamList() {
    this.state.remoteStreams = this.state.interactiveInstance.getRemoteStreams();
    for (const remoteStream in this.state.interactiveInstance.getRemoteStreams()) {
      this.state.remoteStreams.push(remoteStream);
    }
    return this.state.remoteStreams;
  }
  // sdk的监听事件
  listenerSdk() {
    this.state.interactiveInstance.on(VhallRTC.EVENT_REMOTESTREAM_ADD, e => {
      // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
      // state.remoteStreams.push(e)
    });
    this.state.interactiveInstance.on(VhallRTC.EVENT_REMOTESTREAM_REMOVED, e => {
      // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
      // state.remoteStreams.filter(item => item.streamId == e.streamId)
    });
  }
}
