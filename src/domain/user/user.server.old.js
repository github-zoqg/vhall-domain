import requestApi from '../../request/index';
import '../../libs/sdk.js';

export default function useUserServer() {
    let state = {};

    // 验证码登录&&账号登录
    function loginInfo(data) {
        return requestApi.user.loginInfo(data);
    }

    // 第三方授权
    function callbackUserInfo(data) {
        return requestApi.user.callbackUserInfo(data);
    }

    // 注册
    function register(data) {
        return requestApi.user.register(data);
    }

    // 手机||邮箱验证码
    function codeCheck(data) {
        return requestApi.user.codeCheck(data);
    }

    // 密码重置
    function resetPassword(data) {
        return requestApi.user.resetPassword(data);
    }

    return { state, loginInfo, callbackUserInfo, register, codeCheck, resetPassword };
}
