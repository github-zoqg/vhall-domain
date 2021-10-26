import $http from '@/utils/http.js'


// 设置主屏
const setMainScreen = (params={})=>{
    let retParams = {}
    retParams = Object.assign(retParams,params)

    return $http({
        url:'/v3/interacts/room/set-main-screen',
        type:'POST',
        data:retParams
    })
}

// 设置主讲人
const setSpeaker = (params={})=>{
    let retParams = {}
    retParams = Object.assign(retParams,params)

    return $http({
        url:'/v3/interacts/room/set-doc-permission',
        type:'POST',
        data:retParams
    })
}

// 设置音视频设备开关
const setRoomDevice = (params={})=>{
    let retParams = {}
    retParams = Object.assign(retParams,params)

    return $http({
        url:'/v3/interacts/room/set-device-status',
        type:'POST',
        data:retParams
    })
}

export default {
    setMainScreen,// 设置主屏
    setSpeaker,// 设置主讲人
    setRoomDevice,// 设置音视频设备开关
}