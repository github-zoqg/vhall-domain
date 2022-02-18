import VhallPaasSDK from '@/sdk/index';
import { merge } from '../../utils';
import useInteractiveServer from './interactive.server';
import roomBaseRequest from '@/request/roomBase';
import useRoomBaseServer from '../room/roombase.server';

class MediaSettingServer {
  constructor() {
    if (typeof MediaSettingServer.instance === 'object') {
      return MediaSettingServer.instance;
    }
    this.state = {
      selectedVideoDeviceId: '', // 当前选取的设备id
      videoPreivewStreamId: '', // 当前[流ID]
      canvasImgUrl: '//cnstatic01.e.vhall.com/common-static/middle/images/canvasDefault.png', // 当前图片流url
      rate: '', // 当前画质
      screenRate: '', //当前桌面共享画质
      videoType: 'camera', // 当前视频类型 camera||picture
      layout: 'CANVAS_ADAPTIVE_LAYOUT_FLOAT_MODE', // 当前选择的布局(默认主次浮窗)
      video: '', // 当前选择的摄像头或图片等[设备ID]
      audioInput: '', // 当前选择的麦克风[设备ID]
      audioOutput: '', // 当前选择的扬声器[设备ID]
      devices: {
        videoInputDevices: [], //视频采集设备，如摄像头
        audioInputDevices: [], //音频采集设备，如麦克风
        audioOutputDevices: [] //音频输出设备，如扬声器
      },
      isBrowserNotSupport: false // 当前浏览器是否支持互动sdk
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
      selectedVideoDeviceId: '', // 当前选取的设备id
      videoPreivewStreamId: '', // 当前[流ID]
      canvasImgUrl: '', // 当前图片流url
      rate: '', // 当前画质
      screenRate: '', //当前桌面共享画质
      videoType: 'camera', // 当前视频类型 camera||picture
      layout: 'CANVAS_ADAPTIVE_LAYOUT_FLOAT_MODE', // 当前选择的布局(默认主次浮窗)
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
      VhallPaasSDK.modules.VhallRTC.startPreview(
        options,
        event => {
          this.state.videoPreivewStreamId = event.streamId;
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
  stopVideoPreview(streamId = this.state.videoPreivewStreamId) {
    return new Promise((resolve, reject) => {
      VhallPaasSDK.modules.VhallRTC.stopPreview({ streamId }, resolve, reject);
    }).then(() => {
      this.state.videoPreivewStreamId = null;
    });
  }

  setSession(saveMap) {
    for (const [key, value] of saveMap) {
      sessionStorage.setItem(key, value);
    }
  }

  async setStream(params = {}) {
    return roomBaseRequest.setStream(params);
  }
}

export default function useMediaSettingServer() {
  if (!useMediaSettingServer.instance) {
    useMediaSettingServer.instance = new MediaSettingServer();
  }

  return useMediaSettingServer.instance;
}
