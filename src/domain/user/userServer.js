/**
 * @description 用户登录-注册-三方登录
 */
import { user as userApi } from '@/request/index.js';

class UserServer {
  static getInstance() {
    if (!UserServer.instance) {
      UserServer.instance = new UserServer();
    }
    return UserServer.instance;
  }
  constructor() {
    this.capInstance = null; // 云盾实例
    this.captchaId = null; // 云盾key
    this.countDownTimer = null; // 倒计时的计时器
    this.state = {
      captchaVal: null, // 云盾图形码
      second: -1, // 倒计时的秒数
      capErrorMsg: '', // 错误提示
      userInfo: null, // 用户信息
      thirdInfo: {} // 第三方授权绑定的信息 从userInfo拆分的
    };
  }

  /**
   * @description 获取易盾的key
   * */
  // TODO: 后续接v4接口
  async getCaptchaId() {
    this.captchaId = 'b7982ef659d64141b7120a6af27e19a0'; // 识别
    return new Promise((resolve, reject) => {
      resolve(this.captchaId);
    });
  }

  /**
   * @description 初始化易盾
   * */
  async initNECaptcha(element = '#codeLoginCaptcha') {
    await this.getCaptchaId();
    if (!this.captchaId) {
      console.warn('当前未获取到图形验证this.captchaId的值，需要后端人员协助');
      return false;
    }
    const that = this;
    const NECaptchaOpts = {
      captchaId: this.captchaId,
      element,
      mode: 'float',
      // FIXME: 网易易顿多语言字段 lang 需要翻译(暂时写死)
      lang: 'zh-CN',
      // lang: window.$globalConfig.currentLang || 'zh-CN',
      onReady(instance) {
        console.log('🚀 ~ initNECaptcha onReady ', instance);
        that.capInstance = instance;
        that.refreshNECaptha(false); // 方式多个模块之间计时器互相影响
      },
      onVerify(err, data) {
        // 易盾验证(成功or失败)
        if (data) {
          that.state.captchaVal = data.validate;
        } else {
          that.state.captchaVal = null;
        }
        if (err) {
          console.error('🚀 ~ initNECaptcha err ', err);
        }
      }
      // onload(instance) {
      //   console.log('🚀 ~ initNECaptcha onload ', instance);
      //   this.capInstance = instance;
      // }
    };
    window.initNECaptcha(NECaptchaOpts);
  }
  /**
   * @description 刷新易盾
   * */
  refreshNECaptha(refreshInstance = true) {
    clearInterval(this.countDownTimer);
    this.countDownTimer = null;
    this.state.second = -1;
    this.state.captchaVal = null;
    refreshInstance && this.capInstance?.refresh();
  }

