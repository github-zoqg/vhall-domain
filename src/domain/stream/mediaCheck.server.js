import contextServer from "@/domain/common/context.server.js";

// 业务功能: 1.获取设备列表(继承interactiveServer-getDevices) / 2.本地预览 / 3.停止预览  /  4.获取清晰度(继承interactiveServer-getVideoConstraints)

export default function useMediaCheckServer() {
    let interactiveServer = null

    const state = {
        videoNode: "vh-device-check-video", // 视频容器
        selectedVideoDeviceId: "", // 当前选取的设备id
        localStreamId: "" // 本地流id
    }

    const init = (opt= {}) => {
        state.videoNode = opt.videoNode || "vh-device-check-video"
        state.selectedVideoDeviceId = opt.selectedVideoDeviceId === undefined ? opt.selectedVideoDeviceId : ""
        state.localStreamId = opt.localStreamId === undefined ? opt.localStreamId : ""
        interactiveServer = contextServer.get("interactiveServer")

    }

    const setVideoNode = (videoNode) => {
        state.videoNode = videoNode
    }

    const setSelectedVideoDeviceId = (selectedVideoDeviceId) => {
        state.selectedVideoDeviceId = selectedVideoDeviceId
    }

    // 开始视频预览
    const startPreviewVideo = (opts = {}) => {
        const originalOpts = {
            videoNode: state.videoNode, // 传入本地视频显示容器，必填
            audio: false, // 是否获取音频，选填，默认为true
            videoDevice: state.selectedVideoDeviceId,
            profile: VhallRTC.RTC_VIDEO_PROFILE_240P_16x9_M
        }
        const options = Object.assign(
            ...originalOpts,
            ...opts
        )
        return interactiveServer.createLocalVideoStream(options).then(streamId => {
            state.localStreamId = streamId
            return streamId
        })
    }

    // 结束视频预览
    const stopPreviewVideo = (streamId) => {
        const id = streamId || state.localStreamId
        return interactiveServer.stopStream(id).then(() => {
            setVideoNode("");
            return state.localStreamId
        })
    }

    init()

    return {
        state,
        init,
        setVideoNode,
        setSelectedVideoDeviceId,
        startPreviewVideo,
        stopPreviewVideo,
        getDevices: interactiveServer.getDevices,
        getVideoConstraints: interactiveServer.getVideoConstraints
    }
}
