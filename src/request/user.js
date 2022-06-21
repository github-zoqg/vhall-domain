/**
 * @description 用户/登录-注册相关接口
 */
import request from '@/utils/http.js';
import env from './env';

const biz_id = 2; // TODO: 目前只有化蝶使用,后续联调中台接口处理

// 获取易盾配置
const getCapthaKey = (params = {}) => {
  const capthaKey = 'b7982ef659d64141b7120a6af27e19a0';
  return Promise.resolve(capthaKey);
};

// 发送验证码(c端)
const sendCode = (params = {}) => {
  const retParmams = {
    type: 1,
    scene_id: 7,
    biz_id: biz_id,
    ...params
  };
  if (biz_id === 4) {
    retParmams.validate_type = 2; // 知客的交互方式不同
  }
  return request({
    url: env.user === 'v3' ? '/v3/users/code-consumer/send' : '/v4/ucenter-login-reg/code/send',
    method: 'POST',
    data: retParmams
  });
};

// 登录(c端)
const userLogin = (params = {}, withCookie = false) => {
  return request({
    url:
      env.user === 'v3' ? '/v3/users/user-consumer/login' : '/v4/ucenter-login-reg/consumer/login',
    method: 'POST',
    data: params,
    withCredentials: withCookie
  });
};

// 账号检查(c端)
const loginCheck = (params = {}) => {
  return request({
    url:
      env.user === 'v3'
        ? '/v3/users/user/login-check'
        : '/v4/ucenter-login-reg/user-check/login-check',
    method: 'POST',
    data: params
  });
};

// 获取登录秘钥
function getKeyLogin() {
  return request({
    url:
      env.user === 'v3'
        ? '/v3/users/user/get-key-login'
        : '/v4/ucenter-login-reg/safe/get-key-login',
    method: 'POST'
  });
}

// 注册
const register = (params = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/users/user-consumer/register' : '',
    method: 'POST',
    data: {
      biz_id: biz_id,
      ...params
    }
  });
};

// 账号登录&&验证码登录
const loginInfo = (params = {}) => {
  return request({
    url:
      env.user === 'v3' ? '/v3/users/user-consumer/login' : '/v4/ucenter-login-reg/consumer/login',
    method: 'POST',
    data: params
  });
};

// 退出登录
const loginOut = (params = {}, withCookie = false) => {
  return request({
    url: env.user === 'v3' ? '/v3/users/user/logout' : '/v4/meeting/live/role-logout',
    method: 'POST',
    data: params,
    withCredentials: withCookie // 携带cookie
  });
};

// 角色退出
const loginRoleOut = (params = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/webinars/live/role-logout' : '',
    method: 'POST',
    data: params
  });
};


// 第三方授权
const oauthCallback = (params = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/users/oauth/callback' : '/v4/ucenter-login-reg/oauth/callback',
    method: 'POST',
    data: params
  });
};

//微信授权接口获取
const authWeixinAjax = (params = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/commons/auth/weixin-ajax' : '',
    method: 'GET',
    params: params
  });
};

// 手机||邮箱验证码
const codeCheck = (params = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/users/code-consumer/check' : '/v4/ucenter-login-reg/code/check',
    method: 'POST',
    data: { biz_id, ...params }
  });
};

// 密码重置
const resetPassword = (params = {}) => {
  return request({
    url:
      env.user === 'v3'
        ? '/v3/users/user-consumer/reset-password'
        : '/v4/ucenter-b/business/reset-password',
    method: 'POST',
    data: params
  });
};

// 获取用户信息
const getUserInfo = (data = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/users/user-consumer/get-info' : '/v4/ucenter-b/business/get-info',
    method: 'POST',
    data: { biz_id, ...data }
  });
};

// 更换用户头像
const changeAvatarSend = (data = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/users/user-consumer/edit' : '/v4/ucenter-b/business/edit',
    method: 'POST',
    data: { biz_id, ...data }
  });
};

// 替换昵称
const editUserNickName = (data = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/users/user-consumer/edit' : '/v4/ucenter-b/business/edit',
    method: 'POST',
    data: { biz_id, ...data }
  });
};

// 第三方解除绑定
const thirdUnbind = (data = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/users/oauth/unbind' : '/v4/ucenter-login-reg/oauth/unbind',
    method: 'POST',
    data: { biz_id, ...data }
  });
};

// 绑定手机号
const bindInfo = (data = {}) => {
  return request({
    url:
      env.user === 'v3' ? '/v3/users/user-consumer/bind-info' : '/v4/ucenter-c/consumer/bind-info',
    method: 'POST',
    data: { biz_id, ...data }
  });
};

//通用上传图片
const uploadImage = (data = {}) => {
  return request({
    url: env.user === 'v3' ? '/v3/commons/upload/index' : '/v3/commons/upload/index',
    method: 'POST',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

//口令登录
function roleLogin(params = {}) {
  return request({
    url: env.user === 'v3' ? '/v3/webinars/live/role-login' : '/v4/meeting/live/role-login',
    method: 'GET',
    params: params
  });
}

// sso自动登录
function ssoAutoLogin(data = {}, withCookie = true) {
  return request({
    url: '/v3/users/user/auto-login',
    method: 'POST',
    data: {
      biz_id,
      ...data
    },
    withCredentials: withCookie // 默认携带cookie
  });
}


export default {
  getCapthaKey,
  sendCode,
  userLogin,
  loginCheck,
  register,
  getKeyLogin,
  loginInfo,
  loginOut,
  loginRoleOut,
  oauthCallback,
  codeCheck,
  resetPassword,
  getUserInfo,
  changeAvatarSend,
  editUserNickName,
  thirdUnbind,
  bindInfo,
  uploadImage,
  roleLogin,
  authWeixinAjax,
  ssoAutoLogin
};
