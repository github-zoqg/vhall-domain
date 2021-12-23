import contextServer from "../common/context.server";
export default function useDesktopShareServer(){

    const state = { localDesktopStreamId: '' }

    const interactiveServer = contextServer.get('interactiveServer');

    //检测浏览器是否支持桌面共享
    const  browserDetection = ()=>{
        const ua = navigator.userAgent;
        const chromeTest = ua.match(/chrome\/([\d\.]+)/i);
        const chromeVersion = chromeTest ? chromeTest[1] : 0;
        const safariTest = ua.match(/Version\/([\d.]+).*Safari/);
        const safariVersion = safariTest ? safariTest[1].replace(/\./g, '') : 0;

        //浏览器是否支持桌面共享
        const isNotSupport = !chromeVersion && (!safariVersion || Number(safariVersion) < 1304);

        //浏览器是否版本过低，需要安装插件支持
        const needInstallPlugin = Number(chromeVersion) < 74;

        return {isNotSupport,needInstallPlugin,chromeTest,chromeVersion,safariTest,safariVersion};
    }

    //分享屏幕检测
    const shareScreenCheck = ()=>{
        return new Promise((resolve, reject) => {
            interactiveServer.checkSystemRequirements().then(checkResult => {
                console.log('result',checkResult, checkResult.result, 'detail', checkResult.detail);
                if ((checkResult.result || checkResult.detail.isScreenShareSupported) && !(navigator.userAgent.indexOf('Firefox') > 0)) {
                    resolve(true);
                } else {
                    reject(false);
                }
            });
        });
    }

    // 开始桌面共享
    const startShareScreen = (options) => {

        const { state: roomBaseServerState } = contextServer.get('roomBaseServer')

        const retOptions = {
            videoNode: options.videoNode,
            profile: options.profile,
            audio: false, // 桌面共享不采集麦克风防止回声
            speaker: true, // 桌面共享开启采集扬声器声音的入口
        }

        const addConfig = {
            videoDevice: 'desktopScreen',
            attributes: JSON.stringify({
                nickName: roomBaseServerState.watchInitData.join_info.nickname,
                role: roomBaseServerState.watchInitData.join_info.role_name
            })
        }

        return interactiveServer.createLocaldesktopStream(retOptions, addConfig)
    }

    // 推桌面共享流
    const publishDesktopShareStream = (streamId) => {
        return new Promise((resolve, reject) => {
            interactiveServer.publishStream({streamId}).then(res => {
                state.localDesktopStreamId = streamId
                resolve(res)
            }).catch(reject)
        })
    }

    /**
     * 停止桌面共享
     * */
    const stopShareScreen = (streamId)=>{
        return interactiveServer.unpublishStream(streamId || state.localDesktopStreamId);
    }

    return {state,browserDetection,shareScreenCheck,startShareScreen,publishDesktopShareStream,stopShareScreen};
}
