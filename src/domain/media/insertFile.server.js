import requestApi from '../../request/index.js';
import { uploadFile, isChrome88 } from '@/utils/index.js';
import contextServer from '@/domain/common/context.server.js';

function useInsertFileServer() {
  let state = {
    localInsertStream: null,
    isChrome88: isChrome88()
  };

  const interactiveServer = contextServer.get('interactiveServer');

  // 注册插播流加入事件
  function onInsertFileStreamAdd(cb) {
    interactiveServer.on('interactive_REMOTESTREAM_ADD', e => {
      e.data.attributes = JSON.parse(e.data.attributes);
      if (e.data.attributes.stream_type == 4 || e.data.streamType == 4) {
        cb(e);
      }
    });
  }

  // 注册插播流删除事件
  function onInsertFileStreamDelete(cb) {
    interactiveServer.on('interactive_REMOTESTREAM_REMOVED', e => {
      cb(e);
    });
  }

  // 插播流订阅失败
  function onInsertFileStreamFaild(cb) {
    interactiveServer.on('interactive_REMOTESTREAM_FAILED', e => {
      cb(e);
    });
  }

  // 获取插播列表
  function getInsertFileList(params = {}) {
    return requestApi.insertFile.getInsertFileList(params);
  }

  // 删除插播文件
  function deleteInsertFile(params = {}) {
    return requestApi.insertFile.deleteInsertFile(params);
  }

  // 检查captureStream是否能用
  function isCanUseCaptureStream() {
    const v = document.createElement('video');
    if (typeof v.captureStream !== 'function') {
      return false;
    }
    return true;
  }

  // 选择音视频文件
  function selectLocalFile(onChange = e => {}) {
    const { state: roomBaseState } = contextServer.get('roomBaseServer');

    let accept = 'video/mp4,video/webm,audio/ogg';
    if (roomBaseState.watchInitData.webinar.mode == 1) {
      // 直播模式：1-音频、2-视频、3-互动
      accept = 'audio/ogg';
    }

    const retParams = {
      accept
    };

    uploadFile(retParams, onChange);
  }

  // 创建video标签播放本地音视频文件
  function createLocalVideoElement(file, options = {}) {
    return new Promise((resolve, reject) => {
      state._isAudio = file.type.includes('ogg');
      const videoElement = document.createElement('video');
      state._videoElement = videoElement;
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
  function captureStreamByCanvas() {
    //先做检测，存在没有video引用的情况
    if (!state._videoElement) {
      state._videoElement = document.createElement('video');
      state._videoElement.setAttribute('width', '100%');
      state._videoElement.setAttribute('height', '100%');
    }

    const videoElement = state._videoElement;
    const chrome88Canvas = document.createElement('canvas');
    const chrome88canvasContext = chrome88Canvas.getContext('2d');

    // 将video播放器的画面绘制至canvas上
    state._canvasInterval && clearInterval(state._canvasInterval);
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
    state._canvasInterval = setInterval(drawVideoCanvas, 40);

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
  function captureStreamByVideo() {
    let videoStream;
    const videoElement = state._videoElement;
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
  function captureLocalStream() {
    if (state.isChrome88 && !state._isAudio) {
      return captureStreamByCanvas();
    } else {
      return captureStreamByVideo();
    }
  }

  // 创建本地插播流
  function createLocalInsertStream(options = {}) {
    const retSteram = captureLocalStream();
    const { state: roomBaseServerState } = contextServer.get('roomBaseServer');

    let retOptions = {
      videoNode: options.videoNode, // 传入本地互动流的显示容器，必填
      audio: false,
      video: false,
      profile: VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 默认1080p，后续sdk会做优化，自动识别视频清晰度
      attributes: JSON.stringify({
        role: roomBaseServerState.watchInitData.join_info.role_name,
        nickname: roomBaseServerState.watchInitData.join_info.nickname,
        stream_type: 4,
        has_video: state._isAudio ? 0 : 1
      }),
      streamType: 4
    };

    if (state.isChrome88 && !state._isAudio) {
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
          mixVideo: state._isAudio ? false : true, // 视频是否加入旁路混流
          mixAudio: true // 音频是否加入旁路混流
        },
        hasInsertedStream: true, // 使用外部插入的MediaStream流对象
        insertedStream: retSteram // 在上一步已抓取的MediaStream流对象
      };
    }

    const interactiveServer = contextServer.get('interactiveServer');
    console.log('interactiveServer', interactiveServer);
    return interactiveServer.createLocalStream(retOptions);
  }

  // 推插播流
  function publishInsertStream(stream) {
    const interactiveServer = contextServer.get('interactiveServer');
    return new Promise((resolve, reject) => {
      interactiveServer
        .publishStream({ streamId: stream.streamId })
        .then(res => {
          state._LoclaStreamId = res.streamId;
          resolve(res);
        })
        .catch(reject);
    });
  }

  // 停止推流
  function stopPublishInsertStream(streamId) {
    return new Promise((resolve, reject) => {
      const interactiveServer = contextServer.get('interactiveServer');
      console.log('stopPublishInsertStream', streamId);
      interactiveServer
        .unpublishStream(streamId || this._LoclaStreamId)
        .then(res => {
          state._LoclaStreamId = null;
          resolve(res);
        })
        .catch(reject);
    });
  }

  // 订阅插播流
  function subscribeInsertStream(options = {}) {
    const interactiveServer = contextServer.get('interactiveServer');
    return interactiveServer.subscribeStream(options);
  }

  // 取消订阅流
  function unsubscribeInsertStream(options = {}) {
    const interactiveServer = contextServer.get('interactiveServer');
    return interactiveServer.unSubscribeStream(options);
  }

  // 设置已经存在的videoElement
  function setExistVideoElement(videoElement) {
    state._videoElement = videoElement;
    state._isAudio = videoElement.isAudio;
  }

  return {
    state,
    getInsertFileList,
    deleteInsertFile,
    isCanUseCaptureStream,
    selectLocalFile,
    createLocalVideoElement,
    createLocalInsertStream,
    publishInsertStream,
    stopPublishInsertStream,
    subscribeInsertStream,
    unsubscribeInsertStream,
    onInsertFileStreamAdd,
    onInsertFileStreamDelete,
    onInsertFileStreamFaild,
    setExistVideoElement
  };
}

export default useInsertFileServer;
