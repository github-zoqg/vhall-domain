import { room } from '../../request';
import { merge, sleep } from '../../utils';
import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useGroupServer from '../group/StandardGroupServer';
import useMsgServer from '../common/msg.server';
import VhallPaasSDK from '@/sdk/index';
import useMicServer from './mic.server';
import interactive from '@/request/interactive';
import useMediaSettingServer from './mediaSetting.server';
class InteractiveServer extends BaseServer {
  constructor() {
    super();
    if (typeof InteractiveServer.instance === 'object') {
      return InteractiveServer.instance;
    }
    this.interactiveInstance = null; // 互动实例
    this.interactiveInstanceOptions = null; // 当前互动实例的参数
    this.state = {
      localStream: {
        streamId: null, // 本地流id
        videoMuted: false,
        audioMuted: false,
        attributes: {}
      },
      screenStream: {
        streamId: null
      },
      remoteStreams: [], // 远端流数组
      streamListHeightInWatch: 0, // PC观看端流列表高度
      fullScreenType: false // wap 全屏状态
    };
    InteractiveServer.instance = this;
    return this;
  }

  // 设置本地日志打印等级
  static setLogLevel(opt) {
    return VhallPaasSDK.modules.VhallRTC.setLogLevel(opt);
  }

  /**
   * 初始化互动实例
   * @param {Object} customOptions
   * @returns {Promise}
   */
  async init(customOptions = {}) {
    if (!this._isNeedInteractive()) return;

    const defaultOptions = await this._getDefaultOptions();
    const options = merge.recursive({}, defaultOptions, customOptions);

    const result = await this._isNeedReInit(options);
    if (!result) return;

    // 更新互动实例参数
    this.interactiveInstanceOptions = options;

    console.log('%cVHALL-DOMAIN-互动初始化参数', 'color:blue', options);

    return new Promise((resolve, reject) => {
      VhallPaasSDK.modules.VhallRTC.createInstance(
        options,
        event => {
          // 互动实例
          this.interactiveInstance = event.vhallrtc;
          this._addListeners();
          // 房间当前远端流列表
          this.state.remoteStreams = event.currentStreams.filter(stream => stream.streamType === 2);
          resolve(event);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * 判断是否需要初始化互动实例
   */
  _isNeedInteractive() {
    const { watchInitData } = useRoomBaseServer().state;
    const { isSpeakOn } = useMicServer().state;

    // 1. 如果不是观众需要初始化互动
    // 2. 如果是观众、并且是无延迟直播，需要初始化互动
    // 3. 如果是观众、不是无延迟直播、在麦上，需要初始化互动
    // 4. 如果是观众、不是无延迟直播、不在麦上，不需要初始化互动
    return (
      watchInitData.join_info.role_name != 2 ||
      watchInitData.webinar.no_delay_webinar == 1 ||
      isSpeakOn
    );
  }

  /**
   * 获取默认初始化参数
   */
  async _getDefaultOptions() {
    const { watchInitData } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state;

    // 如果是在小组中，取小组中的互动id和房间id初始化互动实例
    const roomId = groupInitData.isInGroup
      ? groupInitData.group_room_id
      : watchInitData.interact.room_id;
    const inavId = groupInitData.isInGroup ? groupInitData.inav_id : watchInitData.interact.inav_id;
    const token = groupInitData.isInGroup
      ? groupInitData.access_token
      : watchInitData.interact.paas_access_token;

    // 获取互动实例角色
    const role = await this._getInteractiveRole();

    const defaultOptions = {
      appId: watchInitData.interact.paas_app_id, // 互动应用ID，必填
      inavId, // 互动房间ID，必填
      roomId, // 如需开启旁路，必填。
      accountId: watchInitData.join_info.third_party_user_id, // 第三方用户ID，必填
      token, // access_token，必填
      mode:
        watchInitData.webinar.no_delay_webinar == 1
          ? VhallPaasSDK.modules.VhallRTC.MODE_LIVE
          : VhallPaasSDK.modules.VhallRTC.MODE_RTC, //应用场景模式，选填，可选值参考下文【应用场景类型】。支持版本：2.3.1及以上。
      role, //用户角色，选填，可选值参考下文【互动参会角色】。当mode为rtc模式时，不需要配置role。支持版本：2.3.1及以上。
      attributes: '', // String 类型
      autoStartBroadcast: watchInitData.join_info.role_name == 1, // 是否开启自动旁路 Boolean 类型   主持人默认开启true v2.3.5版本以上可用
      broadcastConfig:
        watchInitData.join_info.role_name == 1
          ? {
              adaptiveLayoutMode:
                VhallPaasSDK.modules.VhallRTC[sessionStorage.getItem('layout')] ||
                VhallPaasSDK.modules.VhallRTC.CANVAS_ADAPTIVE_LAYOUT_GRID_MODE, // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
              profile: VhallPaasSDK.modules.VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1, // 旁路直播视频质量参数
              paneAspectRatio: VhallPaasSDK.modules.VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9, //旁路混流窗格指定高宽比。  v2.3.2及以上
              precastPic: false, // 选填，当旁路布局模板未填满时，剩余的窗格默认会填充系统默认小人图标。可配置是否显示此图标。
              border: {
                // 旁路边框属性
                width: 2,
                color: '0x1a1a1a'
              }
            }
          : {}, // 自动旁路   开启旁路直播方法所需参数
      otherOption: watchInitData.report_data
    };

    return defaultOptions;
  }

  /**
   * 获取初始化互动sdk实例的角色
   * @returns {String}}
   */
  async _getInteractiveRole() {
    const { watchInitData, interactToolStatus } = useRoomBaseServer().state;

    // 如果是主持人、嘉宾、助理，设为 HOST
    if (watchInitData.join_info.role_name != 2) {
      return VhallPaasSDK.modules.VhallRTC.ROLE_HOST;
    }

    // 如果在麦上，设为 HOST
    if (
      interactToolStatus.speaker_list &&
      interactToolStatus.speaker_list.length &&
      interactToolStatus.speaker_list.some(
        item => item.account_id == watchInitData.join_info.third_party_user_id
      )
    ) {
      return VhallPaasSDK.modules.VhallRTC.ROLE_HOST;
    }

    // 如果不是无延迟直播，不需要设置role，默认设为 AUDIENCE
    if (watchInitData.webinar.no_delay_webinar == 0) {
      return VhallPaasSDK.modules.VhallRTC.ROLE_AUDIENCE;
    }

    // 如果是无延迟直播、不在麦、开启自动上麦
    if (interactToolStatus.auto_speak == 1) {
      // 调上麦接口判断当前人是否可以上麦
      const res = await useMicServer().userSpeakOn();
      // 如果上麦成功，设为 HOST
      if (res.code == 200) return VhallPaasSDK.modules.VhallRTC.ROLE_HOST;
    }

    // 如果是无延迟直播、不在麦、未开启自动上麦，设为 AUDIENCE
    return VhallPaasSDK.modules.VhallRTC.ROLE_AUDIENCE;
  }

  // 是否需要重新初始化互动实例
  async _isNeedReInit(options) {
    // 1. 如果当前不存在互动实例，需要重新初始化互动sdk
    // 2. 如果是房间id发生了变化，需要重新初始化互动sdk
    // 3. 如果是角色发生了变化，需要重新初始化互动sdk
    // 4. 如果销毁互动sdk失败，return false
    if (!this.interactiveInstance) {
      return true;
    }
    if (
      options.roomId !== this.interactiveInstanceOptions.roomId ||
      options.role !== this.interactiveInstanceOptions.role
    ) {
      const err = await this.destroy();
      return !err;
    }
  }

  /**
   * 销毁实例
   * @returns {Promise}}
   */
  destroy() {
    return this.interactiveInstance
      .destroyInstance()
      .then(() => {
        this.interactiveInstance = null;
        this.state.remoteStreams = [];
      })
      .catch(err => {
        console.log('互动sdk销毁失败', err);
        return err;
      });
  }

  /**
   * 注册事件监听
   */
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

      if (e.data.streamType === 2) {
        const remoteStream = {
          ...e.data,
          audioMuted: e.data.stream.audioMuted,
          videoMuted: e.data.stream.videoMuted
        };
        this.state.remoteStreams.push(remoteStream);
      }
      console.log('----流加入事件----', e);

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

    // 本地流采集停止事件(处理拔出设备和桌面共享停止时)
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_END, e => {
      // if(this.roleName == 1){
      //   this.resetLayout()
      // }
      if (e.data.streamId == this.state.screenStream.streamId) {
        this.state.screenStream.streamId = '';
        useRoomBaseServer().setShareScreenStatus(false);
        useRoomBaseServer().setChangeElement('stream-list');
      }

      // if (e.data.streamId == this.state.localStream.streamId) {

      //   if (this.splited) return; // 解决17565 【H5】主持人结束“分屏”，主持人自动下麦
      //   EventBus.$emit('EVENT_STREAM_END_ERROR');
      //   if (this.$localStreamId == e.data.streamId) {
      //     this.speakOff();
      //   }
      // }
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
      } else if (msg.data.type === 'live_over') {
        // 直播结束
        this.setStreamListHeightInWatch(0);
      }
    });
  }

  /**
   * 创建本地流
   * @param {Object} options
   * @return {Promise} - 创建成功后的 promise
   */
  createLocalStream(options = {}) {
    return this.interactiveInstance
      .createStream(options)
      .then(data => {
        console.log('----创建本地流成功----', data);
        // 如果创建的是桌面共享流
        if (options.streamType === 3) {
          this.state.screenStream.streamId = data.streamId;
        } else {
          this.state.localStream = {
            streamId: data.streamId,
            audioMuted: options.mute?.audio || false,
            videoMuted: options.mute?.video || false
          };
        }
        return data;
      })
      .catch(err => {
        if (err?.data?.error?.msg?.message === 'Permission denied') {
          return err;
        }
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

  /**
   * 创建摄像头视频流
   * @param {Object} options
   * @return {Promise}
   */
  createLocalVideoStream(options = {}) {
    const { watchInitData } = useRoomBaseServer().state;

    const { interactToolStatus } = useRoomBaseServer().state;

    let defaultOptions = {
      videoNode: options.videoNode, // 必填，传入本地视频显示容器ID
      audio: true, // 选填，是否采集音频设备，默认为true
      video: watchInitData.webinar.mode != 1, // 选填，是否采集视频设备，默认为true
      audioDevice: options.audioDevice || sessionStorage.getItem('selectedAudioDeviceId'), // 选填，指定的音频设备id，默认为系统缺省
      videoDevice:
        watchInitData.webinar.mode != 1
          ? options.videoDevice || sessionStorage.getItem('selectedVideoDeviceId')
          : null, // 选填，指定的视频设备id，默认为系统缺省
      profile:
        VhallRTC[this.getVideoProfile()] ||
        VhallRTC[options.profile] ||
        VhallRTC[interactToolStatus.definition] ||
        VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
      streamType: 2, //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。
      attributes: JSON.stringify({
        roleName: watchInitData.join_info.role_name,
        accountId: watchInitData.join_info.third_party_user_id,
        nickname: watchInitData.join_info.nickname
      }) //选填，自定义信息，支持字符串类型
    };

    // 当前用户是否在上麦列表中
    const isOnMicObj = interactToolStatus.speaker_list.find(
      item => item.account_id == watchInitData.join_info.third_party_user_id
    );

    // 如果当前用户在上麦列表中，mute 状态需要从上麦列表中获取，否则默认开启
    if (isOnMicObj) {
      defaultOptions.mute = {
        audio: !isOnMicObj.audio,
        video: !isOnMicObj.video
      };
    }

    // 音频直播静音video
    if (watchInitData.webinar.mode == 1) {
      defaultOptions.mute && (defaultOptions.mute.video = true);
      !defaultOptions.mute && (defaultOptions.mute = { video: true });
    }

    const params = merge.recursive({}, defaultOptions, options);

    return this.createLocalStream(params);
  }

  /**
   * 获取旁路布局
   * @param { string } param [字符串 120，240，360，480]
   * @returns { String } [互动sdk推流Profile常量]
   */
  formatDefinition(param = '360') {
    let definition = 'RTC_VIDEO_PROFILE_360P_16x9_M';
    switch (param) {
      case '720':
      case '超清':
        definition = 'RTC_VIDEO_PROFILE_720P_16x9_M';
        break;
      case '240':
      case '流畅':
        definition = 'RTC_VIDEO_PROFILE_240P_16x9_M';
        break;
      case '540':
        definition = 'RTC_VIDEO_PROFILE_540P_16x9_M';
        break;
      case '480':
      case '高清':
        definition = 'RTC_VIDEO_PROFILE_480P_16x9_M';
        break;
      case '180':
        definition = 'RTC_VIDEO_PROFILE_180P_16x9_M';
        break;
      case '360':
      case '标清':
        definition = 'RTC_VIDEO_PROFILE_360P_16x9_M';
        break;
      case '120':
        definition = 'RTC_VIDEO_PROFILE_120P_16x9_M';
        break;
    }
    return definition;
  }

  /**
   * 获取分辨率
   */
  getVideoProfile() {
    const { interactToolStatus } = useRoomBaseServer().state;

    const remoteStream = this.getRoomStreams();
    if (!remoteStream || !remoteStream.length) {
      return false;
    }
    const onlineLength = remoteStream.filter(item => item.streamType == 2).length;
    let profile;
    const isHost =
      interactToolStatus.main_screen == this.accountId || this.docPermissionId == this.accountId;
    if (onlineLength >= 0 && onlineLength <= 6) {
      if (isHost) {
        profile = this.formatDefinition('720');
      } else {
        profile = this.formatDefinition('360');
      }
    } else if (onlineLength > 6 && onlineLength <= 11) {
      if (isHost) {
        profile = this.formatDefinition('720');
      } else {
        profile = this.formatDefinition('240');
      }
    } else {
      if (isHost) {
        profile = this.formatDefinition('540');
      } else {
        profile = this.formatDefinition('180');
      }
    }
    return profile;
  }

  // 创建桌面共享流
  createLocaldesktopStream(options = {}, addConfig = {}) {
    const params = merge.recursive({ streamType: 3 }, options, addConfig);
    return this.createLocalStream(params);
  }
  // 创建本地音频流
  createLocalAudioStream(options = {}, addConfig = {}) {
    return this.interactiveInstance.createLocalAudioStream(options, addConfig);
  }

  // 创建图片推流
  createLocalPhotoStream(options = {}, addConfig = {}) {
    let defaultOptions = {
      video: false,
      audio: true,
      videoContentHint: 'detail'
    };
    const params = merge.recursive({}, defaultOptions, options, addConfig);
    return this.createLocalStream(params);
  }

  // Wap 创建摄像头视频流
  async createWapLocalStream(options = {}, addConfig = {}) {
    const { watchInitData } = useRoomBaseServer().state;
    const { interactToolStatus } = useRoomBaseServer().state;

    let defaultOptions = {
      video: true,
      audio: true,
      facingMode: options.facingMode || 'user',
      profile:
        VhallRTC[this.getVideoProfile()] ||
        VhallRTC[options.profile] ||
        VhallRTC[interactToolStatus.definition] ||
        VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
      streamType: 2, //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。,
      attributes: JSON.stringify({
        roleName: watchInitData.join_info.role_name,
        accountId: watchInitData.join_info.third_party_user_id,
        nickname: watchInitData.join_info.nickname
      })
    };

    const params = merge.recursive({}, defaultOptions, options, addConfig);
    return await this.createLocalStream(params);
  }

  // 销毁本地流
  destroyStream(streamId) {
    return this.interactiveInstance.destroyStream(streamId || this.state.streamId);
  }

  // 无缝切换本地流
  switchStream(opt) {
    return new Promise((resolve, reject) => {
      let mediaSetting = useMediaSettingServer().state;

      let { streamId, type } = opt;
      if (!streamId || (type != 'video' && type != 'audio')) {
        reject({ code: '', msg: '参数异常' });
      }

      let deviceId = null;
      if (type == 'video') {
        deviceId = mediaSetting.video;
      } else if (type == 'audio') {
        deviceId = mediaSetting.audioInput;
      }
      if (!deviceId) {
        reject({ code: '', msg: 'deviceId未传值' });
      }
      const defaultPa = {
        streamId: streamId, // 必填，本地流ID
        type: type, // 必填，支持'video'和'audio'，分别表示视频设备和音频设备
        deviceId: deviceId // 必填，设备ID，可通过getDevices()方法获取。
      };
      console.warn('%ccxs ---最终参数-------', 'color: blue', defaultPa);
      return this.interactiveInstance.switchDevice(defaultPa);
    });
  }

  // 推送本地流到远端
  publishStream(options = {}) {
    const { state: roomBaseServerState } = useRoomBaseServer();
    return this.interactiveInstance
      .publish({
        streamId: options.streamId || this.state.localStream.streamId
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
    return this.interactiveInstance
      .unpublish({
        streamId: options.streamId || this.state.localStream.streamId
      })
      .then(res => {
        this._clearLocalStream();
        return res;
      });
  }

  /**
   * 清空本地流参数
   */
  _clearLocalStream() {
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

  // 获取插播和桌面共享的流信息
  getDesktopAndIntercutInfo() {
    let streamList = this.interactiveInstance.getRoomStreams();
    streamList = streamList.map(stream => ({
      ...stream,
      attributes: stream.attributes ? JSON.parse(stream.attributes) : ''
    }));

    // 此处默认插播和桌面共享不共存，只会返回一个
    let stream = streamList.find(stream => stream.streamType === 3 || stream.streamType === 4);
    return stream;
  }
  // 重新旁路布局
  resetLayout() {
    const role_name = useRoomBaseServer().state.watchInitData.join_info.role_name;
    if (role_name != 1) return;

    const isInGroup = useGroupServer().state.groupInitData.isInGroup;
    if (isInGroup) return;

    const stream = this.getDesktopAndIntercutInfo();

    // 如果有桌面共享或插播
    if (stream) {
      this.setBroadCastScreen(stream.streamId)
        .then(() => {
          console.log('动态设置旁路主屏幕成功', stream.streamId);
        })
        .catch(e => {
          console.error('动态设置旁路主屏幕失败', e);
        });
    }

    if (stream) {
      // 一人铺满布局
      this.setBroadCastLayout({ layout: VhallRTC.CANVAS_LAYOUT_PATTERN_GRID_1 });
    } else {
      // 自适应布局
      const adaptiveLayoutMode = useMediaSettingServer().state.layout;
      this.setBroadCastAdaptiveLayoutMode({ adaptiveLayoutMode });
    }
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
  setBroadCastScreen(streamId) {
    return this.interactiveInstance
      .setBroadCastScreen({
        mainScreenStreamId: streamId || this.state.localStream.streamId
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
        return this.setBroadCastScreen(streamId);
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

  // 订阅流列表
  getRoomStreams() {
    return this.interactiveInstance.getRoomStreams();
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

  /**
   * 设置PC观看端流列表高度
   * @param {Number} val 0, 80
   */
  setStreamListHeightInWatch(val) {
    this.state.streamListHeightInWatch = val;
  }

  /*
   * 播放
   */
  setPlay(opt) {
    return this.interactiveInstance.play(opt);
  }
  /*
   * 播放
   */
  setPause(opt) {
    return this.interactiveInstance.pause(opt);
  }
}

export default function useInteractiveServer() {
  return new InteractiveServer();
}
