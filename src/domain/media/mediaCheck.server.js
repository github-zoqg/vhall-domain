import contextServer from '@/domain/common/context.server.js';

export default function useMediaCheckServer() {
    const state = {
        videoNode: 'vh-device-check-video', // 视频容器
        selectedVideoDeviceId: '', // 当前选取的设备id
        localStreamId: '' // 本地流id
    };

    const init = (opt = {}) => {
        state.videoNode = opt.videoNode || 'vh-device-check-video';
        state.selectedVideoDeviceId =
            opt.selectedVideoDeviceId === undefined ? opt.selectedVideoDeviceId : '';
        state.localStreamId = opt.localStreamId === undefined ? opt.localStreamId : '';
    };

    const setVideoNode = videoNode => {
        state.videoNode = videoNode;
    };

    const setSelectedVideoDeviceId = selectedVideoDeviceId => {
        state.selectedVideoDeviceId = selectedVideoDeviceId;
    };

    // 开始视频预览
    const startPreviewVideo = (opts = {}) => {
        const originalOpts = {
            videoNode: state.videoNode, // 传入本地视频显示容器，必填
            audio: false, // 是否获取音频，选填，默认为true
            videoDevice: state.selectedVideoDeviceId,
            profile: VhallRTC.RTC_VIDEO_PROFILE_240P_16x9_M
        };
        const options = Object.assign({ ...originalOpts }, { ...opts });
        return new Promise((resolve, reject) => {
            const success = res => {
                resolve(res);
            };
            const failure = error => {
                reject(error);
            };
            window.VhallRTC.startPreview(options, success, failure);
        });
    };

    // 结束视频预览
    const stopPreviewVideo = streamId => {
        const id = streamId || state.localStreamId;
        return new Promise((resolve, reject) => {
            const success = res => {
                resolve(res);
            };
            const failure = error => {
                reject(error);
            };
            window.VhallRTC.stopPreview({ streamId: id }, success, failure);
        });
    };

    init();

    return {
        state,
        init,
        setVideoNode,
        setSelectedVideoDeviceId,
        startPreviewVideo,
        stopPreviewVideo,
        getDevices: window.VhallRTC.getDevices,
        getVideoConstraints: window.VhallRTC.getVideoConstraints
    };
}
