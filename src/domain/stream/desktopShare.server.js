import contextServer from "../common/context.server";
export default function useDesktopShareServer(){

    let state = {
        vhallSaasInstance:null
    };


    state.vhallSaasInstance = contextServer.get('roomInitGroupServer').state.vhallSaasInstance;
    const interactiveServer = contextServer.get('interactiveServer');

    //检测浏览器是否支持桌面共享
    const  browserDetection = ()=>{
        const ua = navigator.userAgent;
        const chromeTest = ua.match(/chrome\/([\d\.]+)/i);
        const chromeVersion = chromeTest ? chromeTest[1] : 0;
        const safariTest = ua.match(/Version\/([\d.]+).*Safari/);
        const safariVersion = safariTest ? safariTest[1].replace(/\./g, '') : 0;

        //浏览器是否支持桌面共享
        const isSupport = !chromeVersion && (!safariVersion || Number(safariVersion) < 1304);

        //浏览器是否版本过低，需要安装插件支持
        const needInstallPlugin = Number(chromeVersion) < 74;

        return {isSupport,needInstallPlugin,chromeTest,chromeVersion,safariTest,safariVersion};
    }

    //分享屏幕检测
    const shareScreenCheck = ()=>{
        return new Promise((resolve, reject) => {
            interactiveServer.checkSystemRequirements().then(checkResult => {
                console.log('result', checkResult.result, 'detail', checkResult.detail);
                if (checkResult.result || checkResult.detail.isScreenShareSupported) {
                    resolve(true);
                } else {
                    reject(false);
                }
            });
        });
    }

    /**
     * 停止桌面共享
     * */
    const stopShareScreen = (options={},successFunc,errorFunc)=>{

        return new Promise((resolve,reject)=>{
            state.vhallSaasInstance.unpublish(
                options,
                () => {
                    successFunc();
                    resolve();
                },
                e => {
                    errorFunc();
                    reject();
                }
            );
        });

    }

    return {state,browserDetection,shareScreenCheck};
}
