import useInteractiveServer from './interactive.server';
import BaseServer from '../common/base.server';
import useMicServer from './mic.server';
import useDesktopShareServer from './desktopShare.server';
class SplitScreenServer extends BaseServer {
  constructor() {
    super();
    if (typeof SplitScreenServer.instance === 'object') {
      return SplitScreenServer.instance;
    }
    // 主页面 window 对象
    this.hostWin = null
    // 分屏页面 window 对象
    this.shadowWin = null

    // postMessage targetOrigin
    this.curOrigin = window.location.origin;

    this.state = {
      isOpenSplitScreen: false,  // 是否开启分屏
      splitScreenPageUrl: '', // 分屏页面 url
      role: '', // 当前角色， hostPage 主页面， splitPage 分屏页面
      isHostWaitingSplit: false // 主页面是否正在等待分屏重新连接
    };
    SplitScreenServer.instance = this;

    return this;
  }

  /**
   * 分屏初始化
   * @param {Object} options
   */
  init(options = {
    splitScreenPageUrl: '',
    role: 'hostPage'
  }) {
    this.state.role = options.role
    this.state.splitScreenPageUrl = options.splitScreenPageUrl
    if (options.role == 'splitPage') {
      // 如果是分屏页面
      this.shadowWin = window
      this.hostWin = window.opener
      console.log('----splitScreen-----进入分屏页面----hostWin----', this.hostWin)
      if (this.hostWin == null) {
        return Promise.resolve('SPLIT_OPEN_ERROR')
      }
      // 更改开启分屏状态
      this.state.isOpenSplitScreen = true
      // 给主页面发送分屏链接成功消息，分屏刷新页面的时候需要这个消息
      this.hostWin.postMessage({
        type: 'shadow_connect',
        source_type: 'split_screen'
      }, this.curOrigin)
      // 分屏页面消息监听
      this.initSplitscreenPostMsgEvent()
      this.addDesktopShareEvent()
      return Promise.resolve()
    } else {
      // 如果不是分屏页面
      this.hostWin = window
      this.initHostPostMsgEvent()
      return this.checkSplitStatus().then(e => {
        if (e) {
          this.openSplit()
        } else {
          this.state.isOpenSplitScreen = false
        }
      })
    }
  }

