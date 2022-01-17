import VhallPaasSDK from '@/sdk/index.js';
import BaseServer from '@/domain/common/base.server';
class PlayerServer extends BaseServer {
  constructor() {
    if (typeof PlayerServer.instance === 'object') {
      return PlayerServer.instance;
    }
    super();
    this.state = {
      playerInstance: null,
      isPlaying: false,
      markPoints: [],
      type: 'live', // live or vod
      voice: 60
    };
    //播放器实例
    this.controller = null;
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
          instance => {
            this.controller = instance;
            resolve(instance);
          },
          //创建播放器失败成功回调
          () => {}
        );
      });
    });
  }

  setType(type = 'live') {
    this.state.type = type;
  }

  play() {
    return this.state.playerInstance.play();
  }

  pause() {
    return this.state.playerInstance.pause();
  }

  isPause() {
    return this.state.playerInstance.isPause();
  }

  getQualitys() {
    return this.state.playerInstance.getQualitys();
  }

  getCurrentQuality() {
    return this.state.playerInstance.getCurrentQuality();
  }

  setQuality() {
    return this.state.playerInstance.setQuality(item);
  }

  enterFullScreen() {
    return this.state.playerInstance.enterFullScreen();
  }

  exitFullScreen() {
    return this.state.playerInstance.exitFullScreen();
  }

  setMute() {
    return this.state.playerInstance.setMute();
  }

  getVolume() {
    return this.state.playerInstance.getVolume();
  }

  setVolume() {
    state.voice = val;
    return this.state.playerInstance.setVolume(val);
  }

  getDuration(onFail = () => {}) {
    return this.state.playerInstance.getDuration(onFail);
  }

  getCurrentTime() {
    return this.state.playerInstance.getCurrentTime();
  }

  setCurrentTime(val) {
    return this.state.playerInstance.setCurrentTime(val);
  }

  getUsableSpeed() {
    return this.state.playerInstance.getUsableSpeed();
  }

  setPlaySpeed(val) {
    return this.state.playerInstance.setPlaySpeed(val);
  }

  openControls(status) {
    return this.state.playerInstance.openControls(status);
  }

  openUI(status) {
    return this.state.playerInstance.openUI(status);
  }

  setResetVideo(val) {
    return this.state.playerInstance.setResetVideo(val);
  }

  setBarrageInfo(val) {
    return this.state.playerInstance.setBarrageInfo(val);
  }

  addBarrage(val) {
    return this.state.playerInstance.addBarrage(val);
  }

  toggleBarrage() {
    return this.state.playerInstance.toggleBarrage();
  }

  //开启弹幕显示
  openBarrage() {
    return this.state.playerInstance.toggleBarrage(true);
  }

  //关闭弹幕显示
  closeBarrage() {
    return this.state.playerInstance.toggleBarrage(false);
  }

  //清除弹幕显示
  clearBarrage() {
    return this.state.playerInstance.clearBarrage();
  }

  toggleSubtitle() {
    return this.state.playerInstance.toggleSubtitle();
  }

  onPlayer(type, cb) {
    this.state.playerInstance.$on(type, cb);
  }

  emitPlayer(type, params) {
    this.state.playerInstance.$emit(type, params);
  }
}

export default function usePlayerServer(options) {
  return new PlayerServer();
}
