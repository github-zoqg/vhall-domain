import VhallPaasSDK from '@/sdk/index.js';
import BaseServer from '@/domain/common/base.server';
import { player } from '../../request/index';
class PlayerServer extends BaseServer {
  constructor(options) {
    // // 创建单例之外的额外的实例
    if (options.extra) {
      super();
      this.playerInstance = null; //播放器实例
      this.state = {
        isPlaying: false,
        markPoints: [],
        type: 'live', // live or vod
        voice: 60
      };
      return this;
    }

    if (typeof PlayerServer.instance === 'object') {
      return PlayerServer.instance;
    }
    super();
    this.playerInstance = null; //播放器实例
    this.state = {
      isPlaying: false,
      markPoints: [],
      type: 'live', // live or vod
      voice: 60
    };

    PlayerServer.instance = this;
    return this;
  }
  //初始化播放器实例
  init(options) {
    return new Promise(resolve => {
      VhallPaasSDK.onSuccess(contollers => {
        const { VhallPlayer } = contollers;
        VhallPlayer.createInstance(
          options,
          //创建播放器成功回调
          event => {
            this.playerInstance = event.vhallplayer;
            this.state.markPoints = event.markPoints;
            this._addPlayerListeners();
            resolve(event);
          },
          //创建播放器失败成功回调
          e => {
            throw new Error(e.message);
          }
        );
      });
    });
  }

  setType(type = 'live') {
    this.state.type = type;
  }

  play() {
    return this.playerInstance.play();
  }

  pause() {
    return this.playerInstance.pause();
  }

  isPause() {
    return this.playerInstance.isPause();
  }

  getQualitys() {
    return this.playerInstance.getQualitys();
  }

  getCurrentQuality() {
    return this.playerInstance.getCurrentQuality();
  }

  setQuality(item) {
    return this.playerInstance.setQuality(item);
  }

  enterFullScreen() {
    return this.playerInstance.enterFullScreen();
  }

  exitFullScreen() {
    return this.playerInstance.exitFullScreen();
  }

  setMute() {
    return this.playerInstance.setMute();
  }

  getVolume() {
    return this.playerInstance.getVolume();
  }

  setVolume(val) {
    this.state.voice = val;
    return this.playerInstance.setVolume(val);
  }

  getDuration(onFail = () => {}) {
    return this.playerInstance.getDuration(onFail);
  }

  getCurrentTime() {
    return this.playerInstance.getCurrentTime();
  }

  setCurrentTime(val) {
    return this.playerInstance.setCurrentTime(val);
  }

  getUsableSpeed() {
    return this.playerInstance.getUsableSpeed();
  }

  setPlaySpeed(val) {
    return this.playerInstance.setPlaySpeed(val);
  }

  openControls(status) {
    return this.playerInstance.openControls(status);
  }

  openUI(status) {
    return this.playerInstance.openUI(status);
  }

  setResetVideo(val) {
    return this.playerInstance.setResetVideo(val);
  }

  setBarrageInfo(val) {
    return this.playerInstance.setBarrageInfo(val);
  }

  addBarrage(val) {
    return this.playerInstance.addBarrage(val);
  }

  toggleBarrage() {
    return this.playerInstance.toggleBarrage();
  }

  //开启弹幕显示
  openBarrage() {
    return this.playerInstance.toggleBarrage(true);
  }

  //关闭弹幕显示
  closeBarrage() {
    return this.playerInstance.toggleBarrage(false);
  }

  //清除弹幕显示
  clearBarrage() {
    return this.playerInstance.clearBarrage();
  }

  toggleSubtitle() {
    return this.playerInstance.toggleSubtitle();
  }
  // 销毁实例
  destroy() {
    this.$emit('destroy');
    return this.playerInstance && this.playerInstance.destroy();
  }

  onPlayer(type, cb) {
    this.playerInstance.$on(type, cb);
  }

  emitPlayer(type, params) {
    this.playerInstance.$emit(type, params);
  }

  getPlayerConfig(params = {}) {
    return player.getPlayerConfig(params).then(res => {
      return res;
    });
  }
  // 播放器注册事件监听
  _addPlayerListeners() {
    // 视频加载完成
    this.playerInstance.on(VhallPlayer.LOADED, e => {
      this.$emit(VhallPlayer.LOADED, e);
    });

    // 播放时间改变时触发
    this.playerInstance.on(VhallPlayer.TIMEUPDATE, e => {
      this.$emit(VhallPlayer.TIMEUPDATE, e);
    });

    // 开始播放时触发
    this.playerInstance.on(VhallPlayer.PLAY, e => {
      this.$emit(VhallPlayer.PLAY, e);
    });

    // 暂停时触发
    this.playerInstance.on(VhallPlayer.PAUSE, e => {
      this.$emit(VhallPlayer.PAUSE, e);
    });

    // 视频播放完毕
    this.playerInstance.on(VhallPlayer.ENDED, e => {
      this.$emit(VhallPlayer.ENDED, e);
    });

    // 视频卡顿
    this.playerInstance.on(VhallPlayer.LAG_REPORT, e => {
      this.$emit(VhallPlayer.LAG_REPORT, e);
    });

    // 视频卡顿恢复时触发
    this.playerInstance.on(VhallPlayer.LAG_RECOVER, e => {
      this.$emit(VhallPlayer.LAG_RECOVER, e);
    });
  }
}

export default function usePlayerServer(options = { extra: false }) {
  return new PlayerServer(options);
}
