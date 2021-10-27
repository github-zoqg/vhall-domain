import requestApi from "../../request";

export default function useMicServer() {
    const state = {}
    
    // 上麦
    const speakOn=(data={})=>{
        return requestApi.mic.speakOn(data)
    }

    // 下麦
    const speakOff=(data={})=>{
        return requestApi.mic.speakOff(data)
    }

    const speakUserOff=(data={})=>{
        return requestApi.interactive.speakUserOff(data)
    }

    // 允许举手
    const setHandsup = (data={})=>{
        return requestApi.mic.setHandsUp(data)
    }

    // 邀请上麦
    const inviteMic = (data={})=>{
        return requestApi.mic.inviteMic(data)
    }
    // 取消申请
    const cancelApply = (data={})=>{
        return requestApi.mic.cancelApply(data)
    }
    // 拒绝邀请
    const refuseInvite = (data={})=>{
        return requestApi.mic.refuseInvite(data)
    }

    return { state, speakOn, speakOff, speakUserOff, setHandsup, inviteMic, cancelApply, refuseInvite}
}