import requestApi from '../../request/index.js';
import '../../libs/sdk.js'

export default function useUserServer() {
    const state = {}

    // 验证码登录&&账号登录
    const loginInfo = (data) => {
        return requestApi.roomBase.loginInfo(data)
    }

    // 第三方授权
    const callbackUserInfo = (data) => {
        return requestApi.roomBase.callbackUserInfo(data)
    }

    // 注册
    const register = (data) => {
        return requestApi.roomBase.register(data)
    }

    // 手机||邮箱验证码
    const codeCheck = (data) => {
        return requestApi.roomBase.codeCheck(data)
    }

    // 密码重置
    const resetPassword = (data) => {
        return requestApi.roomBase.resetPassword(data)
    }

    return { state, loginInfo, callbackUserInfo, register, codeCheck, resetPassword }
}