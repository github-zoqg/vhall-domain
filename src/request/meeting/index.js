import $http from '@/utils/http.js'
import { merge } from '@/utils/index.js'
// 发起端初始化
const initSendLive = params => {
    const retParmams = {
        webinar_id: params.webinarId,
        live_token: params.live_token || '',
        nickname: params.nickname || '',
        email: params.email || '',
        check_online: params.check_online || 0,
        biz_id: params.biz_id || ''
    }

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/live/init',
            type: 'GET',
            data: retParmams
        }).then(res => {
            resolve(res)
        }).catch(e => reject(e))
    })
}

// 观看端初始化（标品）
const initStandardReceiveLive = params => {
    const retParmams = {
        webinar_id: params.webinarId,
        visitor_id: params.visitor_id || '',
        record_id: params.record_id || '',
        refer: params.refer || '',
        biz_id: params.biz_id || ''
    }

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/watch/init',
            type: 'GET',
            data: retParmams
        }).then(res => {
            resolve(res)
        }).catch(e => reject(e))
    })
}

// 观看端初始化（嵌入页）
const initEmbeddedReceiveLive = params => {
    const retParmams = {
        webinar_id: params.webinarId,
        visitor_id: params.visitor_id || '',
        record_id: params.record_id || '',
        email: params.email || '',
        nickname: params.nickname || '',
        k: params.k || '',
        state: params.state || '',
        refer: params.refer || '',
        sign: params.sign || '',
        ts: params.ts || '',
        biz_id: params.biz_id || '',
        third_user_id: params.third_user_id || ''
    }

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/watch/inline-init',
            type: 'GET',
            data: retParmams
        }).then(res => {
            resolve(res)
        }).catch(e => reject(e))
    })
}

// 观看端初始化（SDK）
const initSdkReceiveLive = params => {
    const retParmams = {
        webinar_id: params.webinarId,
        record_id: params.record_id || '',
        email: params.email || '',
        nickname: params.nickname || '',
        pass: params.pass || '',
        k: params.k || '',
        refer: params.refer || '',
        qrcode: params.qrcode || '',
        share_id: params.share_id || '',
        visitor_id: params.visitor_id || '',
        biz_id: params.biz_id || '',
        third_user_id: params.third_user_id || ''
    }

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/watch/sdk-init',
            type: 'GET',
            data: retParmams
        }).then(res => {
            resolve(res)
        }).catch(e => reject(e))
    })
}

// 开始直播
const startLive = params => {
    const { webinar = {} } = store.get('roomInitData')

    const defaultParams = {
        webinar_id: webinar.id
    }

    const retParmams = merge.recursive({}, defaultParams, params)

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/live/start',
            type: 'POST',
            data: retParmams
        })
            .then(res => resolve(res))
            .catch(e => reject(e))
    })
}

// 结束直播
const endLive = params => {
    const { webinar = {} } = store.get('roomInitData')

    const defaultParams = {
        webinar_id: webinar.id
    }

    const retParmams = merge.recursive({}, defaultParams, params)

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/live/end',
            type: 'POST',
            data: retParmams
        })
            .then(res => resolve(res))
            .catch(e => reject(e))
    })
}

// 进入直播前检测
const checkLive = params => {
    const { webinar = {} } = store.get('roomInitData')

    const defaultParams = {
        webinar_id: webinar.id
    }

    const retParmams = merge.recursive({}, defaultParams, params)

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/live/check',
            type: 'GET',
            data: retParmams
        })
            .then(res => resolve(res))
            .catch(e => reject(e))
    })
}

// 获取聊天服务链接参数
const getChatInitOptions = params => {
    const { webinar = {} } = store.get('roomInitData')

    const defaultParams = {
        webinar_id: webinar.id
    }

    const retParmams = merge.recursive({}, defaultParams, params)

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/live/get-connect',
            type: 'GET',
            data: retParmams
        })
            .then(res => resolve(res))
            .catch(e => reject(e))
    })
}

// 心跳检测
const liveHeartBeat = params => {
    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/live/heartbeat',
            type: 'GET',
            data: params
        })
            .then(res => resolve(res))
            .catch(e => reject(e))
    })
}

// 获取live_token
const getLiveToken = params => {
    const { webinar = {} } = store.get('roomInitData')

    const defaultParams = {
        webinar_id: webinar.id
    }

    const retParmams = merge.recursive({}, defaultParams, params)

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/live/get-live-token',
            type: 'GET',
            data: retParmams
        })
            .then(res => resolve(res))
            .catch(e => reject(e))
    })
}

// 获取推流地址
const getStreamPushAddress = params => {
    const { webinar = {} } = store.get('roomInitData')

    const defaultParams = {
        webinar_id: webinar.id
    }

    const retParmams = merge.recursive({}, defaultParams, params)

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/live/get-stream-push-address',
            type: 'GET',
            data: retParmams
        })
            .then(res => resolve(res))
            .catch(e => reject(e))
    })
}

const meeting = {
    initSendLive,
    initStandardReceiveLive,
    initEmbeddedReceiveLive,
    initSdkReceiveLive,
    startLive,
    endLive,
    checkLive,
    getChatInitOptions,
    liveHeartBeat,
    getLiveToken,
    getStreamPushAddress
}

export default meeting;