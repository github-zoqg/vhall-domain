/**
 * @description 登录注册相关接口
 * @param {*} [params={}]
 * @return {*}
 */

import request from '@/utils/http.js';

const biz_id = 2; // FIXME: 写死后续动态配置
// 查询活动配置信息
const getCapthaKey = (params = {}) => {
  const capthaKey = 'b7982ef659d64141b7120a6af27e19a0';
  return Promise.resolve(capthaKey);
  // return request({
  //   url: '/v3/users/permission/get-config-list',
  //   type: 'POST',
  //   data: retParmams
  // });
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
  console.log('🚀 ~ file: index.js ~ line 29 ~ sendCode ~ retParmams', retParmams);

  return request({
    url: '/v3/users/code-consumer/send',
    method: 'POST',
    data: retParmams
  });
};

// 发送验证码(c端)
const userLogin = (params = {}) => {
  // const params = {
  //   phone: this.ruleForm.phone,  // 手机号
  //   code: this.ruleForm.captchas, // 动态密码【快捷登录（短信验证码登录）必传】
  //   remember: Number(this.autoLoginStatus) // 自动登录
  // };
  // if (this.options.visitorId) {
  //   params.visitor_id = this.options.visitorId; // 游客id 登录方式为账号密码或者手机号验证码方式，如果传入游客ID会将访客和登录账户进行绑定
  // }
  const retParmams = {
    // way: 2, // 手机号验证码登录
    ...params
  };
  return request({
    url: '/v3/users/user-consumer/login',
    method: 'POST',
    data: retParmams
  });
};

export default {
  getCapthaKey,
  sendCode,
  userLogin
};
