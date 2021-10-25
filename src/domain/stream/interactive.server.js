export default function useInteractiveServer() {
    let state = {
        vhallSaasInstance: null,
        interactiveInstance: null,
        streamId: null
    }
    let interactives = null
    const init = (option) => {
        const vhallSaasInstance = new window.VhallSaasSDK()
        console.log('vhallSaasInstance',vhallSaasInstance);
        state.vhallSaasInstance = vhallSaasInstance
    }
    // 基础api
    // 常见本地流
    const createLocalStream = (options = {}, addConfig = {}) => {
       return state.vhallSaasInstance.createLocalStream(options)
    }
    // 创建摄像头视频流
    const createLocalVideoStream = (options = {}, addConfig = {}) => {
        return state.vhallSaasInstance.createLocalVideoStream(options,addConfig)
    }
    // 创建桌面共享流
    const createLocaldesktopStream = (options = {}, addConfig = {}) => {
        return state.vhallSaasInstance.createLocaldesktopStream(options,addConfig)
    }
    // 创建本地音频流
    const createLocalAudioStream = (options = {}, addConfig = {}) => {
        return state.vhallSaasInstance.createLocalAudioStream(options,addConfig)
    }
    // 创建图片推流
    const createLocalPhotoStream = (options = {}, addConfig = {}) => {
        return state.vhallSaasInstance.createLocalPhotoStream(options,addConfig)
    }
    // 销毁额本地流
    const stopStream =(streamId) =>{
        return state.interactiveInstance.destroyStream(state.streamId || streamId)
    }
    // 推送本地流到远端
    const publishStream = (options = {}) => {
        return state.vhallSaasInstance.publishStream({streamId: state.streamId || options.streamId})
    }
    // 取消推送到远端的流
    const unpublishStream = (streamId) => {
        return state.interactiveInstance.unpublishStream(state.streamId || streamId)
    }
    // 订阅远端流
    const subscribeStream = (options = {}) => {
        return state.vhallSaasInstance.subscribeStream(options)
    }
    // 取消订阅远端流
    const unSubscribeStream = (streamId) => {
        return state.vhallSaasInstance.unSubscribeStream(streamId)
    }
    // 设置大小流
    const setDual = (options = {}) => {
        return state.vhallSaasInstance.setDual(options)
    }
    // 改变视频的禁用和启用
    const muteVideo = (options = {}) => {
        return state.vhallSaasInstance.muteVideo(options)
    }
    // 改变音频的禁用和启用
    const muteAudio = (options = {}) => {
        return state.vhallSaasInstance.muteAudio(options)
    }
    // 开启旁路
    const startBroadCast = (options = {},addConfig ={}) => {
        return state.vhallSaasInstance.startBroadCast(options, addConfig)
    }
    // 停止旁路
    const stopBroadCast = () => {
        return state.vhallSaasInstance.stopBroadCast()
    }
    // 动态配置指定旁路布局模板
    const setBroadCastLayout = (options = {}) => {
        return state.vhallSaasInstance.setBroadCastLayout(options)
    }
    // 动态配置旁路主屏
    const setBroadCastScreen = (mainScreenStreamId = '') => {
        return state.vhallSaasInstance.setBroadCastScreen(mainScreenStreamId)
    }
    // 获取全部音视频列表
    const getDevices = () => {
        return state.vhallSaasInstance.getDevices()
    }
    // 获取摄像头列表
    const getCameras = () => {
        return state.vhallSaasInstance.getCameras()
    }
    // 获取麦克风列表
    const getMicrophones = () => {
        return state.vhallSaasInstance.getMicrophones()
    }
    // 获取扬声器列表
    const getSpeakers = () => {
        return state.vhallSaasInstance.getSpeakers()
    }
    // 获取设备的分辨率
    const getVideoConstraints = (deviceId = '') => {
        return state.vhallSaasInstance.getSpeakers(deviceId)
    }
    // 是否支持桌面共享
    const isScreenShareSupported = () => {
        return state.vhallSaasInstance.isScreenShareSupported() 
    }
    // 获取上下行丢包率
    const getPacketLossRate = () => {
        return state.vhallSaasInstance.getPacketLossRate() 
    }

    // 组合api
    const startPushStream = ()=> {
        state.vhallSaasInstance.createInteractive().then((res)=>{
            interactives = res
            state.interactiveInstance = interactives
            setTimeout(async()=>{
                console.log('5555555kaiakai',interactives.getDevices());
                await createLocalAndPushStream(interactives)
            },3000)
        })
    }
    // 创建本地的推流和推流
    const createLocalAndPushStream = (interactive) => {
        let camerasList = null,micropsList = null,videoConstraintsList = null,streamId =null
        console.log('33333333333333333333',interactive);
        return interactive.getDevices().then((data)=>{
            console.log('devices list::',data);
            camerasList = data.videoInputDevices.filter(d => d.label && d.deviceId != 'desktopScreen')
            micropsList = data.audioInputDevices.filter(
                d => d.deviceId != 'default' && d.deviceId != 'communications' && d.label
              )
        }).then(()=>{
            const RESOLUTION_REG = /((^VIDEO_PROFILE_(720P|540P|480P|360P)_1$)|(^RTC_VIDEO_PROFILE_(720P|540P|480P|360P)_16x9_M$))/
            interactive.getVideoConstraints(camerasList[0].deviceId).then((data)=>{
                console.log('constrainList', data);
                videoConstraintsList = data.filter(item => RESOLUTION_REG.test(item.label))
            }).then(()=>{
                let params = {
                    videoNode:'vhall-video',
                    videoDevice: camerasList[0].deviceId,
                    audioDevice: micropsList[0].deviceId,
                    profile: videoConstraintsList[0]
                }
                interactive.createLocalVideoStream(params).then((res)=>{
                    console.log('create local stream success::', res);
                    state.streamId = res
                    streamId = res
                }).then(()=>{
                    interactive.publishStream({streamId}).then((res)=>{
                        console.log('publish stream success::',streamId);
                    })
                    .catch((err)=>{
                        console.log('publish is failed::',err);
                    })
                }).catch((err)=>{
                    console.log('local stream failed::',err);
                })
            }).catch((err)=>{
                console.log('constrainlist is failed::',err);
            })
        }).catch((err)=>{
            console.log('getDevies is failed::',err);
        })
    }

    return { state, startPushStream ,init, createLocalStream, createLocalVideoStream, createLocaldesktopStream, createLocalAudioStream,
    createLocalPhotoStream, stopStream, publishStream, unpublishStream, subscribeStream, unSubscribeStream, setDual, muteVideo,
    muteAudio, startBroadCast, stopBroadCast, setBroadCastLayout, setBroadCastScreen, getDevices, getCameras, getMicrophones,
    getSpeakers, getVideoConstraints, isScreenShareSupported, getPacketLossRate}

}