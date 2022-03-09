import { insertFile } from '../../request/index.js';
import { uploadFile, isChrome88 } from '@/utils/index.js';
import { im as iMRequest } from '@/request/index.js';
import useRoomBaseServer from '../room/roombase.server';
import BaseServer from '../common/base.server.js';
import useMsgServer from '../common/msg.server'
import useInteractiveServer from './interactive.server.js';

class InsertFileServer extends BaseServer {
  constructor() {
    super();
    if (typeof InsertFileServer.instance === 'object') {
      return InsertFileServer.instance;
    }

    this.currentLocalInsertFile = null // file 对象或者是  insertFileListItem 对象
    this.insertVideoElement = null // 本地插播，当前正在播放的 videoELement
    this.state = {
      // 插播流信息
      insertStreamInfo: {
        streamId: '',
        userInfo: { // 推插播流的人的信息
          accountId: '',
          role: 1,
          nickname: '',
        },
        has_video: true // 是否音频插播
      },
      currentRemoteInsertFile: {}, // 远端插播文件信息
      insertFileType: 'local', // 插播类型 local本地插播 remote云插播(观看端不会关心这个状态)
      isInsertFilePushing: false, // 是否有人正在插播（可能不是当前用户）
      isChrome88: isChrome88()
    };
    InsertFileServer.instance = this;
    return this;
  }

  init() {
    this._addListeners()
  }

  // 注册监听事件
  _addListeners() {
    const interactiveServer = useInteractiveServer();
    const msgServer = useMsgServer()
    // 流加入
    interactiveServer.$on(VhallRTC.EVENT_REMOTESTREAM_ADD, e => {
      e.data.attributes = e.data.attributes && typeof e.data.attributes === 'string' ? JSON.parse(e.data.attributes) : e.data.attributes;
      if (e.data.attributes.stream_type == 4 || e.data.streamType == 4) { // 判断两种类型的 streamType 是为了兼容客户端
        this.getInsertFileStream()
        this.$emit('INSERT_FILE_STREAM_ADD', e);
      }
    });
    // 流删除
    interactiveServer.$on(VhallRTC.EVENT_REMOTESTREAM_REMOVED, e => {
      e.data.attributes = e.data.attributes && typeof e.data.attributes === 'string' ? JSON.parse(e.data.attributes) : e.data.attributes;
      if (e.data.attributes.stream_type == 4 || e.data.streamType == 4) {
        this.getInsertFileStream()
        this.$emit('INSERT_FILE_STREAM_REMOVE', e);
      }
    });
    interactiveServer.$on(VhallRTC.EVENT_REMOTESTREAM_FAILED, e => {
      e.data.attributes = e.data.attributes && typeof e.data.attributes === 'string' ? JSON.parse(e.data.attributes) : e.data.attributes;
      if (e.data.attributes.stream_type == 4 || e.data.streamType == 4) {
        this.$emit('INSERT_FILE_STREAM_FAILED', e);
      }
    });
    // msg消息监听
    msgServer.$onMsg('ROOM_MSG', msg => {
      switch (msg.data.type) {
        // 开始直播
        case 'live_start':
          this.$emit('live_start', msg);
          break;
        // 结束直播
        case 'live_over':
          this.$emit('live_over', msg)
      }
    })
  }


  // 设置当前本地插播文件
  setLocalInsertFile(file) {
    this.currentLocalInsertFile = file
  }

  // 设置云插播文件
  setRemoteInsertFile(file) {
    this.state.currentRemoteInsertFile = file
  }

  // 设置当前是否有在插播的状态
  setInsertFilePushing(status) {
    this.state.isInsertFilePushing = status
  }

  // 设置插播类型,local 本地插播   remote 云插播
  setInsertFileType(type) {
    this.state.insertFileType = type
  }

  // 设置远端流播放器videoElement
  setInsertVideoElement(videoElement) {
    this.insertVideoElement = videoElement
  }

