import contextServer from '../common/context.server';
import requestApi from '@/request/index.js';
export default class UsePlayerServer {
    constructor() {
        this.state = {
            playerInstance: null,
            isPlaying: false,
            markPoints: [],
            type: 'live', // live or vod
            voice: 60,
            playerConfig: {} // 播放器配置
        };
        this.vhallSaasInstance = null
    }

    init(options) {
        const roomInitGroupServer = contextServer.get('roomInitGroupServer');
        if (roomInitGroupServer) {
            vhallSaasInstance = roomInitGroupServer.state.vhallSaasInstance;
        } else {
            vhallSaasInstance = new window.VhallSaasSDK();
        }

        return vhallSaasInstance.createPlayer(options).then(instance => {
            this.state.playerInstance = instance;
            this.state.markPoints = this.state.playerInstance.markPoints;
            return true;
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
        return this.state.playerInstance.setQuality();
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

    setVolume(val) {
        this.state.voice = val;
        return this.state.playerInstance.setVolume(val);
    }

    getDuration(onFail = () => { }) {
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

    on(type, cb) {
        this.state.playerInstance.$on(type, cb);
    }

    emit(type, params) {
        this.state.playerInstance.$emit(type, params);
    }

    getPlayerConfig(params) {
        return requestApi.player.getPlayerConfig(params).then(res => {
            this.state.playerConfig = res.data;
            return res;
        });
    }

    destroy() { }

}
