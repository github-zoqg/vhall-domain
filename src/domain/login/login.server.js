export default function useLoginServer() {
    let state = {};

    /**
     * 校验验证码,获取验证码（图形验证码）
     * /v3/users/code-consumer/send
     * */
    function getGraphCode() {}

    /**
     * 发送手机短信验证码、邮件验证码
     * /v3/users/code/send
     * */
    function sendCode() {}

    /**
     * 校验手机验证码、邮件验证码
     * /v3/users/code/check
     * */
    function checkCode() {}

    /**
     * 登录
     * /v3/users/user-consumer/login
     * */
    function login() {}

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
        getGraphCode,
        login,
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
