import contextServer from "../common/context.server";

export default function usePlayerServer() {
    let state = {
        playerInstance: null
    }

    let vhallSaasInstance = null;

    const init = () => {
        const roomInitGroupServer = contextServer.get('roomInitGroupServer')
        vhallSaasInstance = roomInitGroupServer.state.vhallSaasInstance

        return vhallSaasInstance.createPlayer().then(instance=>{
            state.playerInstance = instance
            return true
        })
    }

    const play = () => {
        return state.playerInstance.play();
    }

    const pause = () => {
        return state.playerInstance.pause()
    }

    const isPause = () => {
        return state.playerInstance.isPause()
    }

    const getQualitys = () => {
        return state.playerInstance.getQualitys()
    }

    const getCurrentQuality = () => {
        return state.playerInstance.getCurrentQuality()
    }

    const setQuality = () => {
        return state.playerInstance.setQuality()
    }

    const enterFullScreen = () => {
        return state.playerInstance.enterFullScreen()
    }

    const exitFullScreen = () => {
        return state.playerInstance.exitFullScreen()
    }

    const setMute = () => {
        return state.playerInstance.setMute()
    }

    const getVolume = () => {
        return state.playerInstance.getVolume()
    }

    const setVolume = () => {
        return state.playerInstance.setVolume()
    }

    const getDuration = () => {
        return state.playerInstance.getDuration()
    }

    const getCurrentTime = () => {
        return state.playerInstance.getCurrentTime()
    }

    const setCurrentTime = () => {
        return state.playerInstance.setCurrentTime()
    }

    const getUsableSpeed = () => {
        return state.playerInstance.getUsableSpeed()
    }

    const setPlaySpeed = () => {
        return state.playerInstance.setPlaySpeed()
    }

    const openControls = () => {
        return state.playerInstance.openControls()
    }

    const openUI = () => {
        return state.playerInstance.openUI()
    }

    const setResetVideo = () => {
        return state.playerInstance.setResetVideo()
    }

    const setBarrageInfo = () => {
        return state.playerInstance.setBarrageInfo()
    }

    const addBarrage = () => {
        return state.playerInstance.addBarrage()
    }

    const toggleBarrage = () => {
        return state.playerInstance.toggleBarrage()
    }

    const toggleSubtitle = () => {
        return state.playerInstance.toggleSubtitle()
    }

    const on = (type, cb) => {

    }

    const emit = (type,params) => {

    }

    const destroy = () => {

    }

    return { 
        state, 
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
        toggleSubtitle
     }
}