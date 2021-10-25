import $http from '@/utils/http.js'
import { merge } from '@/utils/index.js'
import contextServer from "@/domain/common/context.server.js"

// 查询活动基础信息
const getWebinarInfo = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer')

    const retParmams = {
        webinar_id: params.webinarId || state.watchInitData.webinar.id,
        is_no_check: 1 || params.is_no_check
    }

    return $http({
        url: '/v3/webinars/webinar/info',
        type: 'POST',
        data: retParmams
    })
}

// 查询活动配置信息
const getConfigList = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer')

    const retParmams = {
        webinar_id: params.webinar_id || state.watchInitData.webinar.id,
        webinar_user_id: params.webinar_user_id || state.watchInitData.webinar.userinfo.user_id,
        scene_id: params.scene_id || 1
    }

    return $http({
        url: '/v3/users/permission/get-config-list',
        type: 'POST',
        data: retParmams
    })
}

// 设置设备检测状态
const setDevice = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer')

    const retParmams = {
        room_id: params.room_id || state.watchInitData.interact.room_id,
        status: params.status || 1,
        type: params.type || 0
  }

    return $http({
        url: '/v3/interacts/room/set-device',
        type: 'POST',
        data: retParmams
    })
}

const roomBase = {
    getWebinarInfo,
    getConfigList,
    setDevice
}

export default roomBase