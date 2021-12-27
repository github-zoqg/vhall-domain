import requestApi from '../../request';

export default function useMicServer() {
    let state = {};

    // 上麦
    function speakOn(data = {}) {
        return requestApi.mic.speakOn(data);
    }

    // 下麦
    function speakOff(data = {}) {
        return requestApi.mic.speakOff(data);
    }

    function speakUserOff(data = {}) {
        return requestApi.mic.speakUserOff(data);
    }

    // 允许举手
    function setHandsUp(data = {}) {
        return requestApi.mic.setHandsUp(data);
    }
    // 允许上麦
    function allowSpeak(data = {}) {
        return requestApi.mic.allowSpeak(data);
    }
    // 邀请上麦
    function inviteMic(data = {}) {
        return requestApi.mic.inviteMic(data);
    }
    // 取消申请
    function cancelApply(data = {}) {
        return requestApi.mic.cancelApply(data);
    }
    // 拒绝邀请
    function refuseInvite(data = {}) {
        return requestApi.mic.refuseInvite(data);
    }

    return {
        state,
        speakOn,
        speakOff,
        speakUserOff,
        allowSpeak,
        setHandsUp,
        inviteMic,
        cancelApply,
        refuseInvite
    };
}
