import { mic } from '../../request';

export default function useMicServer() {
  let state = {};

  // 上麦
  function speakOn(data = {}) {
    return mic.speakOn(data);
  }

  // 下麦
  function speakOff(data = {}) {
    return mic.speakOff(data);
  }

  function speakUserOff(data = {}) {
    return mic.speakUserOff(data);
  }

  // 允许举手
  function setHandsUp(data = {}) {
    return mic.setHandsUp(data);
  }
  // 允许上麦
  function allowSpeak(data = {}) {
    return mic.allowSpeak(data);
  }
  // 邀请上麦
  function inviteMic(data = {}) {
    return mic.inviteMic(data);
  }
  // 取消申请
  function cancelApply(data = {}) {
    return mic.cancelApply(data);
  }
  // 拒绝邀请
  function refuseInvite(data = {}) {
    return mic.refuseInvite(data);
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
