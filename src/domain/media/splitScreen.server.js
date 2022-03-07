import useInteractiveServer from './interactive.server';
import useRoomBaseServer from '../room/roombase.server';
import BaseServer from '../common/base.server';
import { merge } from '../../utils';
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

    this.state = {
      isOpenSplitScreen: false,  // 是否开启分屏
      splitScreenPageUrl: '', // 分屏页面 url
      role: '' // 当前角色，host 主页面， split 分屏页面
    };
    SplitScreenServer.instance = this;

    return this;
  }

  /**
   * 分屏初始化
   * @param {Object} options
   */
  init(options = {
    isSplitScreenPage: false,
    splitScreenPageUrl: '',
    role: 'host'
  }) {
    this.state.role = options.role
    this.state.splitScreenPageUrl = options.splitScreenPageUrl
    // 如果是分屏页面
    if (options.isSplitScreenPage) {
      this.shadowWin = window
      return Promise.resolve()
    } else {
      // 如果不是分屏页面
      this.hostWin = window
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
      this.initHostPostMsgEvent()
      setTimeout(() => {
        resolve(this.shadowWin)
      }, 500)
    })
  }

  /**
   * 初始化主页面 postMessage 消息监听
   */
  initHostPostMsgEvent() {
    this.hostWin.onmessage = e => {
      // console.log('debuger info -> message from Shadows::', e)
      let type = e.data
      if (typeof e.data === 'object') {
        type = e.data.type
      }
      switch (type) {
        case 'shadow_live':
          this.shadowWin = e.source
          break
        case 'shadow_connect':
          // EventBus.$emit('INTERACT_SHADOW_CONNECT')
          break
        case 'shadow_disconnect':
          // EventBus.$emit('INTERACT_SHADOW_DISCONNECT')
          break
        case 'shadow_close':
          // EventBus.$emit('INTERACT_SHADOW_CLOSE')
          break
        case 'cmd':
          // EventBus.$emit('INTERACT_SHADOW_MSG', e.data.data)
          break
        default:
          break
      }
    }

    this.hostWin.onbeforeunload = () => {
      if (!this.state.isOpenSplitScreen) {
        return
      }
      // 发送【主页面关闭】消息
      this.shadowWin.postMessage('host_close', '*')
    }

  }

  /**
   * 开启分屏
   */
  openSplit(url) {
    this.state.isOpenSplitScreen = true
    // 判断分屏window是否开启
    if (this.shadowWin === null) {
      this.shadowWin = window.open(url || this.state.splitScreenPageUrl)
    } else {
      // 发送主页面链接消息
      this.shadowWin.postMessage('host_connect', '*')
    }
    // this.$emit('SPLIT_SCREEN_OPEN')
  }

  /**
   * 关闭分屏
   */
  closeSplit() {
    if (this.state.role == 'split') {
      // 分屏页面点击分屏，直接关闭
      this.splitCloseSplitProcess()
    } else {
      // 主页面点击分屏，发送分屏关闭消息，由分屏页面执行关闭逻辑
      this.shadowWin.postMessage('shadow_stop', '*')
    }
    // this.$emit('SPLIT_SCREEN_CLOSE')
  }

  /**
   * split 处理关闭分屏的逻辑
   * 如果是 host 页面点击关闭，通过 postMessage 通知 split 执行此方法
   */
  splitCloseSplitProcess() {
    this.state.isOpenSplitScreen = false
    clearInterval(this.state.heartbeatInterval)
    // 关闭分屏页面
    this.shadowWin.close()
  }

  /**
   * host 处理关闭分屏的逻辑
   */
  hostCloseSplitProcess() {
    this.state.isOpenSplitScreen = false
    this.shadowWin = null
    this.$emit('SPLIT_CLOSE_TO_HOST')
  }

}
export default function useSplitScreenServer() {
  return new SplitScreenServer();
}