  /**
   * 发送手机短信验证码、邮件验证码
   * @param phoneNum
   * */
  sendCode(phoneNum, sceneId = 7) {
    // 开始倒计时
    const startCountDown = () => {
      this.state.second = 60;
      if (this.countDownTimer) setInterval(this.countDownTimer); // 再清除一次防止冲突
      this.countDownTimer = setInterval(() => {
        this.state.second--;
        if (this.state.second <= 0) {
          this.refreshNECaptha();
        }
      }, 1000);
    };
    const failure = res => {
      this.state.capcapErrorMsg = res.msg;
      this.refreshNECaptha();
    };
    const params = {
      data: phoneNum,
      type: 1, // 1手机  2邮箱,
      validate: this.state.captchaVal, // 图形验证码数据
      scene_id: sceneId // scene_id场景ID：1账户信息-修改密码  2账户信息-修改密保手机 3账户信息-修改关联邮箱 4忘记密码-邮箱方式找回 5忘记密码-短信方式找回 6提现绑定时手机号验证 7快捷方式登录（短信验证码登录） 8注册-验证码
    };
    return userApi
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
  userLogin(params) {
    // 登录失败,清空缓存信息
    const failure = res => {
      console.warn('获取C端登录后用户信息失败', res);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // 刷新易盾
      this.refreshNECaptha();
    };
    return userApi
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
   * 登录状态检查
   * */
  loginCheck(account) {
    return userApi.loginCheck({
      account,
      channel: 'C' // B端用户还是C端用户
    });
  }

  /**
   * 明文密码加密
   * */
  handleEncryptPassword(password, publicKey) {
    let retPassword = '';
    const encryptor = new window.JSEncrypt(); // 新建JSEncrypt对象(依赖在中台导入)
    // 设置公钥
    encryptor.setPublicKey(publicKey);
    // 加密数据
    retPassword = encryptor.encrypt(password);
    retPassword = retPassword.replace(/\+/g, '-').replace(/\//g, '_');
    while (retPassword[retPassword.length - 1] === '=') {
      retPassword = retPassword.substr(0, retPassword.length - 1);
    }
    return retPassword;
  }
  /**
   * 明文密码加密
   * */
  async handlePassword(password) {
    const getKeyRelt = await userApi.getKeyLogin();
    if (getKeyRelt.code !== 200) {
      getKeyRelt.pass = false; // 是否通过此步骤标识
      getKeyRelt.type = 'getKeyLogin';
      return Object.assign(getKeyRelt, {
        type: 'getKeyLogin',
        pass: false
      });
    }
    let retPassword;
    try {
      const publicKey = getKeyRelt.data.public_key;
      retPassword = this.handleEncryptPassword(password, publicKey);
    } catch (error) {
      this.refreshNECaptha();
      return {
        pass: false,
        type: 'Encrypt'
      };
    }
    return {
      pass: true,
      retPassword,
      uuid: getKeyRelt.data.uuid
    };
  }

  /**
   * 注册
   * */
  register(params) {
    const failure = () => {
      this.refreshNECaptha();
    };
    return userApi
      .register({
        text: this.state.captchaVal,
        captcha: this.state.captchaVal,
        ...params
      })
      .then(res => {
        if (res.code !== 200) {
          failure(res);
        }
        return res;
      })
      .catch(err => {
        failure(err);
        return err;
      });
  }
  // 第三方授权回调
  callbackUserInfo(params) {
    return userApi.callbackUserInfo(params);
  }

  // 验证码登录&&账号登录
  loginInfo(data) {
    return requestApi.user.loginInfo(data);
  }

  // 手机||邮箱验证码
  codeCheck(data) {
    return userApi.codeCheck(data);
  }

  // 密码重置
  resetPassword(data) {
    return userApi.resetPassword(data);
  }

  /**
   * 跳转到qq授权登录链接、跳转到微信授权登录链接
   * /v3/users/oauth/callback
   * */
  authLogin(params) { }

  /**
   * 微信浏览器微信授权登录
   * /v3/commons/auth/weixin
   * */
  authLoginByWx() { }

  /**-----------------------  以下是否B端接口?  -----------------------**/

  /**
   * 校验验证码,获取验证码（图形验证码）
   * /v3/users/code-consumer/send
   * */
  getGraphCode() { }

  /**
   * 校验手机验证码、邮件验证码
   * /v3/users/code/check
   * */
  checkCode() { }

  /**
   * 角度口令登录
   * /v3/webinars/live/role-login
   * */
  roleLogin() { }

  // 获取用户信息
  getUserInfo(data) {
    return userApi.getUserInfo(data).then(res => {
      if (res.code === 200) {
        // QQ & weixin 的绑定情况
        const Weixin = res.data.user_thirds.filter(item => item.type === 3);
        const QQ = res.data.user_thirds.filter(item => item.type === 2);
        this.state.thirdInfo.WeixinBind = Weixin.length > 0;
        this.state.thirdInfo.WeixinNickName = Weixin[0] ? Weixin[0].nick_name : '';
        this.state.thirdInfo.QQBind = QQ.length > 0;
        this.state.thirdInfo.QQNickName = QQ[0] ? QQ[0].nick_name : '';
        // 用户基本信息
        this.state.userInfo = res.data;
      }
      return res;
    });
  }

  // 获取验证码
  sendPhoneCode(data) {
    // 开始倒计时
    // data.type 1手机  2邮箱,
    // data.scene_id场景ID：1账户信息-修改密码  2账户信息-修改密保手机 3账户信息-修改关联邮箱 4忘记密码-邮箱方式找回
    // 5忘记密码-短信方式找回 6提现绑定时手机号验证 7快捷方式登录（短信验证码登录） 8注册-验证码
    return userApi
      .sendCode(data)
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  // 退出登录
  loginOut(data) {
    return userApi.loginOut(data);
  }

  // 替换头像
  changeAvatarSend(data) {
    return userApi.changeAvatarSend(data);
  }

  // 替换昵称
  editUserNickName(data) {
    return userApi.editUserNickName(data);
  }

  // 第三方解除绑定
  thirdUnbind(data) {
    return userApi.thirdUnbind(data);
  }

  // 绑定手机号
  bindInfo(data) {
    return userApi.bindInfo(data);
  }

  // 图片上传cdn
  uploadImage(data) {
    return userApi.uploadImage(data);
  }
}

export default function useUserServer() {
  return UserServer.getInstance();
}
