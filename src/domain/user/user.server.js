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

    return { state, loginInfo, callbackUserInfo }
}