import useInteractiveServer from './interactive.server';
import useRoomBaseServer from '../room/roombase.server';
import BaseServer from '../common/base.server';
import VhallPaasSDK from '@/sdk/index';
import useGroupServer from '../group/StandardGroupServer';
import { merge, sleep } from '../../utils';
import useDocServer from '../doc/doc.server';
import useMicServer from './mic.server';
class DesktopShareServer extends BaseServer {
  constructor() {
    super();
    if (typeof DesktopShareServer.instance === 'object') {
      return DesktopShareServer.instance;
    }
    this.state = {
      localDesktopStreamId: '',
      desktopShareInfo: {
        accountId: '',
        nickname: '',
        role: ''
      }
    };
    DesktopShareServer.instance = this;

    return this;
  }
  init() {
    this.initDesktopShareStatus()
    this._addListeners();
  }
  _addListeners() {
    const interactiveServer = useInteractiveServer();



    // 远端流加入事件
    interactiveServer.$on('INTERACTIVE_INSTANCE_INIT_SUCCESS', () => {
      // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
      this.initDesktopShareStatus()
    });

    // 远端流加入事件
    interactiveServer.$on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_ADD, e => {
      // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
      this.emitStreamAdd(e.data);
    });

    // 桌面共享停止事件
    interactiveServer.$on('EVENT_REMOTESTREAM_REMOVED', e => {
      if (e.data.streamId == this.state.localDesktopStreamId) {
        this.state.localDesktopStreamId = '';
        let miniElement = null
        const { role_name } = useRoomBaseServer().state.watchInitData.join_info

        if (useGroupServer().state.groupInitData.isInGroup) {
          // 在小组内，文档区域常显，小屏显示主画面
          miniElement = 'stream-list'
        } else if (role_name != 2) {
          // 非观众文档区域常显，小屏显示主画面
          miniElement = 'stream-list'
        } else {
          if (useDocServer().state.switchStatus) {
            miniElement = 'stream-list'
          } else {
            miniElement = ''
          }
        }
        useRoomBaseServer().setChangeElement(miniElement);
        // 重设旁路
        interactiveServer.resetLayout();
        this.$emit('screen_stream_remove', e);
      }
    })

    // 桌面共享停止事件,只有自己能收到本地流断开
    interactiveServer.$on('EVENT_STREAM_END', e => {
      if (e.data.streamId == this.state.localDesktopStreamId) {
        this.state.localDesktopStreamId = '';
        useRoomBaseServer().setChangeElement('stream-list');
        this.$emit('EVENT_STREAM_END', e);
      }
    })
  }
  emitStreamAdd(stream) {
    const { watchInitData } = useRoomBaseServer().state;
    const { role_name } = watchInitData.join_info;
    const { isSpeakOn } = useMicServer().state;
    if (stream?.streamType === 3 && (watchInitData.webinar.no_delay_webinar == 1 || watchInitData.webinar.no_delay_webinar != 1 && isSpeakOn || [1, 3, 4].includes(+role_name))) {
      this.state.localDesktopStreamId = stream.streamId;
      // TODO 客户端桌面共享的时候，attributes格式是 attributes: { avatar: '', join_role: '', join_uid: '',join_uname: '', nickName: '', role: '' } ，另外accountId在 stream对象里 (兼容处理)
      stream.attributes.nickname = stream.attributes.nickname || stream.attributes.nickName
      stream.attributes.accountId = stream.attributes.accountId || stream.accountId
      this.state.desktopShareInfo = stream.attributes;
      this.$emit('screen_stream_add', stream.streamId);
    }
  }
  // 初始化桌面共享状态
  initDesktopShareStatus() {
    const interactiveServer = useInteractiveServer();
    let stream = interactiveServer.getDesktopAndIntercutInfo(true);
    this.emitStreamAdd(stream);
  }

  // 创建桌面共享流
  createLocaldesktopStream(options = {}) {
    const interactiveServer = useInteractiveServer();
    const params = merge.recursive({ streamType: 3 }, options);
    return interactiveServer.createLocalStream(params)
  }

  // 销毁桌面共享流
  destroyLocaldesktopStream(options = {}) {
    const interactiveServer = useInteractiveServer();
    const params = merge.recursive({ streamType: 3 }, options);
    return interactiveServer.destroyStream(params)
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
    const roomBaseServer = useRoomBaseServer();

    const { join_info } = roomBaseServer.state.watchInitData;
    const retOptions = {
      videoNode: options.videoNode,
      profile: options.profile,
      audio: false, // 桌面共享不采集麦克风防止回声
      speaker: true, // 桌面共享开启采集扬声器声音的入口
      videoDevice: 'desktopScreen',
      attributes: JSON.stringify({
        accountId: join_info.third_party_user_id,
        nickname: join_info.nickname,
        role: join_info.role_name
      }),
      videoContentHint: options.videoContentHint
    };

    return this.createLocaldesktopStream(retOptions).then(data => {
      this.state.localDesktopStreamId = data.streamId
      this.state.desktopShareInfo = {
        accountId: join_info.third_party_user_id,
        nickname: join_info.nickname,
        role: join_info.role_name
      }
      return data
    }).catch(e => {
      return Promise.reject(e)
    })
  }

  // 结束桌面共享（本地流）
  endStartShareScreen(options) {
    return this.destroyLocaldesktopStream({
      streamId: options.streamId || this.state.localDesktopStreamId
    }).then(data => {
      this.state.localDesktopStreamId = ''
      return data
    }).catch(e => {
      return Promise.reject(e)
    })
  }

  // 推桌面共享流
  publishDesktopShareStream() {
    const interactiveServer = useInteractiveServer();

    return new Promise((resolve, reject) => {
      interactiveServer
        .publishStream({ streamId: this.state.localDesktopStreamId })
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err)
        });
    });
  }
  // 订阅桌面共享流
  subscribeDesktopShareStream(options) {
    const interactiveServer = useInteractiveServer();

    return interactiveServer.subscribe({
      streamId: this.state.localDesktopStreamId,
      ...options
    })
  }

  // 取消订阅桌面共享流
  unSubscribeDesktopShareStream() {
    const interactiveServer = useInteractiveServer();

    return interactiveServer.unSubscribeStream(this.state.localDesktopStreamId).then(res => {
      this.state.localDesktopStreamId = ''
      return res
    })
  }

  /**
   * 停止桌面共享
   * */
  stopShareScreen() {
    return interactiveServer.unpublishStream({ streamId: this.state.localDesktopStreamId }).then(res => {
      this.state.localDesktopStreamId = ''
      return res
    });
  }
}
export default function useDesktopShareServer() {
  return new DesktopShareServer();
}
