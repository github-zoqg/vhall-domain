import $http from '../utils/http.js'
import { merge } from '../utils/index.js'
import contextServer from "../domain/common/context.server"

// 账号登录&&验证码登录
const loginInfo = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer')

    const retParmams = params.way == 2 ? {
        way: 2,  // 1=账号密码登录=密码登录|2=手机号验证码登录=验证码登录|3=ssotoken登录
        phone: params.usernames,
        dynamic_code: params.captchas,
        visitor_id: params.visitor_id
    } : {
        way: 1,
        uuid: params.loginKey.uuid,
        account: params.ruleForm.username,
        password: params.retPassword,
        captcha: params.phoneKey,
        visitor_id: params.visitor_id,
        remember: params.remember
    }

    return $http({
        url: '/v3/users/user-consumer/login',
        type: 'POST',
        data: retParmams
    })
}

// 第三方授权
const callbackUserInfo = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer')

    const retParmams = {
        source: params.source,
        key: params.captchas,
        scene_id: params.visitor_id
    }

    return $http({
        url: '/v3/users/oauth/callback',
        type: 'POST',
        data: retParmams
    })
}

const userBase = {
    loginInfo,
    callbackUserInfo,
}

export default userBase