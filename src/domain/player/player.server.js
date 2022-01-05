import contextServer from '../common/context.server';

export default function usePlayerServer() {
  let state = {
    playerInstance: null,
    isPlaying: false,
    markPoints: [],
    type: 'live', // live or vod
    voice: 60
  };

  let vhallSaasInstance = null;

  const init = options => {
    const roomInitGroupServer = contextServer.get('roomInitGroupServer');
    if (roomInitGroupServer) {
      vhallSaasInstance = roomInitGroupServer.state.vhallSaasInstance;
    } else {
      vhallSaasInstance = new window.VhallSaasSDK();
    }

    return vhallSaasInstance.createPlayer(options).then(instance => {
      state.playerInstance = instance;
      state.markPoints = state.playerInstance.markPoints;
      return true;
    });
  };

  const setType = (type = 'live') => {
    state.type = type;
  };

  const play = () => {
    return state.playerInstance.play();
  };

  const pause = () => {
    return state.playerInstance.pause();
  };

  const isPause = () => {
    return state.playerInstance.isPause();
  };

  const getQualitys = () => {
    return state.playerInstance.getQualitys();
  };

  const getCurrentQuality = () => {
    return state.playerInstance.getCurrentQuality();
  };

  const setQuality = item => {
    return state.playerInstance.setQuality(item);
  };

  const enterFullScreen = () => {
    return state.playerInstance.enterFullScreen();
  };

  const exitFullScreen = () => {
    return state.playerInstance.exitFullScreen();
  };

  const setMute = () => {
    return state.playerInstance.setMute();
  };

  const getVolume = () => {
    return state.playerInstance.getVolume();
  };

  const setVolume = val => {
    state.voice = val;
    return state.playerInstance.setVolume(val);
  };

  const getDuration = (onFail = () => {}) => {
    return state.playerInstance.getDuration(onFail);
  };

  const getCurrentTime = () => {
    return state.playerInstance.getCurrentTime();
  };

  const setCurrentTime = val => {
    return state.playerInstance.setCurrentTime(val);
  };

  const getUsableSpeed = () => {
    return state.playerInstance.getUsableSpeed();
  };

  const setPlaySpeed = val => {
    return state.playerInstance.setPlaySpeed(val);
  };

  const openControls = status => {
    return state.playerInstance.openControls(status);
  };

  const openUI = status => {
    return state.playerInstance.openUI(status);
  };

  const setResetVideo = val => {
    return state.playerInstance.setResetVideo(val);
  };

  const setBarrageInfo = val => {
    return state.playerInstance.setBarrageInfo(val);
  };

  const addBarrage = val => {
    return state.playerInstance.addBarrage(val);
  };

  const toggleBarrage = () => {
    return state.playerInstance.toggleBarrage();
  };

  //开启弹幕显示
  const openBarrage = () => {
    return state.playerInstance.toggleBarrage(true);
  };

  //关闭弹幕显示
  const closeBarrage = () => {
    return state.playerInstance.toggleBarrage(false);
  };

  //清除弹幕显示
  const clearBarrage = () => {
    return state.playerInstance.clearBarrage();
  };

  const toggleSubtitle = () => {
    return state.playerInstance.toggleSubtitle();
  };

  const on = (type, cb) => {
    state.playerInstance.$on(type, cb);
  };

  const emit = (type, params) => {
    state.playerInstance.$emit(type, params);
  };

  const destroy = () => {};

  return {
    state,
    setType,
    init,
    on,
    emit,
    destroy,
    play,
    pause,
    isPause,
    getQualitys,
    getCurrentQuality,
    setQuality,
    enterFullScreen,
    exitFullScreen,
    setMute,
    getVolume,
    setVolume,
    getDuration,
    getCurrentTime,
    setCurrentTime,
    getUsableSpeed,
    setPlaySpeed,
    openControls,
    openUI,
    setResetVideo,
    setBarrageInfo,
    addBarrage,
    toggleBarrage,
    openBarrage,
    closeBarrage,
    clearBarrage,
    toggleSubtitle
  };
}
