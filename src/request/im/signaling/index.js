import $http from '@/utils/http.js';
/**
 * 发起端-设置房间举手状态
 * */
function setHandsUp(params = {}) {
  return $http({
    url: '/v4/interacts/inav/set-handsup',
    type: 'POST',
    data: params
  });
}

/**
 * 观看端-用户举手申请上麦
 * */
function userApply(params = {}) {
  return $http({
    url: '/v4/interacts/inav/user-apply',
    type: 'POST',
    data: params
  });
}

/**
 * 观看端-用户取消申请上麦
 * */
function userCancelApply(params = {}) {
  return $http({
    url: '/v4/interacts/inav/user-cancel-apply',
    type: 'POST',
    data: params
  });
}

/**
 * 发起端-允许（同意）用户上麦
 * */
function hostAgreeApply(params = {}) {
  return $http({
    url: '/v4/interacts/inav/agree-apply',
    type: 'POST',
    data: params
  });
}

/**
 * 发起端-拒绝用户上麦
 * */
function hostRejectApply(params = {}) {
  return $http({
    url: '/v4/interacts/inav/reject-apply',
    type: 'POST',
    data: params
  });
}

/**
 * 观看端-用户上麦（接受邀请）
 * */
function userSpeak(params = {}) {
  return $http({
    url: '/v4/interacts/inav/user-speak',
    type: 'POST',
    data: params
  });
}

/**
 * 发起端&观看端-用户下麦
 * */
function userNoSpeak(params = {}) {
  return $http({
    url: '/v4/interacts/inav/nospeak',
    type: 'POST',
    data: params
  });
}

/**
 * 发起端-邀请用户上麦
 * */
function hostInviteUser(params = {}) {
  return $http({
    url: '/v4/interacts/inav/invite',
    type: 'POST',
    data: params
  });
}

/**
 * 观看端-用户同意上麦邀请
 * */
function userAgreeInvite(params = {}) {
  return $http({
    url: '/v4/interacts/inav/user-agree-invite',
    type: 'POST',
    data: params
  });
}

/**
 * 观看端-用户拒绝上麦邀请
 * */
function userRejectInvite(params = {}) {
  return $http({
    url: '/v4/interacts/inav/user-reject-invite',
    type: 'POST',
    data: params
  });
}

/**
 * 发起端-获取当前上麦用户列表
 * */
function getSpeakList(params = {}) {
  return $http({
    url: '/v4/interacts/inav/get-speak-list',
    type: 'POST',
    data: params
  });
}

/**
 * 用户上麦并开始演示
 * */
function userPresentation(params = {}) {
  return $http({
    url: '/v4/interacts/inav/user-presentation',
    type: 'POST',
    data: params
  });
}

/**
 * 发起端-结束用户演示
 * */
function endUserPresentation(params = {}) {
  return $http({
    url: '/v3/interacts/inav/nopresentation',
    type: 'POST',
    data: params
  });
}

/**
 * 观看端-用户结束演示
 * */
function userEndPresentation(params = {}) {
  return $http({
    url: '/v4/interacts/inav/user-nopresentation',
    type: 'POST',
    data: params
  });
}

/**
 * 发起端-预下麦
 * */
function preBreakSpeak(params = {}) {
  return $http({
    url: '/v4/interacts/inav/pre-break-speak',
    type: 'POST',
    data: params
  });
}

/**
 * 观看端-无法上麦
 * */
function userUnableSpeak(params = {}) {
  return $http({
    url: '/v4/interacts/inav/user-unable-speak',
    type: 'POST',
    data: params
  });
}

export default {
  setHandsUp,
  userApply,
  userCancelApply,
  hostAgreeApply,
  hostRejectApply,
  userSpeak,
  userNoSpeak,
  hostInviteUser,
  userAgreeInvite,
  userRejectInvite,
  getSpeakList,
  userPresentation,
  endUserPresentation,
  userEndPresentation,
  preBreakSpeak,
  userUnableSpeak
};
