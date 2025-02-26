import VhallPaasSDK from '@/sdk/index';
import { merge } from '../../utils';
import useInteractiveServer from './interactive.server';
import useRoomBaseServer from '../room/roombase.server';
import { meeting } from '@/request/index.js';

class MediaCheckServer {
  constructor() {
    if (typeof MediaCheckServer.instance === 'object') {
      return MediaCheckServer.instance;
    }
    this.state = {
      deviceInfo: {
        device_status: 0, // 0未检测 1可以上麦 2不可以上麦
        device_type: 0
      },
      localStreamId: '', // 本地流id
      devices: {
        videoInputDevices: [], //视频采集设备，如摄像头
        audioInputDevices: [], //音频采集设备，如麦克风
        audioOutputDevices: [] //音频输出设备，如扬声器
      },
      isBrowserNotSupport: false // 浏览器是否支持互动sdk
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
  async checkSystemRequirements() {
    return VhallPaasSDK.modules.VhallRTC.checkSystemRequirements().then(checkResult => {
      this.state.checkSystemResult = checkResult;
      if (!checkResult.result) {
        if (this.state.deviceInfo.device_status != 2) {
          this.setDevice({ status: 2 });
        }
        this.state.isBrowserNotSupport = true;
      }
      return checkResult;
    });
  }

  /**
   * 根据选中的设备来调用getUserMedia方法
   * @returns getUserMedia()
   */
  async getUserMediaWithSelectedDevices() {
    function getConstraints() {
      let constraints = {
        audio: true, video: {
          width: 1920, height: 1080,
        }
      }
      const selectedVideoDeviceId = localStorage.getItem('media-check.selected.video')
      const selectedAudioDeviceId = localStorage.getItem('media-check.selected.audioInput')
      if (selectedVideoDeviceId) {
        constraints.video = {
          deviceId: selectedVideoDeviceId,
          width: 1920,
          height: 1080
        };
      }
      if (selectedAudioDeviceId) constraints.audio = { deviceId: selectedAudioDeviceId };
      return constraints
    }

    const constraints = getConstraints()
    return navigator.mediaDevices.getUserMedia(constraints)
  }

  // 获取用户媒体输入许可
  async getMediaInputPermission(options = { isNeedBroadcast: true }) {
    console.log('%c [mediaCheck] ', 'color: pink', navigator.mediaDevices)
    if (navigator.mediaDevices) {
      return this.getUserMediaWithSelectedDevices()
        .then(async stream => {
          const device_type = options.device_type ? options.device_type : this.isMobileDevice() ? 1 : 2
          // TODO: 根据参数判断是否发消息同步状态
          await this.setDevice({ status: 1, type: device_type, send_msg: Number(options.isNeedBroadcast) });
          stream.getTracks().forEach(trackInput => {
            // 增加异步停止track stop       进行尝试解决 ID1004170 问题
            setTimeout(() => {
              trackInput.stop();
            })
          });
          return Promise.resolve(true)
        })
        .catch(async (err) => {
          // TODO: 根据参数判断是否发消息同步状态
          console.log('%c [mediaCheck] 获取权限失败:', 'color: pink', err)
          await this.setDevice({ status: 2, send_msg: Number(options.isNeedBroadcast) });
          return Promise.resolve(false)
        });
    } else {
      await this.checkSystemRequirements()
    }
    return Promise.resolve(false);
  }

  // 设置设备检测状态
  setDevice(data = {}) {
    return new Promise(resolve => {
      this.state.deviceInfo.device_status = data.status;
      // 更新当前用户设备信息
      this.state.deviceInfo.device_type = this.isMobileDevice() ? 1 : 2
      const { watchInitData } = useRoomBaseServer().state;
      const defaultParams = {
        room_id: watchInitData.interact.room_id,
        status: 1,
        type: this.isMobileDevice() ? 1 : 2
      };
      const retParams = merge.recursive({}, defaultParams, data);
      return meeting.setDevice(retParams).then(res => {
        resolve(res)
        return res;
      });
    })
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

  setSession(saveMap) {
    for (const [key, value] of saveMap) {
      sessionStorage.setItem(key, value);
    }
  }
}

export default function useMediaCheckServer() {
  return new MediaCheckServer();
}