  // 获取插播流信息
  getInsertFileStream() {
    const interactiveServer = useInteractiveServer()
    if (!interactiveServer.interactiveInstance) return
    const streamList = interactiveServer.getRoomStreams();
    const stream = streamList.find(stream => {
      if (stream.streamType === 4) {

        const retStream = {
          ...stream,
          attributes: stream.attributes ? JSON.parse(stream.attributes) : ''
        }

        this.state.insertStreamInfo.streamId = stream.streamId
        this.state.insertStreamInfo.userInfo = {
          accountId: retStream.accountId,
          role: retStream.role,
          nickname: retStream.nickname,

        }
        this.state.isInsertFilePushing = true
        this.state.insertStreamInfo.has_video = retStream.has_video // 是否音频插播

        return retStream
      }
    });
    if (!stream) {
      this.clearInsertFileInfo()
    }
    return stream;
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
  selectLocalFile(onChange = e => { }) {
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
      this.state.insertStreamInfo.has_video = !file.type.includes('ogg');
      const videoElement = document.createElement('video');
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
            '----本地插播video信息----',
            videoElement.videoHeight,
            videoElement.videoWidth,
            '分辨率',
            videoElement.videoHeight > 720 || videoElement.videoWidth > 1280
          );
          if (videoElement.videoHeight > 720 || videoElement.videoWidth > 1281) {
            reject({ msg: '视频分辨率过高，请打开分辨率为1280*720以下的视频' });
          } else {
            this.insertVideoElement = videoElement
            resolve(videoElement);
          }
        }, 100);
      });
    });
  }

  // 使用canvas抓流
  captureStreamByCanvas() {
    //先做检测，存在没有video引用的情况
    if (!this.insertVideoElement) {
      this.insertVideoElement = document.createElement('video');
      this.insertVideoElement.setAttribute('width', '100%');
      this.insertVideoElement.setAttribute('height', '100%');
    }

    const videoElement = this.insertVideoElement;
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
    const videoElement = this.insertVideoElement;
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
    if (this.state.isChrome88 && this.state.insertStreamInfo.has_video) {
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
        has_video: this.state.insertStreamInfo.has_video ? 1 : 0
      }),
      streamType: 4
    };

    if (this.state.isChrome88 && this.state.insertStreamInfo.has_video) {
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
          mixVideo: !this.state.insertStreamInfo.has_video ? false : true, // 视频是否加入旁路混流
          mixAudio: true // 音频是否加入旁路混流
        },
        hasInsertedStream: true, // 使用外部插入的MediaStream流对象
        insertedStream: retSteram // 在上一步已抓取的MediaStream流对象
      };
    }

    const interactiveServer = useInteractiveServer();
    return interactiveServer.createLocalStream(retOptions).then(data => {
      // 更新 insertStreamInfo 信息
      this.state.insertStreamInfo.streamId = data.streamId
      return data
    });
  }

  // 推插播流
  publishInsertStream(stream) {
    const interactiveServer = useInteractiveServer();
    return interactiveServer
      .publishStream({ streamId: stream.streamId })
      .then(res => {
        this.state.insertStreamInfo.streamId = res.streamId;
        return res
      })
  }

  // 停止推流
  stopPublishInsertStream(streamId) {
    const interactiveServer = useInteractiveServer();
    console.log('stopPublishInsertStream', streamId);
    return interactiveServer
      .unpublishStream({
        streamId: streamId || this.state.insertStreamInfo.streamId
      })
  }

  // 清空插播状态
  clearInsertFileInfo() {
    this.state.insertStreamInfo.streamId = null;
    this.state.isInsertFilePushing = false
    this.currentLocalInsertFile = null
    this.state.currentRemoteInsertFile = {}
  }

  /**
   * 插播开始、暂停发送自定义消息通知对端，更改、还原麦克风状态
   * @param {*} status 1 开始播放、关闭麦克风   2 暂停播放、还原麦克风
   */
  sendStateChangeMessage(status) {
    const { watchInitData } = useRoomBaseServer().state
    const _data = {
      room_id: watchInitData.interact.room_id,
      body: JSON.stringify({
        type: 'insert_file_status',
        status: status // 1：播放关闭麦克风  0：暂停打开麦克风（如果之前静音布处理）
      }),
      client: 'pc_browser'
    };
    return iMRequest.chat.sendCustomMessage(_data)
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
}

export default function useInsertFileServer() {
  return new InsertFileServer();
}
