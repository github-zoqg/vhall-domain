import { mic, room } from '../../request';
import { merge, sleep } from '../../utils';
import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useMsgServer from '../common/msg.server';
import VhallPaasSDK from '@/sdk/index';
class InteractiveServer extends BaseServer {
  constructor() {
    super();
    if (typeof InteractiveServer.instance === 'object') {
      return InteractiveServer.instance;
    }
    this.interactiveInstance = null; // 互动实例
    this.state = {
      localStream: {
        streamId: null, // 本地流id
        videoMuted: false,
        audioMuted: false,
        attributes: {}
      },
      /**
       * 房间流列表
       * accountId: "16422770"
        attributes: {
          accountId: "16422770"
          nickname: "春有百花秋有月 夏有凉风冬有雪，若无闲事挂心头便是人间好时节"
          roleName: 1
        }
        audioMuted: false
        streamId: "910274322990012300"
        streamSource: "remote"
        streamStatus: 0
        streamType: 2
        videoMuted: false
       */
      remoteStreams: [], // 远端流数组
      mainScreen: '16422770'
    };
    InteractiveServer.instance = this;
    return this;
  }

  // 设置本地日志打印等级
  static setLogLevel(opt) {
    return VhallPaasSDK.modules.VhallRTC.setLogLevel(opt);
  }

  /**
   * 初始化
   * @param {Object} customOptions
   * @returns {Promise}
   */
  init(customOptions = {}) {
    const defaultOptions = this._getDefaultOptions();
    const options = merge.recursive({}, defaultOptions, customOptions);

    return new Promise((resolve, reject) => {
      VhallPaasSDK.modules.VhallRTC.createInstance(
        options,
        event => {
          // 互动实例
          this.interactiveInstance = event.vhallrtc;
          this._addListeners();
          // 房间当前远端流列表
          this.state.remoteStreams = event.currentStreams;
          resolve(event);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  // 获取默认初始化参数
  _getDefaultOptions() {
    const { watchInitData } = useRoomBaseServer().state;
    const defaultOptions = {
      appId: watchInitData.interact.paas_app_id, // 互动应用ID，必填
      inavId: watchInitData.interact.inav_id, // 互动房间ID，必填
      roomId: watchInitData.interact.room_id, // 如需开启旁路，必填。
      accountId: watchInitData.join_info.third_party_user_id, // 第三方用户ID，必填
      token: watchInitData.interact.paas_access_token, // access_token，必填
      mode: VhallPaasSDK.modules.VhallRTC.MODE_RTC, //应用场景模式，选填，可选值参考下文【应用场景类型】。支持版本：2.3.1及以上。
      role: VhallPaasSDK.modules.VhallRTC.ROLE_HOST, //用户角色，选填，可选值参考下文【互动参会角色】。当mode为rtc模式时，不需要配置role。支持版本：2.3.1及以上。
      attributes: '', // String 类型
      autoStartBroadcast: watchInitData.join_info.role_name == 1, // 是否开启自动旁路 Boolean 类型   主持人默认开启true v2.3.5版本以上可用
      broadcastConfig:
        watchInitData.join_info.role_name == 1
          ? {
              layout: VhallPaasSDK.modules.VhallRTC.CANVAS_ADAPTIVE_LAYOUT_GRID_MODE, // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
              profile: VhallPaasSDK.modules.VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1, // 旁路直播视频质量参数
              paneAspectRatio: VhallPaasSDK.modules.VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9, //旁路混流窗格指定高宽比。  v2.3.2及以上
              precastPic: false, // 选填，当旁路布局模板未填满时，剩余的窗格默认会填充系统默认小人图标。可配置是否显示此图标。
              border: {
                // 旁路边框属性
                width: 2,
                color: '0x666666'
              }
            }
          : {} // 自动旁路   开启旁路直播方法所需参数
    };
    return defaultOptions;
  }

  /**
   * 销毁实例
   * @returns {Promise}}
   */
  destroy() {
    return this.interactiveInstance.destroyInstance();
  }

  // 注册事件监听
  _addListeners() {
    // -------------------------互动sdk内部消息--------------------------------------------
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_JOIN, e => {
      // 用户加入房间事件
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_JOIN, e);
    });

    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_LEAVE, e => {
      // 用户离开房间事件
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_LEAVE, e);
    });

    // 远端流加入事件
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_ADD, e => {
      // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
      e.data.attributes = e.data.attributes && JSON.parse(e.data.attributes);
      const remoteStream = {
        ...e.data,
        audioMuted: e.data.stream.audioMuted,
        videoMuted: e.data.stream.videoMuted
      };
      console.log('----流加入事件----', e);
      this.state.remoteStreams.push(remoteStream);
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_ADD, e);
    });

