import VhallPaasSDK from '@/sdk/index';
import { merge } from '../../utils';
import useDocServer from '../doc/doc.server';
import useInteractiveServer from './interactive.server';
class MediaCheckServer {
  constructor() {
    if (typeof MediaCheckServer.instance === 'object') {
      return MediaCheckServer.instance;
    }
    this.state = {
      selectedVideoDeviceId: '', // 当前选取的设备id
      localStreamId: '', // 本地流id
      devices: {
        videoInputDevices: [], //视频采集设备，如摄像头
        audioInputDevices: [], //音频采集设备，如麦克风
        audioOutputDevices: [] //音频输出设备，如扬声器
      }
    };
    MediaCheckServer.instance = this;
    return this;
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
  getDevices(customOptions = {}) {
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

  // 选中设备
  setSelectedVideoDeviceId(selectedVideoDeviceId) {
    this.state.selectedVideoDeviceId = selectedVideoDeviceId;
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
      videoDevice: this.state.selectedVideoDeviceId,
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
  stopVideoPreview() {
    return new Promise((resolve, reject) => {
      VhallPaasSDK.modules.VhallRTC.stopPreview(
        { streamId: this.state.videoPreivewStreamId },
        resolve,
        reject
      );
    });
  }
}

export default function useMediaServer() {
  if (!useMediaServer.instance) {
    useMediaServer.instance = new MediaCheckServer();
  }

  return useMediaServer.instance;
}
