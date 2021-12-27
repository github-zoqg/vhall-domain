import contextServer from '@/domain/common/context.server.js';
import requestApi from '../../request';

export default function useInteractiveServer() {
    let state = {
        vhallSaasInstance: null, // vhallsdk的实例
        interactiveInstance: null, // 互动实例
        streamId: null,
        remoteStreams: [] // 远端流数组
    };

    const init = option => {
        const roomInitGroupServer = contextServer.get('roomInitGroupServer');
        state.vhallSaasInstance = roomInitGroupServer.state.vhallSaasInstance;
        return state.vhallSaasInstance.createInteractive(option).then(interactives => {
            console.log('5555555555555createInteractive');
            state.interactiveInstance = interactives;
            // setTimeout(()=>{
            //     console.log('555888888createInteractive');
            //     state.interactiveInstance.listenEvents()
            // },2000)
            console.log('5555state.interactiveInstance', interactives, interactives.getRoomInfo());
            return interactives;
        });
    };

    // 监听事件
    const on = (type, callback) => {
        // console.log('ON INTERACTIVE REGSITER SUCCESS',type);

        return state.interactiveInstance.$on(type, callback);
    };

    // 销毁实例
    const destroyInit = () => {
        return state.interactiveInstance.destroyInit();
    };
    // 基础api
    // 常见本地流
    const createLocalStream = (options = {}, addConfig = {}) => {
        return state.interactiveInstance.createLocalStream(options);
    };
    // 创建摄像头视频流
    const createLocalVideoStream = (options = {}, addConfig = {}) => {
        return state.interactiveInstance.createLocalVideoStream(options, addConfig);
    };
    // 创建桌面共享流
    const createLocaldesktopStream = (options = {}, addConfig = {}) => {
        return state.interactiveInstance.createLocaldesktopStream(options, addConfig);
    };
    // 创建本地音频流
    const createLocalAudioStream = (options = {}, addConfig = {}) => {
        return state.interactiveInstance.createLocalAudioStream(options, addConfig);
    };
    // 创建图片推流
    const createLocalPhotoStream = (options = {}, addConfig = {}) => {
        return state.interactiveInstance.createLocalPhotoStream(options, addConfig);
    };
    // 销毁额本地流
    const destroyStream = streamId => {
        return state.interactiveInstance.destroyStream(streamId || state.streamId);
    };
    // 推送本地流到远端
    const publishStream = (options = {}) => {
        return state.interactiveInstance.publishStream({
            streamId: options.streamId || state.streamId
        });
    };
    // 取消推送到远端的流
    const unpublishStream = streamId => {
        return state.interactiveInstance.unpublishStream(streamId || state.streamId);
    };
    // 订阅远端流
    const subscribeStream = (options = {}) => {
        return state.interactiveInstance.subscribeStream(options);
    };
    // 取消订阅远端流
    const unSubscribeStream = streamId => {
        return state.interactiveInstance.unSubscribeStream(streamId);
    };
    // 设置大小流
    const setDual = (options = {}) => {
        return state.interactiveInstance.setDual(options);
    };
    // 改变视频的禁用和启用
    const muteVideo = (options = {}) => {
        return state.interactiveInstance.muteVideo(options);
    };
    // 改变音频的禁用和启用
    const muteAudio = (options = {}) => {
        return state.interactiveInstance.muteAudio(options);
    };
    // 开启旁路
    const startBroadCast = (options = {}, addConfig = {}) => {
        return state.interactiveInstance.startBroadCast(options, addConfig);
    };
    // 停止旁路
    const stopBroadCast = () => {
        return state.interactiveInstance.stopBroadCast();
    };
    // 动态配置指定旁路布局模板
    const setBroadCastLayout = (options = {}) => {
        return state.interactiveInstance.setBroadCastLayout(options);
    };
    // 配置旁路布局自适应模式
    const setBroadCastAdaptiveLayoutMode = (options = {}) => {
        return state.interactiveInstance.setBroadCastAdaptiveLayoutMode(options);
    };
    // 动态配置旁路主屏
    const setBroadCastScreen = (mainScreenStreamId = '') => {
        return state.interactiveInstance.setBroadCastScreen(mainScreenStreamId);
    };
    // 获取全部音视频列表
    const getDevices = () => {
        return state.interactiveInstance.getDevices();
    };
    // 获取摄像头列表
    const getCameras = () => {
        return state.interactiveInstance.getCameras();
    };
    // 获取麦克风列表
    const getMicrophones = () => {
        return state.interactiveInstance.getMicrophones();
    };
    // 获取扬声器列表
    const getSpeakers = () => {
        return state.interactiveInstance.getSpeakers();
    };
    // 获取设备的分辨率
    const getVideoConstraints = (deviceId = '') => {
        return state.interactiveInstance.getVideoConstraints(deviceId);
    };
    // 配置本地流视频质量参数
    const setVideoProfile = (options = {}) => {
        return state.interactiveInstance.setVideoProfile(options);
    };
    // 是否支持桌面共享
    const isScreenShareSupported = () => {
        return state.interactiveInstance.isScreenShareSupported();
    };
    // 检查当前浏览器支持性
    const checkSystemRequirements = async () => {
        if (!state.interactiveInstance) return;
        return state.interactiveInstance.checkSystemRequirements();
    };
    // 获取上下行丢包率
    const getPacketLossRate = () => {
        return state.interactiveInstance.getPacketLossRate();
    };
    // 获取流上下行丢包率
    const getStreamPacketLoss = (options = {}) => {
        return state.interactiveInstance.getStreamPacketLoss(options);
    };
    // 获取房间流信息
    const getRoomStreams = () => {
        return state.interactiveInstance.getRoomStreams();
    };
    // 获取房间总的流信息(本地流加远端流)
    const getRoomInfo = () => {
        return state.interactiveInstance.getRoomInfo();
    };
    // 获取流音频能量
    const getAudioLevel = streamId => {
        return state.interactiveInstance.getAudioLevel(streamId);
    };
    // 获取流的mute状态
    const getStreamMute = streamId => {
        return state.interactiveInstance.getStreamMute(streamId);
    };

    // 获取当前流的信息,返回一个数组
    const currentStreams = () => {
        return state.interactiveInstance.currentStreams;
    };
    // 上麦
    const speakOn = (data = {}) => {
        return requestApi.mic.speakOn(data);
    };

    // 下麦
    const speakOff = (data = {}) => {
        return requestApi.mic.speakOff(data);
    };

    const speakUserOff = (data = {}) => {
        return requestApi.mic.speakUserOff(data);
    };

    // 设置主屏
    const setMainScreen = (data = {}) => {
        return requestApi.interactive.setMainScreen(data);
    };

    // 设置主讲人
    const setSpeaker = (data = {}) => {
        return requestApi.interactive.setSpeaker(data);
    };

    // 设置（麦克风-1 摄像头-2）
    const setRoomDevice = (data = {}) => {
        return requestApi.interactive.setRoomDevice(data);
    };

    // 允许举手
    const setHandsup = (data = {}) => {
        return requestApi.mic.setHandsUp(data);
    };

    // 邀请上麦
    const inviteMic = (data = {}) => {
        return requestApi.mic.inviteMic(data);
    };
    // 取消申请
    const cancelApply = (data = {}) => {
        return requestApi.mic.cancelApply(data);
    };
    // 拒绝邀请
    const refuseInvite = (data = {}) => {
        return requestApi.mic.refuseInvite(data);
    };

    // 组合api
    const startPushStream = () => {
        console.log('state:', state);
        createLocalAndStream(state.interactiveInstance);
    };

    // 创建本地的推流和推流
    const createLocalAndStream = interactive => {
        let camerasList = null,
            micropsList = null,
            videoConstraintsList = null,
            streamId = null;
        return interactive
            .getDevices()
            .then(data => {
                console.log('devices list::', data);
                camerasList = data.videoInputDevices.filter(
                    d => d.label && d.deviceId != 'desktopScreen'
                );
                micropsList = data.audioInputDevices.filter(
                    d => d.deviceId != 'default' && d.deviceId != 'communications' && d.label
                );
            })
            .then(() => {
                const RESOLUTION_REG =
                    /((^VIDEO_PROFILE_(720P|540P|480P|360P)_1$)|(^RTC_VIDEO_PROFILE_(720P|540P|480P|360P)_16x9_M$))/;
                interactive
                    .getVideoConstraints(camerasList[0].deviceId)
                    .then(data => {
                        console.log('constrainList', data);
                        videoConstraintsList = data.filter(item => RESOLUTION_REG.test(item.label));
                    })
                    .then(() => {
                        let params = {
                            videoNode: 'vhall-video',
                            videoDevice: camerasList[0].deviceId,
                            audioDevice: micropsList[0].deviceId,
                            profile: videoConstraintsList[0]
                        };
                        interactive
                            .createLocalVideoStream(params)
                            .then(res => {
                                console.log('create local stream success::', res);
                                state.streamId = res;
                                streamId = res;
                                return res;
                            })
                            .catch(err => {
                                console.log('local stream failed::', err);
                            });
                    })
                    .catch(err => {
                        console.log('constrainlist is failed::', err);
                    });
            })
            .catch(err => {
                console.log('getDevies is failed::', err);
            });
    };

    const pulishStream = streamId => {
        interactive
            .publishStream({ streamId })
            .then(res => {
                console.log('publish stream success::', streamId);
            })
            .catch(err => {
                console.log('publish is failed::', err);
            });
    };

    // 订阅流列表
    const remoteStreamList = () => {
        state.remoteStreams = state.interactiveInstance.getRemoteStreams();
        for (const remoteStream in state.interactiveInstance.getRemoteStreams()) {
            state.remoteStreams.push(remoteStream);
        }
        return state.remoteStreams;
    };

    // sdk的监听事件
    const listenerSdk = () => {
        state.interactiveInstance.on(VhallRTC.EVENT_REMOTESTREAM_ADD, e => {
            // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
            console.log('55555remote stream add info::', e);
            // state.remoteStreams.push(e)
        });
        state.interactiveInstance.on(VhallRTC.EVENT_REMOTESTREAM_REMOVED, e => {
            // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
            console.log('55555remote stream remove info::', e);
            // state.remoteStreams.filter(item => item.streamId == e.streamId)
        });
    };
    return {
        state,
        init,
        destroyInit,
        createLocalStream,
        createLocalVideoStream,
        createLocaldesktopStream,
        createLocalAudioStream,
        createLocalPhotoStream,
        destroyStream,
        publishStream,
        unpublishStream,
        subscribeStream,
        unSubscribeStream,
        setDual,
        muteVideo,
        muteAudio,
        startBroadCast,
        stopBroadCast,
        setBroadCastLayout,
        setBroadCastScreen,
        getDevices,
        getCameras,
        getMicrophones,
        getSpeakers,
        getVideoConstraints,
        isScreenShareSupported,
        checkSystemRequirements,
        getPacketLossRate,
        getRoomStreams,
        remoteStreamList,
        listenerSdk,
        setVideoProfile,
        getStreamPacketLoss,
        getAudioLevel,
        on,
        getRoomInfo,
        getStreamMute,
        setBroadCastAdaptiveLayoutMode,
        speakOn,
        speakOff,
        speakUserOff,
        setMainScreen,
        setSpeaker,
        setRoomDevice,
        setHandsup,
        inviteMic,
        cancelApply,
        refuseInvite,
        currentStreams
    };
}
