/**
 * @description 用户登录-注册-三方登录
 */
import { login as loginApi } from '@/request/index.js';

export default function useLoginServer() {
  let capInstance, // 云盾实例
    captchaId, // 云盾key
    countDownTimer = null; // 倒计时的计时器

  const state = {
    captchaVal: null, // 云盾图形码
    second: -1, // 倒计时的秒数
    errorMsg: '' // 错误提示
  };

  /**
   * @description 获取易盾的key
   * */
  // TODO: 后续接v4接口
  async function getCaptchaId() {
    captchaId = 'b7982ef659d64141b7120a6af27e19a0'; // 识别
  }

  /**
   * @description 初始化易盾
   * */
  async function initNECaptcha(element = '#codeLoginCaptcha') {
    await getCaptchaId();
    if (!captchaId) {
      console.warn('当前未获取到图形验证captchaId的值，需要后端人员协助');
      return false;
    }
    const NECaptchaOpts = {
      captchaId,
      element,
      mode: 'float',
      width: 270,
      // FIXME: 网易易顿多语言字段 lang 需要翻译(暂时写死)
      lang: 'zh-CN',
      // lang: window.$globalConfig.currentLang || 'zh-CN',
      onReady(instance) {
        console.log('🚀 ~ initNECaptcha onReady ', instance);
        capInstance = instance;
      },
      onVerify(err, data) {
        // 易盾验证(成功or失败)
        if (data) {
          state.captchaVal = data.validate;
        } else {
          state.captchaVal = null;
        }
        if (err) {
          console.error('🚀 ~ initNECaptcha err ', err);
        }
      }
      // onload(instance) {
      //   console.log('🚀 ~ initNECaptcha onload ', instance);
      //   capInstance = instance;
      // }
    };
    console.log(
      '🚀 ~ file: code-login.vue ~ line 243 ~ callCaptcha ~ NECaptchaOpts',
      NECaptchaOpts
    );
    window.initNECaptcha(NECaptchaOpts);
  }

  /**
   * @description 刷新易盾
   * */
  function refreshNECaptha() {
    clearInterval(countDownTimer);
    countDownTimer = null;
    state.second = -1;
    state.captchaVal = null;

    console.log('🚀 ~ file: loginServer.js ~ line 72 ~ refreshNECaptha ~ capInstance', capInstance);
    capInstance?.refresh();
  }

  /**
   * 发送手机短信验证码、邮件验证码
   * @param phoneNum
   * */
  function sendCode(phoneNum) {
    // 开始倒计时
    const startCountDown = () => {
      state.second = 60;
      if (countDownTimer) setInterval(countDownTimer); // 再清除一次防止冲突
      countDownTimer = setInterval(() => {
        state.second--;
        if (state.second <= 0) {
          refreshNECaptha();
        }
      }, 1000);
    };
    const failure = res => {
      state.errorMsg = res.msg;
      refreshNECaptha();
    };
    const params = {
      data: phoneNum,
      type: 1, // 1手机  2邮箱,
      validate: state.captchaVal, // 图形验证码数据
      scene_id: 7 // scene_id场景ID：1账户信息-修改密码  2账户信息-修改密保手机 3账户信息-修改关联邮箱 4忘记密码-邮箱方式找回 5忘记密码-短信方式找回 6提现绑定时手机号验证 7快捷方式登录（短信验证码登录） 8注册-验证码
    };
    return loginApi
      .sendCode(params)
      .then(res => {
        if (res.code === 200) {
          startCountDown();
        } else {
          failure(res);
        }
        return res;
      })
      .catch(err => {
        failure(err);
        return err;
      });
  }

  /**
   * 登录
   * 组织参数(校验)
   * /v3/users/user-consumer/login
   * */
  function userLogin(params) {
    // 登录失败,清空缓存信息
    const failure = res => {
      console.warn('获取C端登录后用户信息失败', res);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // 刷新易盾
      refreshNECaptha();
    };
    return loginApi
      .userLogin(params)
      .then(res => {
        if (res.code === 200) {
          localStorage.setItem('token', res.data.token || '');
          localStorage.setItem('userInfo', JSON.stringify(res.data));
        } else {
          failure(res);
        }
        return res;
      })
      .catch(err => {
        failure(err);
        return err;
      });
  }

  /**
   * 跳转到qq授权登录链接、跳转到微信授权登录链接
   * /v3/users/oauth/callback
   * */
  function authLogin() {}

  /**
   * 微信浏览器微信授权登录
   * /v3/commons/auth/weixin
   * */
  function authLoginByWx() {}

  /**-----------------------  以下是否B端接口?  -----------------------**/

  /**
   * 校验验证码,获取验证码（图形验证码）
   * /v3/users/code-consumer/send
   * */
  function getGraphCode() {}

  /**
   * 校验手机验证码、邮件验证码
   * /v3/users/code/check
   * */
  function checkCode() {}

  /**
   * 登录状态检查
   * /v3/users/user/login-check
   * */
  function loginCheck() {}

  /**
   * 获取手机短信验证码
   * /v3/users/user/get-key-login
   * */
  function getKeyLogin() {}

  /**
   * 重置密码
   * /v3/users/user/reset-password
   * */
  function resetPassword() {}

  /**
   * 注册
   * /v3/users/user-consumer/register
   * */
  function register() {}

  /**
   * 角度口令登录
   * /v3/webinars/live/role-login
   * */
  function roleLogin() {}

  return {
    state,
    initNECaptcha,
    refreshNECaptha,
    getGraphCode,
    userLogin,
    authLogin,
    loginCheck,
    getKeyLogin,
    sendCode,
    checkCode,
    resetPassword,
    register,
    authLoginByWx,
    roleLogin
  };
}
