export default function useInteractiveServer() {
    let state = {
        vhallSaasInstance: null
    }
    let interactive = null
    const init = (option) => {
        const vhallSaasInstance = new window.VhallSaasSDK()
        console.log('vhallSaasInstance',vhallSaasInstance);
        state.vhallSaasInstance = vhallSaasInstance
        // addToContext()
        // return getWatchInitData(option).then(res => {
        //     initSubServer()
        //     return res
        // })
    }
    const startPushStream = ()=> {
        console.log('2222222');
        const vhallSaasInstance = new window.VhallSaasSDK()
        console.log('vhallSaasInstance',vhallSaasInstance);
        state.vhallSaasInstance = vhallSaasInstance
        vhallSaasInstance.createInteractive().then((res)=>{
            interactive = res
            setTimeout(()=>{
                createLocalVideoStream(interactive)
            },5000)
        })
        console.log('2223333333',vhallSaasInstance.createInteractive());
        
    }
    const createLocalVideoStream = (interactive) => {
        let camerasList = null,micropsList = null,videoConstraintsList = null
        console.log('33333333333333333333',interactive);
        interactive.getDevices().then((data)=>{
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
            })
            console.log('videoConstraintsList list::',videoConstraintsList);
        }).then(()=>{
            let params = {
                videoNode:'vhall-video',
                videoDevice: camerasList[0].deviceId,
                audioDevice: micropsList[0].deviceId,
                profile: videoConstraintsList[0]
            }
            interactive.createLocalVideoStream(params).then((res)=>{
                console.log('create local stream success::', res);
                streamId = res
  
            })
        })
    }
    const result = { state, startPushStream }
    return { state, startPushStream ,init}

}