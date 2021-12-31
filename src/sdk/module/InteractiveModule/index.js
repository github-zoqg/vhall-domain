import BaseModule from '../Base'
import { merge } from '@/utils/index.js'
import store from '../../store/index.js';
export default class InteractiveModule extends BaseModule {
  constructor(customOptions) {
    super(customOptions)
    this.instance = null
  }

  /**
   * 初始化互动sdk
   * @param {Object} customOptions 
   * @param {*} successCb 
   * @param {*} failCb 
   * 
   */
  init(customOptions = {}, successCb = () => { }, failCb = () => { }) {
    console.log('customoptions', customOptions);
    console.log('store', store);
    const defaultOptions = {
      appId: store.get('roomInitData').paasInfo.paas_app_id, // 互动应用ID，必填
      inavId: store.get('roomInitData').paasInfo.inav_id, // 互动房间ID，必填
      roomId: store.get('roomInitData').paasInfo.room_id, // 如需开启旁路，必填。
      accountId: store.get('roomInitData').userInfo.third_party_user_id, // 第三方用户ID，必填
      token: store.get('roomInitData').paasInfo.paas_access_token, // access_token，必填
      mode: VhallRTC.MODE_RTC, //应用场景模式，选填，可选值参考下文【应用场景类型】。支持版本：2.3.1及以上。
      role: VhallRTC.ROLE_HOST,//用户角色，选填，可选值参考下文【互动参会角色】。当mode为rtc模式时，不需要配置role。支持版本：2.3.1及以上。
      attributes: '',// String 类型
      autoStartBroadcast: store.get('roomInitData').userInfo.role_name == 1, // 是否开启自动旁路 Boolean 类型   主持人默认开启true v2.3.5版本以上可用
      broadcastConfig: store.get('roomInitData').userInfo.role_name == 1 ? {
        layout: customOptions.layout || VhallRTC.CANVAS_ADAPTIVE_LAYOUT_GRID_MODE, // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
        profile: customOptions.profile || VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1, // 旁路直播视频质量参数
        paneAspectRatio: VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9, //旁路混流窗格指定高宽比。  v2.3.2及以上
        precastPic: false,
        border: customOptions.border || {
          // 旁路边框属性
          width: 2,
          color: '0x666666'
        }
      } : {},// 自动旁路   开启旁路直播方法所需参数
    }
    const options = merge.recursive({}, defaultOptions, customOptions)
    console.log("optionssssssssssssssssssssssssssss", options);

    return new Promise((resolve, reject) => {
      const onSuccess = (event) => {
        this.instance = event.vhallrtc;
        this.currentStreams = event.currentStreams
        this.listenEvents();
        console.log('init interactive sdk success:', event)
        window.interactiveSdk = event
        successCb(event)
        resolve(event)
      }

      const onFail = (event) => {
        console.log('fail:', event)
        failCb(event)
        reject(event)
      }

      VhallRTC.createInstance(options, onSuccess, onFail)

    })

  }

