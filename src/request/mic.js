import $http from '@/utils/http.js'

// 允许上下麦
const allowSpeak = (params={})=>{
    const retParams = {}

    return $http({
        url:'/v3/interacts/inav/agree-apply',
        type:'POST',
        data:retParams
    })
}


// 用户上麦
const speakOn = (params = {}) => {
    const retParmams = {
    }

    return $http({
        url: '/v3/interacts/inav-user/speak',
        type: 'POST',
        data: retParmams
    })
}

// 用户自己下麦
const speakOff = (params = {})=>{
    const retParams = {}

    return $http({
        url:'/v3/interacts/inav-user/nospeak',
        type:'POST',
        data:retParams
    })
}

// 设置其他人下麦
const speakUserOff = (params={})=>{
    const retParams = {}

    return $http({
        url:'/v3/interacts/inav/nospeak',
        type:'POST',
        data:retParams
    })
}


// 允许举手
const setHandsup = (params={})=>{
    const retParams = {}

    return $http({
        url:'/v3/interacts/inav-user/nospeak',
        type:'POST',
        data:retParams
    })
}

// 邀请上麦
const inviteMic = (params={})=>{
    const retParams = {}

    return $http({
        url:'/v3/interacts/inav/invite',
        type:'POST',
        data:retParams
    })
}


// 取消申请
const cancelApply = (params={})=>{
    const retParams = {}

    return $http({
        url:'/v3/interacts/inav-user/nospeak',
        type:'POST',
        data:retParams
    })
}

// 拒绝邀请上麦
const refuseInvite = (params={})=>{
    const retParams = {}

    return $http({
        url:'/v3/interacts/inav-user/reject-invite',
        type:'POST',
        data:retParams
    })
}

export default {
    allowSpeak,// 允许上麦
    speakOn,// 用户上麦
    speakOff,// 用户下麦
    speakUserOff,// 设置其他人下麦
    inviteMic,// 邀请上麦
    setHandsup,// 允许举手
    cancelApply,// 取消申请
    refuseInvite// 拒绝邀请上麦
}