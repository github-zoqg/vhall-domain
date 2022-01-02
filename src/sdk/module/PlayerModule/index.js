import BaseModule from '../Base'
import { merge } from '@/utils/index.js'
import store from '../../store/index.js';
import { reject } from 'lodash';


export default class PlayerModule extends BaseModule {
  constructor(customOptions) {
    super(customOptions)
    this.isPlaying = false;
  }

  init(customOptions = { type: 'live' }) {
    return new Promise((resolve, reject) => {

      if (customOptions.type === 'live') {
        this.initLivePlayer(customOptions, (instance) => {
          resolve(instance)
        }, (err) => [
          reject(err)
        ])
      }

      if (customOptions.type === 'vod') {
        this.initVodPlayer(customOptions, (instance) => {
          resolve(instance)
        }, (err) => {
          reject(err)
        })
      }
    })

  }

  createInstance(customOptions = {}, successCb = () => { }, failCb = () => { }) {
    const { paasInfo, userInfo } = store.get('roomInitData');

    let defaultOptions = {
      appId: paasInfo.paas_app_id,
      accountId: userInfo.third_party_user_id,
      token: paasInfo.paas_access_token,
      type: 'live',
    }

    const options = merge.recursive({}, defaultOptions, customOptions)

    console.log('options:', options)
    const onSuccess = (event) => {
      this.instance = event.vhallplayer;
      this.markPoints = event.markPoints;
      this.listenEvents();
      successCb(event)
    }

    const onFail = (event) => {
      console.log('fail:', event)
      failCb(event)
    }

    VhallPlayer.createInstance(options, onSuccess, onFail)
  }

  initLivePlayer(customOptions = {}, successCb = () => { }, failCb = () => { }) {
    const { paasInfo, userInfo } = store.get('roomInitData');

    let defaultOptions = {
      type: 'live',
      language: 'zh',
      liveOption: {
        roomId: paasInfo.room_id,
        forceMSE: true,
        type: 'flv'
      }
    }

    const options = merge.recursive({}, defaultOptions, customOptions)
    this.createInstance(options, successCb, failCb)
  }

  initVodPlayer(customOptions = {}, successCb = () => { }, failCb = () => { }) {
    let defaultOptions = {
      appId: '',
      accountId: '',
      token: '',
      type: 'live',
      vodOption: {
        forceMSE: true,
        recordId: ''
      }
    }
    const options = merge.recursive({}, defaultOptions, customOptions)
    this.createInstance(options, successCb, failCb)
  }

  listenEvents() {
    this.instance.on(VhallPlayer.CURRENTTIME_CHANGE, (e) => {
      // 当前时间改变
      this.$emit(VhallPlayer.CURRENTTIME_CHANGE, e)
    });
    this.instance.on(VhallPlayer.TIMEUPDATE, (e) => {
      // 播放时间改变时触发
      this.$emit(VhallPlayer.TIMEUPDATE, e)
    });
    this.instance.on(VhallPlayer.ENDED, (e) => {
      // 播放完毕
      this.$emit(VhallPlayer.ENDED, e)
    });
    this.instance.on(VhallPlayer.ERROR, (e) => {
      // 播放器自身出现错误时触发
      this.$emit(VhallPlayer.ERROR, e)
    });
    this.instance.on(VhallPlayer.LOADED, (e) => {
      // 视频加载完成时触发
      this.$emit(VhallPlayer.LOADED, e)
    });
    this.instance.on(VhallPlayer.PLAY, (e) => {
      // 点播开始播放时触发
      this.$emit(VhallPlayer.PLAY, e)
    });
    this.instance.on(VhallPlayer.PAUSE, (e) => {
      // 点播暂停播放时触发
      this.$emit(VhallPlayer.PAUSE, e)
    });
    this.instance.on(VhallPlayer.LAG_REPORT, (e) => {
      // 视频卡顿时触发
      this.$emit(VhallPlayer.LAG_REPORT, e)
    });
    this.instance.on(VhallPlayer.LAG_RECOVER, (e) => {
      // 视频卡顿恢复时触发
      this.$emit(VhallPlayer.LAG_RECOVER, e)
    });
    this.instance.on(VhallPlayer.FULLSCREEN_CHANGE, (e) => {
      // 全屏状态改变时触发
      this.$emit(VhallPlayer.FULLSCREEN_CHANGE, e)
    });
    this.instance.on(VhallPlayer.MUTE_CHANGE, (e) => {
      // 静音状态被改变时触发
      this.$emit(VhallPlayer.MUTE_CHANGE, e)
    });
    this.instance.on(VhallPlayer.LOOP_CHANGE, (e) => {
      // 点播循环状态被改变时触发
      this.$emit(VhallPlayer.LOOP_CHANGE, e)
    });
    this.instance.on(VhallPlayer.DEFINITION_CHANGE, (e) => {
      // 当前清晰度改变时触发(卡顿时自动切清晰度触发，手动切换不触发)
      this.$emit(VhallPlayer.DEFINITION_CHANGE, e)
    });
  }