  listenEvents() {
    this.instance.on(VhallRTC.EVENT_REMOTESTREAM_ADD, (e) => {
      // 远端流加入事件
      console.log('5555555remote stream added')
      this.$emit(VhallRTC.EVENT_REMOTESTREAM_ADD, e)
    });

    this.instance.on(VhallRTC.EVENT_REMOTESTREAM_REMOVED, (e) => {
      // 远端流离开事件
      this.$emit(VhallRTC.EVENT_REMOTESTREAM_REMOVED, e)
    });
    this.instance.on(VhallRTC.EVENT_ROOM_EXCDISCONNECTED, (e) => {
      // 房间信令异常断开事件
      this.$emit(VhallRTC.EVENT_ROOM_EXCDISCONNECTED, e)
    });
    this.instance.on(VhallRTC.EVENT_REMOTESTREAM_MUTE, (e) => {
      // 远端流音视频状态改变事件
      this.$emit(VhallRTC.EVENT_REMOTESTREAM_MUTE, e)
    });
    this.instance.on(VhallRTC.EVENT_REMOTESTREAM_FAILED, (e) => {
      // 本地推流或订阅远端流异常断开事件
      this.$emit(VhallRTC.EVENT_REMOTESTREAM_FAILED, e)
    });
    this.instance.on(VhallRTC.EVENT_STREAM_END, (e) => {
      // 本地流采集停止事件(处理拔出设备和桌面共享停止时)
      this.$emit(VhallRTC.EVENT_STREAM_END, e)
    });
    this.instance.on(VhallRTC.EVENT_STREAM_STUNK, (e) => {
      // 本地流视频发送帧率异常事件
      this.$emit(VhallRTC.EVENT_STREAM_STUNK, e)
    });
    this.instance.on(VhallRTC.EVENT_DEVICE_CHANGE, (e) => {
      // 新增设备或移除设备时触发
      this.$emit(VhallRTC.EVENT_DEVICE_CHANGE, e)
    });
  }
  /**
   * 销毁互动sdk
   * @returns -- 销毁互动sdk
   */
  destroyInit() {
    return new Promise((resolve, reject) => {
      this.instance.destroyInstance(
        {}).then(() => {
          resolve()
          this.instance = null
        }).catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * 创建本地流
   * @param obt {Object} - sdk init stream base info config
   * @return {Promise} - 创建成功后的promise 回调
   *
   */
  createLocalStream(options = {}) {
    return new Promise((resolve, reject) => {
      this.instance.createStream(options)
        .then((data) => {
          resolve(data.streamId)
        }).catch((error) => {
          if (store.get('roomInitData').userInfo.role_name != 1) {
            //上麦人员无法创建本地流上麦，向外抛出信息
            const toSpeakInfo = {
              roleName: store.get('roomInitData').userInfo.role_name,
              accountId: store.get('roomInitData').userInfo.third_party_user_id,
              nickName: store.get('roomInitData').userInfo.nickname,
              ...error
            }
            reject(toSpeakInfo)
          } else {
            reject(error)
          }
        })
    })
  }

  /**
   * 创建摄像头视频流
   * @param obt {Object} - sdk init stream base info config  videoNode: 容器 audioDevice: 音频的Id videoDevice:视频的设备Id profile:视频推流的质量
   * @return {Promise} - 创建成功后的promise 回调
   *
   */
  createLocalVideoStream(options = {}, addConfig = {}) {
    return new Promise((resolve, reject) => {
      let defaultOptions = {
        videoNode: options.videoNode, // 必填，传入本地视频显示容器ID
        audio: true, // 选填，是否采集音频设备，默认为true
        video: true, // 选填，是否采集视频设备，默认为true
        audioDevice: options.audioDevice, // 选填，指定的音频设备id，默认为系统缺省
        videoDevice: options.videoDevice, // 选填，指定的视频设备id，默认为系统缺省
        profile: VhallRTC[options.profile] || VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
        streamType: 2, //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。
        attributes: JSON.stringify({
          roleName: store.get('roomInitData').userInfo.role_name,
          accountId: store.get('roomInitData').userInfo.third_party_user_id,
          nickName: store.get('roomInitData').userInfo.nickname,
        }), //选填，自定义信息，支持字符串类型
      }
      const params = merge.recursive({}, defaultOptions, addConfig)
      console.log('pass params::', params);

      this.instance.createStream(params)
        .then((data) => {
          resolve(data.streamId)
        }).catch((error) => {
          if (store.get('roomInitData').userInfo.role_name != 1) {
            //上麦人员无法创建本地流上麦，向外抛出信息
            const toSpeakInfo = {
              roleName: store.get('roomInitData').userInfo.role_name,
              accountId: store.get('roomInitData').userInfo.third_party_user_id,
              nickName: store.get('roomInitData').userInfo.nickname,
              ...error
            }
            reject(toSpeakInfo)
          } else {
            reject(error)
          }
        })
    })
  }

  /**
   * 创建桌面共享流
   * @param obt {Object} - sdk init stream base info config  videoNode: 容器 speaker: 是否采集扬声器 profile: 视频的质量 addConfig: 扩展配置项
   * @return {Promise} - 创建成功后的promise 回调
   *
   */
  createLocaldesktopStream(options = {}, addConfig = {}) {
    return new Promise((resolve, reject) => {
      let defaultOptions = {
        videoNode: options.videoNode, // 必填，传入本地视频显示容器ID
        screen: true,
        audio: options.audio || false, // 桌面共享不采集麦克风防止回声
        speaker: options.speaker || false, // 桌面共享时是否分享桌面音频(如为true，则chrome浏览器弹框左下角将显示“分享音频”选框)，默认为false
        profile: options.profile || VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
        streamType: 3, //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。
        attributes: JSON.stringify({
          roleName: store.get('roomInitData').userInfo.role_name,
          accountId: store.get('roomInitData').userInfo.third_party_user_id,
          nickName: store.get('roomInitData').userInfo.nickname,
        }), //选填，自定义信息，支持字符串类型
      }
      const params = merge.recursive({}, defaultOptions, addConfig)
      this.instance.createStream(params)
        .then((data) => {
          resolve(data.streamId)
        }).catch((error) => {
          if (store.get('roomInitData').userInfo.role_name != 1) {
            //上麦人员无法创建本地流上麦，向外抛出信息
            const toSpeakInfo = {
              roleName: store.get('roomInitData').userInfo.role_name,
              accountId: store.get('roomInitData').userInfo.third_party_user_id,
              nickName: store.get('roomInitData').userInfo.nickname,
              ...error
            }
            reject(toSpeakInfo)
          } else {
            reject(error)
          }
        })
    })
  }

  /**
   * 创建本地音频流
   * @param obt {Object} - sdk init stream base info config  videoNode: 容器 audioDevice: 音频Id addConfig: 扩展配置项
   * @return {Promise} - 创建成功后的promise 回调
   *
   */
  createLocalAudioStream(options = {}, addConfig = {}) {
    return new Promise((resolve, reject) => {
      let defaultOptions = {
        videoNode: options.videoNode, // 必填，传入本地视频显示容器ID
        audio: true, // 选填，是否采集音频设备，默认为true
        video: false, // 选填，是否采集视频设备，默认为true
        audioDevice: options.audioDevice, // 选填，指定的音频设备id，默认为系统缺省
        showControls: false, // 选填，是否开启视频原生控制条，默认为false
        attributes: JSON.stringify({
          roleName: store.get('roomInitData').userInfo.role_name,
          accountId: store.get('roomInitData').userInfo.third_party_user_id,
          nickName: store.get('roomInitData').userInfo.nickname,
        }), //选填，自定义信息，支持字符串类型


        streamType: 0, //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。
      }
      const params = merge.recursive({}, defaultOptions, addConfig)
      this.instance.createStream(params)
        .then((data) => {
          resolve(data.streamId)
        }).catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * 创建图片推流
   * @param obt {Object} - sdk init stream base info config  videoNode: 容器 videoTrack: MediaStreamTrack对象,采集图像 addConfig: 扩展配置项
   * @return {Promise} - 创建成功后的promise 回调
   *
   */
  createLocalPhotoStream(options = {}, addConfig = {}) {
    return new Promise((resolve, reject) => {
      let defaultOptions = {
        videoNode: options.videoNode, // 传入本地视频显示容器，必填
        audio: true,
        video: false,   //如参会者没有摄像头，则传入false
        videoTrack: options.videoTrack,    //MediaStreamTrack对象
        attributes: JSON.stringify({
          roleName: store.get('roomInitData').userInfo.role_name,
          accountId: store.get('roomInitData').userInfo.third_party_user_id,
          nickName: store.get('roomInitData').userInfo.nickname,
        }) //选填，自定义信息，支持字符串类型
      }
      const params = merge.recursive({}, defaultOptions, addConfig)
      this.instance.createStream(params)
        .then((data) => {
          resolve(data.streamId)
        }).catch((error) => {
          reject(error)
        })
    })
  }
  /**
   * 销毁本地流
   * @param {String} streamId -- 要销毁的流Id
   * @returns 
   */
  destroyStream(streamId = '') {
    return new Promise((resolve, reject) => {
      this.instance.destroyStream({ streamId })
        .then(() => {
          resolve()
        }).catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * 推送本地流到远端
   * @param {Object} options publish stream base info config  streamId：要推的流Id，accountId:用户Id
   * @return {Promise} - 推流成功后的promise 回调
   */
  publishStream(options = {}) {
    return new Promise((resolve, reject) => {
      this.instance.publish(
        {
          streamId: options.streamId,
          accountId: options.accountId
        }).then((data) => {
          resolve(data)
        }).catch((errInfo) => {
          reject(errInfo)
        })
    })
  }

  /**
   * 取消推送到远端的流
   * @param {String} streamId 要取消推的流Id
   * @returns {Promise} - 取消推流成功后的promise 回调
  */
  unpublishStream(streamId = '') {
    return new Promise((resolve, reject) => {
      this.instance.unpublish({ streamId })
        .then(() => {
          resolve()
        }).catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * 订阅远端流
   * @param {Object} options -- streamId:订阅的流id videoNode: 页面显示的容器 mute: 远端流的音视频 dual: 大小流 0小流 1大流
   * @returns {Promise} - 订阅成功后的promise 回调
   */
  subscribeStream(options = {}, addConfig = {}) {
    return new Promise((resolve, reject) => {
      let defaultOptions = {
        videoNode: options.videoNode, // 传入本地视频显示容器，必填
        streamId: options.streamId,
        dual: options.dual || 1 // 双流订阅选项， 0为小流， 1为大流(默认)
      }
      const params = merge.recursive({}, defaultOptions, addConfig)
      this.instance.subscribe(params)
        .then((data) => {
          resolve(data)
        }).catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * 取消订阅远端流
   * @param {String} streamId -- 要取消订阅的流Id 
   * @returns {Promise} - 取消订阅成功后的promise 回调
   */
  unSubscribeStream(streamId = '') {
    return new Promise((resolve, reject) => {
      this.instance.unsubscribe({ streamId })
        .then((data) => {
          resolve(data)
        }).catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * 设置大小流
   * @param {Object} options streamId: 需要设置的流Id  dual: 0为小流 1为大流
   * @returns {Promise} - 设置订阅大小流成功后的promise回调
   */
  setDual(options = {}) {
    return new Promise((resolve, reject) => {
      const params = {
        streamId: options.streamId,
        dual: options.dual
      }
      this.instance.setDual(params)
        .then(data => {
          resolve(data)
        }).catch(error => {
          reject(error)
        })
    })
  }
  /**
   * 改变视频的禁用和启用
   * @param {Object} options streamId: 对哪一路流进行操作的流Id  isMute: true为禁用，false为启用
   * @returns {Promise} - 改变视频的禁用与开启后的promise 回调
   */
  muteVideo(options = {}) {
    return new Promise((resolve, reject) => {
      const params = {
        streamId: options.streamId,
        isMute: options.isMute
      }
      this.instance.muteVideo(params)
        .then(data => {
          resolve(data)
        }).catch(error => {
          reject(error)
        })
    })
  }
  /**
   * 改变音频的禁用和启用
   * @param {Object} options streamId: 对哪一路流进行操作的流Id isMute: true为禁用，false为启用
   * @returns {Promise} - 改变音频的禁用与开启后的promise 回调
   */
  muteAudio(options = {}) {
    return new Promise((resolve, reject) => {
      const params = {
        streamId: options.streamId,
        isMute: options.isMute
      }
      this.instance.muteAudio(params)
        .then(data => {
          resolve(data)
        }).catch(error => {
          reject(error)
        })
    })
  }
  /**
   * 开启旁路
   * @param {Object} options --  layout: 旁路布局  profile: 旁路直播视频质量参数 paneAspectRatio:旁路混流窗格指定高宽比 border: 旁路边框属性
   * @returns {Promise} - 开启旁路后的promise回调
   */
  startBroadCast(options = {}, addConfig = {}) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        layout: options.layout || VhallRTC.CANVAS_ADAPTIVE_LAYOUT_GRID_MODE, // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
        profile: options.profile || VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1, // 旁路直播视频质量参数
        paneAspectRatio: VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9, //旁路混流窗格指定高宽比。  v2.3.2及以上
        border: options.border || {
          // 旁路边框属性
          width: 2,
          color: '0x666666'
        }
      }
      // 如果有 adaptiveLayoutMode 就不传 layout
      if (options.adaptiveLayoutMode !== undefined || options.adaptiveLayoutMode !== null) {
        delete defaultOptions.layout
        defaultOptions.adaptiveLayoutMode = options.adaptiveLayoutMode
      }
      const params = merge.recursive({}, defaultOptions, addConfig)
      this.instance.startBroadCast(params)
        .then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  }
  /**
   * 停止旁路
   * @returns {Promise} - 停止旁路后的promise回调
   */
  stopBroadCast() {
    return new Promise((resolve, reject) => {
      this.instance.stopBroadCast()
        .then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 动态配置指定旁路布局模板
   * @param {Object} options --  layout: 指定旁路布局模板
   * @returns {Promise} - 动态配置指定旁路布局模板的promise回调
   */
  setBroadCastLayout(options = {}) {
    return new Promise((resolve, reject) => {
      this.instance.setBroadCastLayout({
        layout: options.layout
      })
        .then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 配置旁路布局自适应模式
   * @param {Object} options --  layout: 指定旁路布局模板
   * @returns {Promise} - 配置旁路布局自适应模式的promise回调
   */
  setBroadCastAdaptiveLayoutMode(options = {}) {
    return new Promise((resolve, reject) => {
      this.instance.setBroadCastAdaptiveLayoutMode({
        adaptiveLayoutMode: options.adaptiveLayoutMode || VhallRTC.CANVAS_ADAPTIVE_LAYOUT_GRID_MODE
      })
        .then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  }
  /**
   * 动态配置旁路主屏
   * @param {String} mainScreenStreamId -- 将哪路流设置成主屏的流Id
   * @returns {Promise} - 动态配置旁路主屏的promise回调
   */
  setBroadCastScreen(mainScreenStreamId = '') {
    return new Promise((resolve, reject) => {
      this.instance.setBroadCastScreen({ mainScreenStreamId })
        .then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  }
  /**
   * 获取全部音视频列表
   * @returns {Promise} - 获取全部音视频列表的promise回调
   */
  getDevices() {
    return new Promise((resolve, reject) => {
      this.instance.getDevices()
        .then((devices) => {
          resolve(devices)
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 获取摄像头列表
   * @returns {Promise} - 获取摄像头列表的promise回调
   */
  getCameras() {
    return new Promise((resolve, reject) => {
      this.instance.getCameras()
        .then((devices) => {
          resolve(devices)
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 获取麦克风列表
   * @returns {Promise} - 获取麦克风列表的promise回调
   */
  getMicrophones() {
    return new Promise((resolve, reject) => {
      this.instance.getMicrophones()
        .then((devices) => {
          resolve(devices)
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 获取扬声器列表
   * @returns {Promise} - 获取扬声器列表的promise回调
   */
  getSpeakers() {
    return new Promise((resolve, reject) => {
      this.instance.getSpeakers()
        .then((devices) => {
          resolve(devices)
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 获取设备的分辨率
   * @param {String} deviceId -- 摄像头设备的Id
   * @returns {Promise} - 分辨率获取之后的promise回调
   */
  getVideoConstraints(deviceId) {
    return new Promise((resolve, reject) => {
      this.instance.getVideoConstraints({ deviceId },
        (data) => {
          resolve(data)
        }, (error) => {
          reject(error)
        })
    })
  }
  /**
   * 配置本地流视频质量参数
   * @param {Object} options --  streamId: 切换本地流Id profile: 必填，互动视频质量参数
   * @returns {Promise} - 配置本地流视频质量参数的promise回调
   */
  setVideoProfile(options = {}) {
    return new Promise((resolve, reject) => {
      this.instance.setVideoProfile({
        streamId: options.streamId,
        profile: options.profile
      },
        (data) => {
          resolve(data)
        }, (error) => {
          reject(error)
        })
    })
  }
  /**
   * 获取房间流信息
   * @param {Object} options --  streamId: 切换本地流Id profile: 必填，互动视频质量参数
   * @returns {Promise} - 配置本地流视频质量参数的promise回调
   */
  getRoomStreams(options = {}) {
    return this.instance.getRoomStreams()
  }

  /**
   * 获取房间总的信息
   * @param {Object} options --  streamId: 切换本地流Id profile: 必填，互动视频质量参数
   * @returns {Promise} - 配置本地流视频质量参数的promise回调
   */
  getRoomInfo(options = {}) {
    return this.instance.getRoomInfo()
  }
  /**
   * 是否支持桌面共享
   * @returns Boolean
   */
  isScreenShareSupported() {
    return this.instance.isScreenShareSupported()
  }

  /**
   * 检查当前浏览器支持性
   * @returns Boolean
   */
  checkSystemRequirements() {
    return this.instance.checkSystemRequirements()
  }

  /**
   * 获取上下行丢包率
   * @returns  data中有 upLossRate 上行丢包率   downLossRate 下行丢包率
   */
  getPacketLossRate() {
    return new Promise((resolve, reject) => {
      this.instance.getPacketLossRate()
        .then((data) => {
          resolve(data)
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 获取流上下行丢包率
   * @returns  data中有 
   */
  getStreamPacketLoss(options = {}) {
    return new Promise((resolve, reject) => {
      this.instance.getStreamPacketLoss(options)
        .then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 获取流音频能量
   * @returns  
   */
  getAudioLevel(streamId = '') {
    return new Promise((resolve, reject) => {
      this.instance.getAudioLevel({ streamId })
        .then((data) => {
          resolve(data)
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 获取流的mute状态
   * @returns  
   */
  getStreamMute(streamId = '') {
    return new Promise((resolve, reject) => {
      this.instance.getStreamMute({ streamId })
        .then((data) => {
          resolve(data)
        }).catch(error => {
          reject(error)
        })
    })
  }

  /**
   * 获取当前流信息的方法
   * @returns  array
   */
  currentStreams() {
    return this.currentStreams
  }
}