    // 远端流离开事件,自己的流删除事件收不到
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_REMOVED, e => {
      console.log('---流删除事件---', e);
      // 从流列表中删除
      this.state.remoteStreams = this.state.remoteStreams.filter(
        stream => stream.streamId != e.data.streamId
      );
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_REMOVED, e);
    });

    // 房间信令异常断开事件
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_EXCDISCONNECTED, e => {
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_EXCDISCONNECTED, e);
    });

    // 远端流音视频状态改变事件
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_MUTE, e => {
      console.log('---远端流音视频状态改变事件----', e);
      if (e.data.streamId == this.state.localStream.streamId) {
        // 本地流处理
        this.state.localStream.audioMuted = e.data.muteStream.audio;
        this.state.localStream.videoMuted = e.data.muteStream.video;
        console.log('----本地流处理----', this.state.localStream);
      } else {
        // 远端流处理
        this.state.remoteStreams.some(stream => {
          if (e.data.streamId == stream.streamId) {
            stream.audioMuted = e.data.muteStream.audio;
            stream.videoMuted = e.data.muteStream.video;
            return true;
          }
        });
      }
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_MUTE, e);
    });
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_FAILED, e => {
      // 本地推流或订阅远端流异常断开事件
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_FAILED, e);
    });
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_END, e => {
      // 本地流采集停止事件(处理拔出设备和桌面共享停止时)
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_END, e);
    });
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_STUNK, e => {
      // 本地流视频发送帧率异常事件
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_STUNK, e);
    });
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_DEVICE_CHANGE, e => {
      // 新增设备或移除设备时触发
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_DEVICE_CHANGE, e);
    });
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_FORCELEAVE, e => {
      // 强行踢出房间事件
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_FORCELEAVE, e);
    });
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_PLAYABORT, e => {
      // 订阅流自动播放失败
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_PLAYABORT, e);
    });

    // -------------------------房间业务消息--------------------------------------------
    const msgServer = useMsgServer();
    const { watchInitData } = useRoomBaseServer().state;
    msgServer.$onMsg('ROOM_MSG', msg => {
      if (
        msg.data.type == 'vrtc_frames_forbid' && // 业务关闭摄像头消息
        msg.data.target_id == watchInitData.join_info.third_party_user_id
      ) {
        // 本地流关闭视频
        this.muteVideo({
          streamId: this.state.localStream.streamId,
          isMute: true
        });
        // 业务消息不需要透传到ui层,ui层通过远端流音视频状态改变事件更新ui状态
        // this.$emit('vrtc_frames_forbid', msg)
      } else if (
        msg.data.type == 'vrtc_frames_display' && // 业务开启摄像头消息
        msg.data.target_id == watchInitData.join_info.third_party_user_id
      ) {
        // 本地流开启视频
        this.muteVideo({
          streamId: this.state.localStream.streamId,
          isMute: false
        });
        // this.$emit('vrtc_frames_display', msg);
      } else if (
        msg.data.type == 'vrtc_mute' && // 业务关闭麦克风消息
        msg.data.target_id == watchInitData.join_info.third_party_user_id
      ) {
        // 本地流关闭音频
        this.muteAudio({
          streamId: this.state.localStream.streamId,
          isMute: true
        });
        // this.$emit('vrtc_mute', msg);
      } else if (
        msg.data.type == 'vrtc_mute_cancel' && // 业务开启麦克风消息
        msg.data.target_id == watchInitData.join_info.third_party_user_id
      ) {
        // 本地流开启音频
        this.muteAudio({
          streamId: this.state.localStream.streamId,
          isMute: false
        });
        // this.$emit('vrtc_mute_cancel', msg);
      }
    });
  }

  // ---------------------------基础api---------------------------------------------
  /**
   * 创建本地流
   * @param {Object} options
   * @return {Promise} - 创建成功后的 promise
   *
   */
  createLocalStream(options = {}) {
    return this.interactiveInstance
      .createStream(options)
      .then(data => {
        console.log('----创建本地流成功----', data);
        this.state.localStream = {
          streamId: data.streamId,
          audioMuted: !options.audio,
          videoMuted: !options.video
        };
        return data;
      })
      .catch(err => {
        // 创建失败重试三次
        if (InteractiveServer._createLocalStreamRetryCount >= 3) {
          InteractiveServer._createLocalStreamRetryCount = 0;
          return err;
        }
        InteractiveServer._createLocalStreamRetryCount
          ? InteractiveServer._createLocalStreamRetryCount++
          : (InteractiveServer._createLocalStreamRetryCount = 1);
        this.createLocalStream(options);
      });
  }

  // 创建摄像头视频流
  createLocalVideoStream(options = {}) {
    const { state: roomBaseServerState } = useRoomBaseServer();

    let defaultOptions = {
      videoNode: options.videoNode, // 必填，传入本地视频显示容器ID
      audio: true, // 选填，是否采集音频设备，默认为true
      video: true, // 选填，是否采集视频设备，默认为true
      audioDevice: options.audioDevice, // 选填，指定的音频设备id，默认为系统缺省
      videoDevice: options.videoDevice, // 选填，指定的视频设备id，默认为系统缺省
      profile:
        VhallPaasSDK.modules.VhallRTC[options.profile] ||
        VhallPaasSDK.modules.VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
      streamType: 2, //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。
      attributes: JSON.stringify({
        roleName: roomBaseServerState.watchInitData.join_info.role_name,
        accountId: roomBaseServerState.watchInitData.join_info.third_party_user_id,
        nickname: roomBaseServerState.watchInitData.join_info.nickname
      }) //选填，自定义信息，支持字符串类型
    };
    const params = merge.recursive({}, defaultOptions, options);

    return this.createLocalStream(params);
  }
  // 创建桌面共享流
  createLocaldesktopStream(options = {}, addConfig = {}) {
    return this.interactiveInstance.createLocaldesktopStream(options, addConfig);
  }
  // 创建本地音频流
  createLocalAudioStream(options = {}, addConfig = {}) {
    return this.interactiveInstance.createLocalAudioStream(options, addConfig);
  }
  // 创建图片推流
  createLocalPhotoStream(options = {}, addConfig = {}) {
    return this.interactiveInstance.createLocalPhotoStream(options, addConfig);
  }
  // 销毁本地流
  destroyStream(streamId) {
    return this.interactiveInstance.destroyStream(streamId || this.state.streamId);
  }
  // 推送本地流到远端
  publishStream() {
    const { state: roomBaseServerState } = useRoomBaseServer();
    return this.interactiveInstance
      .publish({
        streamId: this.state.localStream.streamId,
        accountId: roomBaseServerState.watchInitData.join_info.third_party_user_id
      })
      .then(data => {
        return data;
      });
  }

  /**
   * 取消推送到远端的流
   * @param {Object} options
   * @returns {Promise}
   */
  unpublishStream(options = {}) {
    return this.interactiveInstance.unpublish({
      streamId: options.streamId || this.state.localStream.streamId
    });
  }

  /**
   * 清空本地流参数
   */
  clearLocalStream() {
    this.state.localStream = {
      streamId: null, // 本地流id
      videoMuted: false,
      audioMuted: false,
      attributes: {}
    };
  }

  /**
   * 订阅远端流
   * @param {Object} options -- streamId:订阅的流id videoNode: 页面显示的容器 mute: 远端流的音视频 dual: 大小流 0小流 1大流
   * @returns {Promise} - 订阅成功后的promise 回调
   */
  subscribe(options = {}) {
    return this.interactiveInstance.subscribe(options);
  }

  // 取消订阅远端流
  unSubscribeStream(streamId) {
    return this.interactiveInstance.unSubscribeStream(streamId);
  }

  /**
   * 开启旁路
   * @param {Object} options --  layout: 旁路布局  profile: 旁路直播视频质量参数 paneAspectRatio:旁路混流窗格指定高宽比 border: 旁路边框属性
   * @returns {Promise} - 开启旁路后的promise回调
   */
  startBroadCast(options = {}) {
    const defaultOptions = {
      layout: VhallPaasSDK.modules.VhallRTC.CANVAS_ADAPTIVE_LAYOUT_GRID_MODE, // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
      profile: VhallPaasSDK.modules.VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1, // 旁路直播视频质量参数
      paneAspectRatio: VhallPaasSDK.modules.VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9, //旁路混流窗格指定高宽比。  v2.3.2及以上
      border: {
        // 旁路边框属性
        width: 2,
        color: '0x1a1a1a'
      }
    };

    const params = merge.recursive({}, defaultOptions, options);

    // 如果有 adaptiveLayoutMode 就不传 layout
    if (params.adaptiveLayoutMode !== undefined || params.adaptiveLayoutMode !== null) {
      delete params.layout;
    }

    return this.interactiveInstance.startBroadCast(params).catch(async err => {
      // 开启失败重试三次
      if (InteractiveServer._startBroadCastRetryCount >= 3) {
        InteractiveServer._startBroadCastRetryCount = 0;
        return err;
      }
      // 等待 1s 重试
      await sleep(1000);
      InteractiveServer._startBroadCastRetryCount
        ? InteractiveServer._startBroadCastRetryCount++
        : (InteractiveServer._startBroadCastRetryCount = 1);
      this.startBroadCast(options);
    });
  }
  // 停止旁路
  stopBroadCast() {
    return this.interactiveInstance.stopBroadCast();
  }
  // 动态配置指定旁路布局模板
  setBroadCastLayout(options = {}) {
    return this.interactiveInstance.setBroadCastLayout(options);
  }
  // 配置旁路布局自适应模式
  setBroadCastAdaptiveLayoutMode(options = {}) {
    return this.interactiveInstance.setBroadCastAdaptiveLayoutMode(options);
  }
  // 动态配置旁路主屏
  setBroadCastScreen(options = {}) {
    return this.interactiveInstance
      .setBroadCastScreen({
        mainScreenStreamId: options.mainScreenStreamId || this.state.localStream.streamId
      })
      .catch(async err => {
        // 设置失败重试三次
        if (InteractiveServer._setBroadCastScreenRetryCount >= 3) {
          InteractiveServer._setBroadCastScreenRetryCount = 0;
          return err;
        }
        // 等待 50ms 重试
        await sleep(50);
        InteractiveServer._setBroadCastScreenRetryCount
          ? InteractiveServer._setBroadCastScreenRetryCount++
          : (InteractiveServer._setBroadCastScreenRetryCount = 1);
        return this.setBroadCastScreen(options);
      });
  }
  // 获取全部音视频列表
  getDevices() {
    return this.interactiveInstance.getDevices();
  }
  // 获取摄像头列表
  getCameras() {
    return this.interactiveInstance.getCameras();
  }
  // 获取麦克风列表
  getMicrophones() {
    return this.interactiveInstance.getMicrophones();
  }
  // 获取扬声器列表
  getSpeakers() {
    return this.interactiveInstance.getSpeakers();
  }
  // 获取设备的分辨率
  getVideoConstraints(deviceId = '') {
    return this.interactiveInstance.getVideoConstraints(deviceId);
  }
  // 配置本地流视频质量参数
  setVideoProfile(options = {}) {
    return this.interactiveInstance.setVideoProfile(options);
  }
  // 是否支持桌面共享
  isScreenShareSupported() {
    return this.interactiveInstance.isScreenShareSupported();
  }

  // 获取上下行丢包率
  getPacketLossRate() {
    return this.interactiveInstance.getPacketLossRate();
  }
  /**
   * 获取流上下行丢包率
   * @param {Object} options streamId: 流id
   * @returns {Promise}
   */
  getStreamPacketLoss(options = {}) {
    return this.interactiveInstance.getStreamPacketLoss(options);
  }
  // 获取房间总的流信息(本地流加远端流)
  getRoomInfo() {
    return this.interactiveInstance.getRoomInfo();
  }
  /**
   * 获取流音频级别
   * @param {Object} options streamId: 流id
   * @returns {Pormise}
   */
  getAudioLevel(options = {}) {
    return this.interactiveInstance.getAudioLevel(options);
  }
  // 获取流的mute状态
  getStreamMute(streamId) {
    return this.interactiveInstance.getStreamMute(streamId);
  }
  // 获取当前流的信息,返回一个数组
  currentStreams() {
    return this.interactiveInstance.currentStreams;
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
    createLocalAndStream(this.interactiveInstance);
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
                this.state.streamId = res;
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
  // 订阅流列表
  getRoomStreams() {
    const streamList = this.interactiveInstance.getRoomStreams();
    this.state.remoteStreams = streamList.map(stream => ({
      ...stream,
      attributes: stream.attributes ? JSON.parse(stream.attributes) : ''
    }));
    return this.state.remoteStreams;
  }
  /**
   * 互动流进入全屏
   * @param {Object} options   streamId:"123456789123456789",  // 流ID vNode: 'xxx', // 选填 以ID为结点的Dom
   * @returns {Promise} code 611035为全屏异常
   */
  setStreamFullscreen(options = {}) {
    return this.interactiveInstance.setStreamFullscreen(options);
  }
  /**
   * 互动流退出全屏
   * @param {Object} options   streamId:"123456789123456789",  // 流ID vNode: 'xxx', // 选填 以ID为结点的Dom
   * @returns {Promise} code 611035为全屏异常
   */
  exitStreamFullscreen(options = {}) {
    return this.interactiveInstance.exitStreamFullscreen(options);
  }
  /**
   * 设置大小流
   * @param {Object} options streamId:"", // 远端流Id，必填  dual:1   // 双流订阅选项， 0 为小流， 1为大流 必填。
   * @returns {Promise}
   */
  setDual(options = {}) {
    return this.interactiveInstance.setDual(options);
  }
  /**
   * 改变视频的禁用和启用
   * @param {Object} options
   * @returns {Promise}
   */
  muteVideo(options = {}) {
    return this.interactiveInstance.muteVideo(options).then(data => {
      if (options.streamId == this.state.localStream.streamId) {
        // 更新本地流视频静默状态
        this.state.localStream.videoMuted = options.isMute;
      } else {
        // 更新远端流视频静默状态
        this.state.remoteStreams.some(item => {
          if ((item.streamId = options.streamId)) {
            item.videoMuted = options.videoMuted;
            return true;
          }
        });
      }
      return data;
    });
  }
  /**
   * 改变音频的禁用和启用
   * @param {Object} options
   * @returns {Promise}
   */
  muteAudio(options = {}) {
    return this.interactiveInstance.muteAudio(options).then(data => {
      if (options.streamId == this.state.localStream.streamId) {
        // 更新本地流音频静默状态
        this.state.localStream.audioMuted = options.isMute;
      } else {
        // 更新远端流音频默状态
        this.state.remoteStreams.some(item => {
          if ((item.streamId = options.streamId)) {
            item.audioMuted = options.isMute;
            return true;
          }
        });
      }
      return data;
    });
  }
  /**
   * 设置房间音视频设备状态
   * @param {Object} params
   * @returns {Promise}
   */
  setDeviceStatus(params = {}) {
    const watchInitData = useRoomBaseServer().state.watchInitData;
    const defaultParams = {
      room_id: watchInitData.interact.room_id,
      broadcast: 1
    };
    const retParams = merge.recursive({}, defaultParams, params);
    return room.activity.setDeviceStatus(retParams);
  }
}

export default function useInteractiveServer() {
  return new InteractiveServer();
}
