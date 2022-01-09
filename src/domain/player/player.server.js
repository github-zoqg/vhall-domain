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
    return state.playerInstance.play();
  }

  pause() {
    return state.playerInstance.pause();
  }

  isPause() {
    return state.playerInstance.isPause();
  }

  getQualitys() {
    return state.playerInstance.getQualitys();
  }

  getCurrentQuality() {
    return state.playerInstance.getCurrentQuality();
  }

  setQuality() {
    return state.playerInstance.setQuality(item);
  }

  enterFullScreen() {
    return state.playerInstance.enterFullScreen();
  }

  exitFullScreen() {
    return state.playerInstance.exitFullScreen();
  }

  setMute() {
    return state.playerInstance.setMute();
  }

  getVolume() {
    return state.playerInstance.getVolume();
  }

  setVolume() {
    state.voice = val;
    return state.playerInstance.setVolume(val);
  }

  getDuration(onFail = () => {}) {
    return state.playerInstance.getDuration(onFail);
  }

  getCurrentTime() {
    return state.playerInstance.getCurrentTime();
  }

  setCurrentTime(val) {
    return state.playerInstance.setCurrentTime(val);
  }

  getUsableSpeed() {
    return state.playerInstance.getUsableSpeed();
  }

  setPlaySpeed(val) {
    return state.playerInstance.setPlaySpeed(val);
  }

  openControls(status) {
    return state.playerInstance.openControls(status);
  }

  openUI(status) {
    return state.playerInstance.openUI(status);
  }

  setResetVideo(val) {
    return state.playerInstance.setResetVideo(val);
  }

  setBarrageInfo(val) {
    return state.playerInstance.setBarrageInfo(val);
  }

  addBarrage(val) {
    return state.playerInstance.addBarrage(val);
  }

  toggleBarrage() {
    return state.playerInstance.toggleBarrage();
  }

  //开启弹幕显示
  openBarrage() {
    return state.playerInstance.toggleBarrage(true);
  }

  //关闭弹幕显示
  closeBarrage() {
    return state.playerInstance.toggleBarrage(false);
  }

  //清除弹幕显示
  clearBarrage() {
    return state.playerInstance.clearBarrage();
  }

  toggleSubtitle() {
    return state.playerInstance.toggleSubtitle();
  }

  onPlayer(type, cb) {
    state.playerInstance.$on(type, cb);
  }

  emitPlayer(type, params) {
    state.playerInstance.$emit(type, params);
  }
}

export default function usePlayerServer(options) {
  return new PlayerServer();
}