  destroy() {
    this.instance.destroy()
    this.instance = null;
  }


  play() {
    return this.instance.play()
  }

  pause() {
    return this.instance.pause()
  }

  isPause() {
    return this.instance.getIsPause()
  }

  getQualitys() { // 获取清晰度列表
    return this.instance.getQualitys()
  }

  getCurrentQuality() { // 获取当前视频清晰度
    return this.instance.getCurrentQuality()
  }

  setQuality(val, failure) { // 设置当前视频清晰度
    return this.instance.setQuality(val, failure)
  }

  enterFullScreen(failure) { // 进入全屏
    return this.instance.enterFullScreen(failure)
  }

  exitFullScreen(failure) { // 退出全屏
    return this.instance.exitFullScreen(failure)
  }

  setMute(isMute, failure) {
    return this.instance.setMute(isMute, failure)
  }

  getVolume() { // 获取音量
    return this.instance.getVolume()
  }

  setVolume(volume, failure) { // 设置音量
    return this.instance.setVolume(volume, failure)
  }

  getDuration(failure) { // 获取当前视频总时长
    return this.instance.getDuration(failure)
  }

  getCurrentTime(failure) { // 获取当前视频播放时间
    return this.instance.getCurrentTime(failure)
  }

  setCurrentTime(time, failure) { // 设置当前播放时间
    return this.instance.setCurrentTime(time, failure)
  }


  getUsableSpeed(failure) { // 获取当前可选倍速
    return this.instance.getUsableSpeed(failure)
  }

  setPlaySpeed(val, failure) { // 设置倍速播放
    return this.instance.setPlaySpeed(val, failure)
  }

  openControls(isOpen) { // 开关默认控制条
    return this.instance.openControls(isOpen)
  }

  openUI(isOpen) {
    return this.instance.openUI(isOpen)
  }

  setResetVideo() {
    const videoDom = document.getElementById(this.params.videoNode)
    if (videoDom && this.instance) {
      this.instance.setSize({
        width: videoDom.offsetWidth,
        height: videoDom.offsetHeight
      })
    }
  }

  setBarrageInfo(option) {
    return this.instance.setBarrageInfo(option, (err) => {
      Vlog.error(err)
    })
  }

  addBarrage(content) {
    return this.instance.addBarrage(content, (err) => {
      Vlog.error(err)
    })
  }

  toggleBarrage(open) {
    if (!this.instance) return
    if (open) {
      this.instance.openBarrage()
    } else {
      this.instance.closeBarrage()
    }
  }

  toggleSubtitle(open) {
    if (this.instance && this.params.recordId) {
      if (open) {
        // 开启点播字幕(仅点播可用)
        this.instance.openSubtitle()
      } else {
        // 关闭点播字幕(仅点播可用)
        this.instance.closeSubtitle()
      }
    }
  }

}