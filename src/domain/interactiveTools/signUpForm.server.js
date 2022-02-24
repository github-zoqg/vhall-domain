import {signUpFormApi, meeting, wechatApi} from "../../request";

class SignUpFormServer {
  constructor() {
    if (typeof SignUpFormServer.instance === 'object') {
      return SignUpFormServer.instance;
    }
    this.state = {};
    SignUpFormServer.instance = this;
    return this;
  }

  /**
   * 检查报名表单独立链接是否有效
   * */
  getFormOpenLinkStatus(params = {}) {
    return signUpFormApi.fetchVerifyOpenLink(params);
  }

  /**
   * 获取当前活动类型
   * */
  getWebinarType(params = {}) {
    return meeting.initStandardReceiveLive(params);
  }

  /**
   * 获取微信分享信息
   * */
  getWxShareInfo(params = {}) {
    return wechatApi.wechatShare(params);
  }

  /**
   * 获取表单基本信息
   * */
  getFormBaseInfo(params = {}) {
    return signUpFormApi.fetchFormBaseInfo(params);
  }

  /**
   * 获取问题列表
   * */
  getQuestionsList(params = {}) {
    return signUpFormApi.fetchQuestionsList(params);
  }

  /**
   * 发送手机验证码
   * */
  sendVerifyCode(params = {}) {
    return signUpFormApi.sendVerifyCode(params);
  }

  /**
   * 验证用户是否已经报名
   * */
  checkIsRegistered(params = {}) {
    return signUpFormApi.checkIsRegistered(params);
  }

  /**
   * 获取地域列表
   * */
  getAreaList() {
    return signUpFormApi.fetchAreaList();
  }

  /**
   * 提交报名表单
   * */
  submitSignUpForm(params = {}) {
    return signUpFormApi.submitSignUpForm(params);
  }

}

export default function userSignUpFormServer() {
  if (!SignUpFormServer.instance) {
    SignUpFormServer.instance = new SignUpFormServer();
  }
  return SignUpFormServer.instance;
}