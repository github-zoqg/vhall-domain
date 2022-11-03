import VhallPaasSDK from '@/sdk/index';
import { merge, renderHTML } from '../../utils';
import useInteractiveServer from './interactive.server';
import { roomApi } from '@/request/index.js';
import useRoomBaseServer from '../room/roombase.server';
import axios from 'axios/dist/axios';
class MediaSettingServer {
  constructor() {
    if (typeof MediaSettingServer.instance === 'object') {
      return MediaSettingServer.instance;
    }
    this.state = {
      videoPreviewStreamId: '', // 当前[流ID]
      canvasImgUrl: '//cnstatic01.e.vhall.com/common-static/middle/images/canvasDefault.png', // 当前图片流url
      rate: '', // 当前画质
      screenRate: '', //当前桌面共享画质
      videoHint: '',  //插播文件视频质量优先项
      videoType: 'camera', // 当前视频类型 camera||picture
      layout: 'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE', // 当前选择的布局(默认主次浮窗)
      video: '', // 当前选择的摄像头或图片等[设备ID]
      audioInput: '', // 当前选择的麦克风[设备ID]
      audioOutput: '', // 当前选择的扬声器[设备ID]
      devices: {
        videoInputDevices: [], //视频采集设备，如摄像头
        audioInputDevices: [], //音频采集设备，如麦克风
        audioOutputDevices: [] //音频输出设备，如扬声器
      },
      isBrowserNotSupport: false, // 当前浏览器是否支持互动sdk,
      isVideoCreating: false, // 正在创建video流
      isVideoError: false, // video读取错误
      isVideoSwitching: false // video正在切换
    };
    MediaSettingServer.instance = this;
    return this;
  }

  reset() {
    this.state = this.resetState();
  }

  init() {
    const canvasObjStr = localStorage.getItem(
      `saveCanvasObj_${useRoomBaseServer().state.watchInitData.webinar.id}`
    );
    const canvasObj = canvasObjStr && JSON.parse(canvasObjStr);

    if (canvasObj) {
      this.state.videoType = canvasObj.flag ? 'picture' : 'camera';
      this.state.canvasImgUrl = canvasObj.streamUrl || this.state.canvasImgUrl;
    }
  }

  resetState() {
    this.state = {
      videoPreviewStreamId: '', // 当前[流ID]
      canvasImgUrl: '//cnstatic01.e.vhall.com/common-static/middle/images/canvasDefault.png', // 当前图片流url
      rate: '', // 当前画质
      screenRate: '', //当前桌面共享画质
      videoType: 'camera', // 当前视频类型 camera||picture
      layout: 'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE', // 当前选择的布局(默认主次浮窗)
      video: '', // 当前选择的摄像头或图片等[设备ID]
      audioInput: '', // 当前选择的麦克风[设备ID]
      audioOutput: '', // 当前选择的扬声器[设备ID]
      devices: {
        videoInputDevices: [], //视频采集设备，如摄像头
        audioInputDevices: [], //音频采集设备，如麦克风
        audioOutputDevices: [] //音频输出设备，如扬声器
      }
    };
  }


  setState(key, value) {
    this.state[key] = value;
  }

  /**
   * 修改本地采集源
   *
   * @function modifyState
   * @param {String} collectionSourceType 采集源 取值范围 [camera，picture]
   */
  modifyVideoType(collectionSourceType = 'camera') {
    this.state.videoType = collectionSourceType;
  }

  resetDevices() {
    this.state.devices = {
      videoInputDevices: [], //视频采集设备，如摄像头
      audioInputDevices: [], //音频采集设备，如麦克风
      audioOutputDevices: [] //音频输出设备，如扬声器
    };
  }

  // 检查当前浏览器支持性
  checkSystemRequirements() {
    return VhallPaasSDK.modules.VhallRTC.checkSystemRequirements().then(checkResult => {
      this.state.checkSystemResult = checkResult;
      if (!checkResult.result) {
        this.state.isBrowserNotSupport = true;
      }
      return checkResult;
    });
  }

  /**
   * 获取当前操作系统信息
   * @returns {Object} osName: 操作系统类型  osVersion: 操作系统版本
   */
  getOS() {
    this.state.OSInfo = VhallPaasSDK.modules.VhallRTC.getOS();
    return this.state.OSInfo;
  }

