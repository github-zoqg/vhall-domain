import { insertFile } from '../../request/index.js';
import { uploadFile, isChrome88 } from '@/utils/index.js';
import useRoomBaseServer from '../room/roombase.server';
import BaseServer from '../common/base.server.js';
import useInteractiveServer from './interactive.server.js';

class InsertFileServer extends BaseServer {
  constructor() {
    super();
    if (typeof InsertFileServer.instance === 'object') {
      return InsertFileServer.instance;
    }

    this.state = {
      localInsertStream: null,
      isChrome88: isChrome88()
    };
    InsertFileServer.instance = this;
    return this;
  }

  // 注册监听事件
  _addListeners(cb) {
    const interactiveServer = useInteractiveServer();
    interactiveServer.$on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_ADD, e => {
      e.data.attributes = JSON.parse(e.data.attributes);
      if (e.data.attributes.stream_type == 4 || e.data.streamType == 4) {
        this.$emit('INSERT_FILE_STREAM_ADD', e);
      }
    });
    interactiveServer.$on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_REMOVED, e => {
      e.data.attributes = JSON.parse(e.data.attributes);
      if (e.data.attributes.stream_type == 4 || e.data.streamType == 4) {
        this.$emit('INSERT_FILE_STREAM_REMOVE', e);
      }
    });
    interactiveServer.$on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_FAILED, e => {
      e.data.attributes = JSON.parse(e.data.attributes);
      if (e.data.attributes.stream_type == 4 || e.data.streamType == 4) {
        this.$emit('INSERT_FILE_STREAM_FAILED', e);
      }
    });
  }

  // 注册插播流删除事件
  // onInsertFileStreamDelete(cb) {
  //   const interactiveServer = useInteractiveServer();
  //   interactiveServer.on('interactive_REMOTESTREAM_REMOVED', e => {
  //     cb(e);
  //   });
  // }

  // 插播流订阅失败
  // onInsertFileStreamFaild(cb) {
  //   const interactiveServer = useInteractiveServer();
  //   interactiveServer.on('interactive_REMOTESTREAM_FAILED', e => {
  //     cb(e);
  //   });
  // }

  // 获取插播列表
  getInsertFileList(params = {}) {
    return insertFile.getInsertFileList(params);
  }

  // 删除插播文件
  deleteInsertFile(params = {}) {
    return insertFile.deleteInsertFile(params);
  }

  // 检查captureStream是否能用
  isCanUseCaptureStream() {
    const v = document.createElement('video');
    if (typeof v.captureStream !== 'function') {
      return false;
    }
    return true;
  }

  // 选择音视频文件
  selectLocalFile(onChange = e => {}) {
    const { watchInitData } = useRoomBaseServer().state;
    let accept = 'video/mp4,video/webm,audio/ogg';
    if (watchInitData.webinar.mode == 1) {
      // 直播模式：1-音频、2-视频、3-互动
      accept = 'audio/ogg';
    }

    const retParams = {
      accept
    };

    uploadFile(retParams, onChange);
  }

  // 创建video标签播放本地音视频文件
  createLocalVideoElement(file, options = {}) {
    return new Promise((resolve, reject) => {
      this.state._isAudio = file.type.includes('ogg');
      const videoElement = document.createElement('video');
      this.state._videoElement = videoElement;
      videoElement.setAttribute('width', '100%');
      videoElement.setAttribute('height', '100%');
      const windowURL = window.URL || window.webkitURL;
      const fileUrl = windowURL.createObjectURL(file);
      videoElement.src = fileUrl;
      videoElement.onload = () => {
        windowURL.revokeObjectURL(fileUrl);
      };
      const videoContainerElement = document.getElementById(options.el);
      videoContainerElement.innerHTML = '';
      videoContainerElement.appendChild(videoElement);
      videoElement.addEventListener('canplay', e => {
        setTimeout(() => {
          console.log(
            videoElement.videoHeight,
            videoElement.videoWidth,
            '分辨率',
            videoElement.videoHeight > 720 || videoElement.videoWidth > 1280
          );
          if (videoElement.videoHeight > 720 || videoElement.videoWidth > 1281) {
            reject({ msg: '视频分辨率过高，请打开分辨率为1280*720以下的视频' });
          } else {
            resolve(videoElement);
          }
        }, 100);
      });
    });
  }

  // 使用canvas抓流
  captureStreamByCanvas() {
    //先做检测，存在没有video引用的情况
    if (!this.state._videoElement) {
      this.state._videoElement = document.createElement('video');
      this.state._videoElement.setAttribute('width', '100%');
      this.state._videoElement.setAttribute('height', '100%');
    }

    const videoElement = this.state._videoElement;
    const chrome88Canvas = document.createElement('canvas');
    const chrome88canvasContext = chrome88Canvas.getContext('2d');

    // 将video播放器的画面绘制至canvas上
    this.state._canvasInterval && clearInterval(this.state._canvasInterval);
    function drawVideoCanvas() {
      chrome88canvasContext.drawImage(
        videoElement,
        0,
        0,
        chrome88Canvas.width,
        chrome88Canvas.height
      );
    }
    chrome88Canvas.width = videoElement.videoWidth;
    chrome88Canvas.height = videoElement.videoHeight;
    drawVideoCanvas();
    this.state._canvasInterval = setInterval(drawVideoCanvas, 40);

    // 从canvas中抓取MediaStream
    const canvasStream = chrome88Canvas.captureStream();
    // 从video播放器中抓取MediaStream
    const vodCpatureStream = videoElement.captureStream();
    // audio track 从[video播放器抓取MediaStream对象]中获取
    const audioTrack = vodCpatureStream.getAudioTracks()[0];
    // video track 从[canvas抓取MediaStream对象]中获取
    const videoTrack = canvasStream.getVideoTracks()[0];
    return { audioTrack, videoTrack };
  }

  // 使用videoElement抓流
  captureStreamByVideo() {
    let videoStream;
    const videoElement = this.state._videoElement;
    if (videoElement.captureStream) {
      videoStream = videoElement.captureStream();
      if (!videoStream) {
        return false;
      }
      if (videoStream.getTracks().length < 1) {
        return false;
      }
      return videoStream;
    }
  }

  // 抓取本地音视频轨道
  captureLocalStream() {
    if (this.state.isChrome88 && !this.state._isAudio) {
      return this.captureStreamByCanvas();
    } else {
      return this.captureStreamByVideo();
    }
  }

  // 创建本地插播流
  createLocalInsertStream(options = {}) {
    const retSteram = this.captureLocalStream();
    const { watchInitData } = useRoomBaseServer().state;
    let retOptions = {
      videoNode: options.videoNode, // 传入本地互动流的显示容器，必填
      audio: false,
      video: false,
      profile: VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 默认1080p，后续sdk会做优化，自动识别视频清晰度
      attributes: JSON.stringify({
        role: watchInitData.join_info.role_name,
        nickname: watchInitData.join_info.nickname,
        stream_type: 4,
        has_video: this.state._isAudio ? 0 : 1
      }),
      streamType: 4
    };

    if (this.state.isChrome88 && !this.state._isAudio) {
      retOptions = {
        ...retOptions,
        audioTrack: retSteram.audioTrack, // 音频轨道
        videoTrack: retSteram.videoTrack // 视频轨道
      };
    } else {
      retOptions = {
        ...retOptions,
        mixOption: {
          // 选填，指定此本地流的音频和视频是否加入旁路混流。支持版本：2.3.2及以上。
          mixVideo: this.state._isAudio ? false : true, // 视频是否加入旁路混流
          mixAudio: true // 音频是否加入旁路混流
        },
        hasInsertedStream: true, // 使用外部插入的MediaStream流对象
        insertedStream: retSteram // 在上一步已抓取的MediaStream流对象
      };
    }

    const interactiveServer = useInteractiveServer();
    return interactiveServer.createLocalStream(retOptions);
  }

  // 推插播流
  publishInsertStream(stream) {
    const interactiveServer = useInteractiveServer();
    return new Promise((resolve, reject) => {
      interactiveServer
        .publishStream({ streamId: stream.streamId })
        .then(res => {
          this.state._LoclaStreamId = res.streamId;
          resolve(res);
        })
        .catch(reject);
    });
  }

  // 停止推流
  stopPublishInsertStream(streamId) {
    return new Promise((resolve, reject) => {
      const interactiveServer = useInteractiveServer();
      console.log('stopPublishInsertStream', streamId);
      interactiveServer
        .unpublishStream(streamId || this._LoclaStreamId)
        .then(res => {
          this.state._LoclaStreamId = null;
          resolve(res);
        })
        .catch(reject);
    });
  }

  // 订阅插播流
  subscribeInsertStream(options = {}) {
    const interactiveServer = useInteractiveServer();
    return interactiveServer.subscribeStream(options);
  }

  // 取消订阅流
  unsubscribeInsertStream(options = {}) {
    const interactiveServer = useInteractiveServer();
    return interactiveServer.unSubscribeStream(options);
  }

  // 设置已经存在的videoElement
  setExistVideoElement(videoElement) {
    this.state._videoElement = videoElement;
    this.state._isAudio = videoElement.isAudio;
  }
}

export default function useInsertFileServer() {
  return new InsertFileServer();
}