  /**
   * 检查分屏是否开启
   * @returns {Promise}
   */
  checkSplitStatus() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.shadowWin)
      }, 100)
    })
  }

  /**
   * 初始化主页面 postMessage 消息监听
   */
  initHostPostMsgEvent() {
    this.hostWin.onmessage = e => {
      // 是否是可以信任的来源
      if (e.origin !== this.curOrigin) {
        return;
      }
      // 是否是分屏服务的消息
      if (e.data.source_type != 'split_screen') {
        return false;
      }
      console.log('-----splitScreen--------主页面---postMessage----', e)
      const interactiveServer = useInteractiveServer()
      switch (e.data.type) {
        case 'shadow_live':
          this.shadowWin = e.source
          break
        // 分屏链接成功消息
        case 'shadow_connect':
          // 清除等待分屏页面重新连接的延时器
          if (this._waitSplitscreenReconnectTimer) {
            clearTimeout(this._waitSplitscreenReconnectTimer)
          }
          this.$emit('SPLIT_SHADOW_CONNECT')
          break
        // 分屏断开连接消息（点击关闭分屏）
        case 'shadow_disconnect':
          this.handleShadowDisconnect()
          break
        // 分屏页面关闭前发的消息
        case 'shadow_close':
          if (!this.state.isOpenSplitScreen) return
          this.state.isHostWaitingSplit = true
          // 启动延时器，十秒钟之内分屏页面没有链接回来，自动关闭分屏
          this._waitSplitscreenReconnectTimer = setTimeout(() => {
            // 10s后自动断开链接，关闭分屏
            this.handleShadowDisconnect()
          }, 10000)
          // 派发分屏页面关闭消息
          this.$emit('SPLIT_SHADOW_CLOSE')
          break
        // 分屏页面通知主页面更新上麦流列表信息
        case 'split_screen_remote_streams_update':
          useMicServer().state.speakerList = e.data.speakerList
          break;
        case 'custom_msg':
          this.$emit('SPLIT_CUSTOM_MESSAGE', e)
          break
        default:
          break
      }
    }

    this.hostWin.onbeforeunload = () => {
      console.log('-----splitScreen----页面即将销毁')
      if (!this.state.isOpenSplitScreen) {
        return
      }
      // 发送【主页面关闭】消息
      this.shadowWin.postMessage({
        type: 'host_close',
        source_type: 'split_screen'
      }, this.curOrigin)

    }
  }

  /**
   * 初始化分屏页面 postMessage 消息监听
   * @param {*} url
   */
  initSplitscreenPostMsgEvent() {
    // postMessage消息监听
    this.shadowWin.onmessage = e => {
      // 是否是可以信任的来源
      if (e.origin !== this.curOrigin) {
        return;
      }
      // 是否是分屏服务的消息
      if (e.data.source_type != 'split_screen') {
        return false;
      }
      console.log('-----splitScreen--------分屏页面---postMessage----', e)
      const micServer = useMicServer()
      switch (e.data.type) {
        // 主页面链接成功
        case 'host_connect':
          // 主页面链接成功，给主页面发送live消息的计时器
          clearInterval(this._heartbeatInterval);
          // 主页面回来了，关闭延时器
          clearTimeout(this._shadowAutoCloseTimeout)

          // 通知主页面上麦流列表信息更新(开启分屏之后,主页面将不能自主更新上麦流列表信息)
          const speakerListCopy = [...micServer.state.speakerList]
          // 由于 stream 对象太大了,postMessage发不过去,而且这个东西没用,所以删掉
          speakerListCopy.forEach(item => {
            if (item.stream) {
              delete item.stream
            }
          })
          this.hostWin.postMessage({
            type: 'split_screen_remote_streams_update',
            source_type: 'split_screen',
            speakerList: speakerListCopy
          }, this.curOrigin)
          break;
        // 主页面点击关闭分屏按钮,通知分屏页面处理关闭分屏的逻辑
        case 'shadow_stop':
          this.splitCloseSplitProcess();
          break;
        // 主页面关闭
        case 'host_close':

          // 派发主页面关闭事件
          this.$emit('HOST_CLOSE', e)

          // 启动计时器，20ms ping一次主页面
          this._heartbeatInterval = setInterval(() => {
            this.hostWin.postMessage({
              type: 'shadow_live',
              source_type: 'split_screen'
            }, this.curOrigin)
          }, 50);

          // 启动延时器，十秒钟之内主页面没有链接回来，自动关闭分屏
          this._shadowAutoCloseTimeout = setTimeout(() => {
            console.log('---十秒钟之内主页面没有链接回来，自动关闭分屏---')
            this.splitCloseSplitProcess(true)
          }, 10000)

          break;
        case 'custom_msg':
          this.$emit('SPLIT_CUSTOM_MESSAGE', e)
      }
    };

    // 分屏页面关闭事件
    this.shadowWin.onbeforeunload = () => {
      if (!this.state.isOpenSplitScreen) {
        return
      }
      this.hostWin.postMessage({
        type: 'shadow_close',
        source_type: 'split_screen'
      }, this.curOrigin)
    }

    // 流信息更新事件注册
    const micServer = useMicServer()
    // 监听上麦流列表信息更新事件,通知主页面上麦流列表信息更新(开启分屏之后,主页面将不能自主更新上麦流列表信息)
    micServer.$on('INTERACTIVE_REMOTE_STREAMS_UPDATE', speakerList => {
      console.log('-----splitScreen--------远端流列表更新----', speakerList)
      const speakerListCopy = [...speakerList]
      // 由于 stream 对象太大了,postMessage发不过去,而且这个东西没用,所以删掉
      speakerListCopy.forEach(item => {
        if (item.stream) {
          delete item.stream
        }
      })
      this.hostWin.postMessage({
        type: 'split_screen_remote_streams_update',
        source_type: 'split_screen',
        speakerList: speakerListCopy
      }, this.curOrigin)
    })
  }

  /**
   * 主页面开启分屏
   */
  openSplit(url) {
    // 销毁互动实例
    useInteractiveServer().destroy()

    this.state.isOpenSplitScreen = true
    // 判断分屏window是否开启
    if (this.shadowWin === null) {
      this.shadowWin = window.open(url || this.state.splitScreenPageUrl)
    } else {
      // 发送主页面链接消息
      this.shadowWin.postMessage({
        type: 'host_connect',
        source_type: 'split_screen'
      }, this.curOrigin)
    }
  }

  /**
   * 关闭分屏
   */
  closeSplit() {
    if (this.state.role == 'splitPage') {
      // 分屏页面点击分屏，直接关闭
      this.splitCloseSplitProcess(true)
    } else {
      // 主页面点击分屏，发送分屏关闭消息，由分屏页面执行关闭逻辑
      this.shadowWin.postMessage({
        type: 'shadow_stop',
        source_type: 'split_screen'
      }, this.curOrigin)
      this.handleShadowDisconnect()
    }
  }

  /**
   * split 处理关闭分屏的逻辑
   * 如果是 host 页面点击关闭，通过 postMessage 通知 split 执行此方法
   */
  splitCloseSplitProcess(isNeedNoticeHost) {
    if (isNeedNoticeHost) {
      this.hostWin.postMessage({
        type: 'shadow_disconnect',
        source_type: 'split_screen'
      }, this.curOrigin)
    }
    this.state.isOpenSplitScreen = false
    clearInterval(this.state._heartbeatInterval)
    // 关闭分屏页面
    this.shadowWin.close()
  }

  /**
   * host 处理关闭分屏的逻辑
   */
  handleShadowDisconnect() {
    // 清除等待分屏页面重新连接的延时器
    if (this._waitSplitscreenReconnectTimer) {
      clearTimeout(this._waitSplitscreenReconnectTimer)
    }
    // 更改分屏开启状态
    this.state.isOpenSplitScreen = false
    this.state.isHostWaitingSplit = false
    this.shadowWin = null
    this.$emit('SPLIT_SHADOW_DISCONNECT')
  }

  /**
   * 分屏发送给主页面 postMessage
   */
  splitSendPostMessage(body) {
    this.hostWin.postMessage({
      source_type: 'split_screen',
      type: 'custom_msg',
      body
    })
  }

  // 开启分屏之后桌面共享对应的旁路设置由分屏页面接管
  addDesktopShareEvent() {
    const desktopScreenServer = useDesktopShareServer()
    const interactiveServer = useInteractiveServer()
    desktopScreenServer.$on('screen_stream_add', () => {
      interactiveServer.resetLayout();
    });
    desktopScreenServer.$on('EVENT_STREAM_END', () => {
      interactiveServer.resetLayout();
    });
  }
}
export default function useSplitScreenServer() {
  return new SplitScreenServer();
}