  // 获取当前浏览器是否为移动端
  isMobileDevice() {
    this.state.isMobile = VhallPaasSDK.modules.VhallRTC.isMobileDevice();
    return this.state.isMobile;
  }

  /**
   * 获取浏览器是否支持美颜
   * @returns {Boolean}
   */
  isBeautySupported() {
    this.state.isBeautySupported = VhallPaasSDK.modules.VhallRTC.isBeautySupported();
    return this.state.isBeautySupported;
  }

  // 获取当前浏览器信息
  getBrowserInfo() {
    this.state.browserInfo = VhallPaasSDK.modules.VhallRTC.getBrowserInfo();
    return this.state.browserInfo;
  }

  /**
   * 获取全部音视频设备列表
   * @returns {Promise}
   */
  async getDevices(customOptions = {}) {
    return VhallPaasSDK.modules.VhallRTC.getDevices(customOptions).then(devices => {
      this.state.devices = devices;
      return devices;
    });
  }

  /**
   * 获取摄像头设备列表
   * @returns {Promise}
   */
  getCameras(filterFn = item => item) {
    return VhallPaasSDK.modules.VhallRTC.getCameras().then(mediaDeviceList => {
      const filterMediaDevice = mediaDeviceList.filter(filterFn);
      this.state.devices.videoInputDevices = filterMediaDevice;
      return filterMediaDevice;
    });
  }

  /**
   * 获取麦克风设备列表
   * @returns {Promise}
   */
  getMicrophones(filterFn = item => item) {
    return VhallPaasSDK.modules.VhallRTC.getMicrophones().then(mediaDeviceList => {
      const filterMediaDeviceList = mediaDeviceList.filter(filterFn);
      this.state.devices.audioInputDevices = filterMediaDeviceList;
      return filterMediaDeviceList;
    });
  }

  /**
   * 获取扬声器设备列表
   * @returns {Promise}
   */
  getSpeakers(filterFn = item => item) {
    return VhallPaasSDK.modules.VhallRTC.getSpeakers().then(mediaDeviceList => {
      const filterMediaDeviceList = mediaDeviceList.filter(filterFn);
      this.state.devices.audioOutputDevices = filterMediaDeviceList;
      return filterMediaDeviceList;
    });
  }

  /**
   * 获取视频设备支持分辨率列表
   * @param {String} deviceId
   * @returns {Promise}
   */
  getVideoConstraints(deviceId) {
    const interactiveInstance = useInteractiveServer();
    return new Promise((resolve, reject) => {
      interactiveInstance.getVideoConstraints(deviceId, resolve, reject);
    });
  }

  /**
   * 获取本地麦克风列表
   *
   * @async
   * @function getMicrophonesList
   * @return {Promise<Array>} 返回可枚举的设备数组
   */
  getMicrophonesList() {
    return this.getMicrophones(
      d => d.deviceId !== 'default' && d.deviceId !== 'communications' && d.label
    )
  }

  /**
   * 获取本地扬声器列表
   *
   * @async
   * @function getSpeakersList
   * @return {Promise<Array>} 返回可枚举的设备数组
   */
  getSpeakersList() {
    return this.getSpeakers(item => item.label)
  }

  /**
   * 获取本地摄像头列表
   *
   * @async
   * @function getCameraList
   * @return {Promise<Array>} 返回可枚举的设备数组
   */
  getCameraList() {
    return this.getCameras(item => item.label && item.deviceId !== 'desktopScreen')
  }


  /**
   * 本地图片上传
   * @param {Object} event Dom级别对象
   * @param {Object} options 基础配置，可参见文档：...
   * @returns {Promise<Object>} 返回上传后的基础信息
   */
  imageUpload(event, options) {

    let file = event.target.files[0]
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (isJPG && isLt2M) {

      // 设置请求参数
      let param = new FormData()
      param.append('resfile', file, file.name)
      param.append('path', options.path);
      param.append('type', 'image');
      param.append('interact_token', options.interact_token);

      // 设置请求头
      let config = {
        headers: {
          'Content-Type': 'multipart/form-data;',
          platform: options.platform
        }
      }

      return axios.post(options.imageUploadAddress, param, config)

    } else {
      // 触发消息 图片格式错误或大小超出限制

      console.log('图片格式错误或大小超出限制');
      return Promise.resolve({
        data: {
          code: 20001,
          msg: '图片格式错误或大小超出限制'
        }
      })

    }

  }


