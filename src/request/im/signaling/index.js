import request from '@/utils/http.js';
import env from '../../env';
/**
 * 发起端-设置房间举手状态
 * */
function setHandsUp(params = {}) {
  return request({
    url: '/v3/interacts/inav/set-handsup',
    method: 'POST',
    data: params
  });
}

/**
 * 观看端-用户举手申请上麦
 * */
function userApply(params = {}) {
  return request({
    url: '/v3/interacts/inav-user/apply',
    method: 'POST',
    data: params
  });
}

/**
 * 观看端-用户上麦
 * */
const userSpeakOn = (params = {}) => {
  return request({
    url: '/v3/interacts/inav-user/speak',
    method: 'POST',
    data: params
  });
};

/**
 * 观看端-用户取消申请上麦
 * */
function userCancelApply(params = {}) {
  return request({
    url: '/v3/interacts/inav-user/cancel-apply',
    method: 'POST',
    data: params
  });
}

/**
 * 发起端-允许（同意）用户上麦
 * */
function hostAgreeApply(params = {}) {
  return request({
    url: '/v3/interacts/inav/agree-apply',
    method: 'POST',
    data: params
  });
}

/**
 * 发起端-拒绝用户上麦
 * */
function hostRejectApply(params = {}) {
  return request({
    url: '/v3/interacts/inav/reject-apply',
    method: 'POST',
    data: params
  });
}

/**
 * 观看端-用户上麦（接受邀请）
 * */
function userSpeak(params = {}) {
  return request({
    url: '/v4/interacts/inav/user-speak',
    method: 'POST',
    data: params
  });
}

/**
 * 发起端/观看端-用户下麦
 * */
function userSpeakOff(params = {}) {
  return request({
    url: '/v3/interacts/inav-user/nospeak',
    method: 'POST',
    data: params
  });
}

/**
 * 发起端-邀请用户上麦
 * */
function hostInviteUser(params = {}) {
  return request({
    url: env.imChat === 'v3'?'/v3/interacts/inav/invite':'/v4/interacts/inav/invite',
    method: 'POST',
    data: params
  });
}

/**
 * 观看端-用户同意上麦邀请
 * */
function userAgreeInvite(params = {}) {
  return request({
    url: '/v3/interacts/inav-user/agree-invite',
    method: 'POST',
    data: params
  });
}

/**
 * 观看端-用户拒绝上麦邀请
 * */
function userRejectInvite(params = {}) {
  return request({
    url: '/v3/interacts/inav-user/reject-invite',
    method: 'POST',
    data: params
  });
}

/**
 * 发起端-获取当前上麦用户列表
 * */
function getSpeakList(params = {}) {
  return request({
    url: '/v4/interacts/inav/get-speak-list',
    method: 'POST',
    data: params
  });
}

/**
 * 用户上麦并开始演示
 * */
function userPresentation(params = {}) {
  return request({
    url: '/v4/interacts/inav/user-presentation',
    method: 'POST',
    data: params
  });
}

/**
 * 发起端-结束用户演示
 * */
function endUserPresentation(params = {}) {
  return request({
    url: '/v3/interacts/inav/nopresentation',
    method: 'POST',
    data: params
  });
}

/**
 * 观看端-用户结束演示
 * */
function userEndPresentation(params = {}) {
  return request({
    url: '/v4/interacts/inav/user-nopresentation',
    method: 'POST',
    data: params
  });
}

/**
 * 发起端-预下麦
 * */
function preBreakSpeak(params = {}) {
  return request({
    url: '/v4/interacts/inav/pre-break-speak',
    method: 'POST',
    data: params
  });
}

/**
 * 观看端-无法上麦
 * */
function userUnableSpeak(params = {}) {
  return request({
    url: '/v4/interacts/inav/user-unable-speak',
    method: 'POST',
    data: params
  });
}

export default {
  setHandsUp,
  userApply,
  userCancelApply,
  hostAgreeApply,
  // hostRejectApply,
  // userSpeak,
  userSpeakOff,
  hostInviteUser,
  userAgreeInvite,
  userRejectInvite,
  // getSpeakList,
  // userPresentation,
  // endUserPresentation,
  // userEndPresentation,
  // preBreakSpeak,
  // userUnableSpeak,
  userSpeakOn
};
