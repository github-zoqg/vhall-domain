import $http from '../utils/http.js'
import { merge } from '../utils/index.js'
import contextServer from "../domain/common/context.server"

// 账号登录&&验证码登录
const loginInfo = (params = {}) => {
    // const { state } = contextServer.get('roomInitGroupServer') || {}

    const retParmams = params
    retParmams.biz_id = 2

    return $http({
        url: '/v3/users/user-consumer/login',
        type: 'POST',
        data: retParmams
    })
}

// 第三方授权
const callbackUserInfo = (params = {}) => {
    // const { state } = contextServer.get('roomBaseServer')

    const retParmams = params;

    return $http({
        url: '/v3/users/oauth/callback',
        type: 'POST',
        data: retParmams
    })
}

// 注册
const register = (params = {}) => {
    // const { state } = contextServer.get('roomBaseServer')

    const retParmams = { ...params }

    return $http({
        url: '/v3/users/user-consumer/register',
        type: 'POST',
        data: retParmams
    })
}

// 手机||邮箱验证码
const codeCheck = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer')

    const retParmams = { ...params }

    return $http({
        url: '/v3/users/code-consumer/check',
        type: 'POST',
        data: retParmams
    })
}

// 密码重置
const resetPassword = (params = {}) => {
    const { state } = contextServer.get('roomInitGroupServer')

    const retParmams = Object.assign({},params,{
        biz_id: state.biz_id || 2
    })

    return $http({
        url: '/v3/users/user-consumer/reset-password',
        type: 'POST',
        data: retParmams
    })
}

const userBase = {
    loginInfo,
    callbackUserInfo,
    register,
    codeCheck,
    resetPassword,
}

export default userBase