  /**
   * 创建本地视频流预览实例
   *
   * @function createALocalPreviewInstance
   * @param {Object} options 配置参数
   */
  async createALocalPreviewInstance(options = {}) {
    if (this.isVideoCreating) return; // 创建中则不重复创建，以免多次调用
    if (this.state.videoType !== 'camera') return;
    if (options.video === '') return;

    this.isVideoCreating = true;

    await this.destroyStream();

    // document.getElementById(options.videoNode).innerHTML = '';
    renderHTML(document.getElementById(options.videoNode))
    try {
      this.isVideoError = false;
      this.isVideoSwitching = true;
      await this.startVideoPreview(options);
      this.isVideoSwitching = false;
      this.isVideoCreating = false;
    } catch (err) {
      this.isVideoSwitching = false;
      this.isVideoError = true;
      this.isVideoCreating = false;
    }
  }

  /**
   * 销毁本地预览流
   *
   * @async
   * @function getCameraList
   * @return {Promise<Boolean>} 返回销毁后的状态
   */
  async destroyStream() {

    try {
      return this.stopVideoPreview().catch(err => {
        // 对接上报
        console.error(`...`, err);
      });
    } catch (err) {
      // 对接上报
      console.error(`销毁流异常`, err);
    }

    return true;
  }

  /**
   * 开始视频预览
   * @param {Object} customOptions
   * @returns {Promise}
   */
  startVideoPreview(customOptions = {}) {
    const defaultOptions = {
      videoNode: '', // 传入本地视频显示容器，必填
      audio: false, // 是否获取音频，选填，默认为true
      videoDevice: this.state.video,
      profile: VhallRTC.RTC_VIDEO_PROFILE_240P_16x9_M
    };
    const options = merge.recursive({}, defaultOptions, customOptions);
    return new Promise((resolve, reject) => {
      VhallPaasSDK.modules.VhallRTC.vhallrtc.createStream(
        options,
        event => {
          console.log('创建视频流')
          this.state.videoPreviewStreamId = event.streamId;
          this.state.videoPreviewStream = event.stream;
          resolve(event);
        },
        reject
      );
    });
  }

  /**
   * 设置预览视频的美颜等级
   * @param {Number} level 0-1 共十级
   * @returns {Promise}
   */
  setPreviewBeautyLevel(level) {
    return this.state.videoPreviewStream.setBeautyLevel(level);
  }

  /**
   * 结束视频预览
   * @returns {Promise}
   */
  stopVideoPreview(streamId = this.state.videoPreviewStreamId) {
    if (!streamId) {
      return Promise.resolve('预览视频流不存在');
    }
    return new Promise((resolve, reject) => {
      VhallPaasSDK.modules.VhallRTC.vhallrtc.destroyStream({ streamId }, resolve, reject);
    }).then(() => {
      console.log('销毁视频流')
      this.state.videoPreviewStreamId = null;
    });
  }

  setSession(saveMap) {
    for (const [key, value] of saveMap) {
      sessionStorage.setItem(key, value);
    }
  }

  async setStream(params = {}) {
    return roomApi.base.setStream(params);
  }

  // 推流过程中动态切换视频清晰或流畅模式
  // opt = {
  //   streamId:'xxx', //必填
  //   hint：'detail', //必填
  //   }
  setVideoContentHint(opt) {
    console.log(opt, 'setVideoContentHint')
    return VhallPaasSDK.modules.VhallRTC.vhallrtc.setVideoContentHint(opt).then(() => {
      console.log('切换成功')
    }).catch(() => {
      console.log('切换失败')
    });
  }
}

export default function useMediaSettingServer() {
  if (!useMediaSettingServer.instance) {
    useMediaSettingServer.instance = new MediaSettingServer();
  }

  return useMediaSettingServer.instance;
}
