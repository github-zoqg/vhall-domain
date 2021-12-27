import contextServer from '../common/context.server';
import requestApi from '@/request/index.js';

export default function usePlayerServer() {
    let state = {
        playerInstance: null,
        isPlaying: false,
        markPoints: [],
        type: 'live', // live or vod
        voice: 60,
        playerConfig: {} // 播放器配置
    };

    let vhallSaasInstance = null;

    function init(options) {
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
    }

    function setType(type = 'live') {
        state.type = type;
    }

    function play() {
        return state.playerInstance.play();
    }

    function pause() {
        return state.playerInstance.pause();
    }

    function isPause() {
        return state.playerInstance.isPause();
    }

    function getQualitys() {
        return state.playerInstance.getQualitys();
    }

    function getCurrentQuality() {
        return state.playerInstance.getCurrentQuality();
    }

    function setQuality() {
        return state.playerInstance.setQuality();
    }

    function enterFullScreen() {
        return state.playerInstance.enterFullScreen();
    }

    function exitFullScreen() {
        return state.playerInstance.exitFullScreen();
    }

    function setMute() {
        return state.playerInstance.setMute();
    }

    function getVolume() {
        return state.playerInstance.getVolume();
    }

    function setVolume(val) {
        state.voice = val;
        return state.playerInstance.setVolume(val);
    }

    function getDuration(onFail = () => {}) {
        return state.playerInstance.getDuration(onFail);
    }

    function getCurrentTime() {
        return state.playerInstance.getCurrentTime();
    }

    function setCurrentTime(val) {
        return state.playerInstance.setCurrentTime(val);
    }

    function getUsableSpeed() {
        return state.playerInstance.getUsableSpeed();
    }

    function setPlaySpeed(val) {
        return state.playerInstance.setPlaySpeed(val);
    }

    function openControls(status) {
        return state.playerInstance.openControls(status);
    }

    function openUI(status) {
        return state.playerInstance.openUI(status);
    }

    function setResetVideo(val) {
        return state.playerInstance.setResetVideo(val);
    }

    function setBarrageInfo(val) {
        return state.playerInstance.setBarrageInfo(val);
    }

    function addBarrage(val) {
        return state.playerInstance.addBarrage(val);
    }

    function toggleBarrage() {
        return state.playerInstance.toggleBarrage();
    }

    //开启弹幕显示
    function openBarrage() {
        return state.playerInstance.toggleBarrage(true);
    }

    //关闭弹幕显示
    function closeBarrage() {
        return state.playerInstance.toggleBarrage(false);
    }

    //清除弹幕显示
    function clearBarrage() {
        return state.playerInstance.clearBarrage();
    }

    function toggleSubtitle() {
        return state.playerInstance.toggleSubtitle();
    }

    function on(type, cb) {
        state.playerInstance.$on(type, cb);
    }

    function emit(type, params) {
        state.playerInstance.$emit(type, params);
    }

    function getPlayerConfig(params) {
        return requestApi.player.getPlayerConfig(params).then(res => {
            state.playerConfig = res.date;
            return res;
        });
    }

    function destroy() {}

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
        toggleSubtitle,
        getPlayerConfig
    };
}
