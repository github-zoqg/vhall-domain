import useInteractiveServer from './interactive.server';
import useRoomBaseServer from '../room/roombase.server';
import BaseServer from '../common/base.server';
import VhallPaasSDK from '@/sdk/index';
import { merge } from '../../utils';
class DesktopShareServer extends BaseServer {
  constructor() {
    super();
    if (typeof DesktopShareServer.instance === 'object') {
      return DesktopShareServer.instance;
    }
    this.state = {
      localStream: { localDesktopStreamId: '' }
    };
    DesktopShareServer.instance = this;
    this._addListeners();

    return this;
  }
  init() { }
  _addListeners() {
    const interactiveServer = useInteractiveServer();

    // 远端流加入事件
    interactiveServer.$on('VhallRTC_init_success', () => {
      // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播

      let stream = interactiveServer.getDesktopAndIntercutInfo();
      if (stream?.streamType === 3 || stream?.streamType === 4) {
        this.$emit('screen_stream_add', stream.streamId);
      }
    });
    // 远端流加入事件
    interactiveServer.$on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_ADD, e => {
      // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
      if (e.data.streamType === 3 || stream?.streamType === 4) {
        this.$emit('screen_stream_add', e.data.streamId);
      }
    });
    // 远端流离开事件
    interactiveServer.$on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_REMOVED, e => {
      // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
      if (e.data.streamType === 3 || e.data.streamType === 4) {
        this.$emit('screen_stream_remove', e);
      }
    });
  }

  //检测浏览器是否支持桌面共享
  browserDetection() {
    const ua = navigator.userAgent;
    const chromeTest = ua.match(/chrome\/([\d\.]+)/i);
    const chromeVersion = chromeTest ? chromeTest[1] : 0;
    const safariTest = ua.match(/Version\/([\d.]+).*Safari/);
    const safariVersion = safariTest ? safariTest[1].replace(/\./g, '') : 0;

    //浏览器是否支持桌面共享
    const isNotSupport = !chromeVersion && (!safariVersion || Number(safariVersion) < 1304);

    //浏览器是否版本过低，需要安装插件支持
    const needInstallPlugin = Number(chromeVersion) < 74;

    return {
      isNotSupport,
      needInstallPlugin,
      chromeTest,
      chromeVersion,
      safariTest,
      safariVersion
    };
  }

  //分享屏幕检测
  shareScreenCheck() {
    const interactiveServer = useInteractiveServer();

    return new Promise((resolve, reject) => {
      interactiveServer.checkSystemRequirements().then(checkResult => {
        console.log('result', checkResult, checkResult.result, 'detail', checkResult.detail);
        if (
          (checkResult.result || checkResult.detail.isScreenShareSupported) &&
          !navigator.userAgent.indexOf('Firefox') > 0
        ) {
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  }

  // 开始桌面共享
  startShareScreen(options) {
    const interactiveServer = useInteractiveServer();
    const roomBaseServer = useRoomBaseServer();

    const { state: roomBaseServerState } = roomBaseServer;

    const retOptions = {
      videoNode: options.videoNode,
      profile: options.profile,
      audio: false, // 桌面共享不采集麦克风防止回声
      speaker: true // 桌面共享开启采集扬声器声音的入口
    };

    const addConfig = {
      videoDevice: 'desktopScreen',
      attributes: JSON.stringify({
        nickname: roomBaseServerState.watchInitData.join_info.nickname,
        role: roomBaseServerState.watchInitData.join_info.role_name
      })
    };

    return interactiveServer.createLocaldesktopStream(retOptions, addConfig);
  }

  // 推桌面共享流
  publishDesktopShareStream(streamId) {
    const interactiveServer = useInteractiveServer();

    return new Promise((resolve, reject) => {
      interactiveServer
        .publishStream({ streamId })
        .then(res => {
          // state.localDesktopStreamId = streamId;
          resolve(res);
        })
        .catch(reject);
    });
  }
  // 订阅桌面共享流
  subscribeDesktopShareStream(options) {
    const interactiveServer = useInteractiveServer();

    return new Promise((resolve, reject) => {
      interactiveServer
        .subscribe(options)
        .then(res => {
          // state.localDesktopStreamId = options.streamId;
          resolve(res);
        })
        .catch(reject);
    });
  }

  /**
   * 停止桌面共享
   * */
  stopShareScreen(streamId) {
    return interactiveServer.unpublishStream(streamId || state.localDesktopStreamId);
  }
}
export default function useDesktopShareServer() {
  return new DesktopShareServer();
}
