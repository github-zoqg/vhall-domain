import request from '@/utils/http.js';

// 账号登录&&验证码登录
const loginInfo = (params = {}) => {
  return request({
    url: '/v3/users/user-consumer/login',
    method: 'POST',
    data: params
  });
};

// 第三方授权
const callbackUserInfo = (params = {}) => {
  return request({
    url: '/v3/users/oauth/callback',
    method: 'POST',
    data: params
  });
};

// 注册
const register = (params = {}) => {
  return request({
    url: '/v3/users/user-consumer/register',
    method: 'POST',
    data: params
  });
};

// 手机||邮箱验证码
const codeCheck = (params = {}) => {
  return request({
    url: '/v3/users/code-consumer/check',
    method: 'POST',
    data: params
  });
};

// 密码重置
const resetPassword = (params = {}) => {
  return request({
    url: '/v3/users/user-consumer/reset-password',
    method: 'POST',
    data: params
  });
};

const userBase = {
  loginInfo,
  callbackUserInfo,
  register,
  codeCheck,
  resetPassword
};

export default userBase;
