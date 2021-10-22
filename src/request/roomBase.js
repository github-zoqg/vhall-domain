import $http from '../utils/http.js'
import { merge } from '../utils/index.js'
import contextServer from "../domain/common/context.server"

// 查询活动基础信息
const getWebinarInfo = params => {
    const { state } = contextServer.get('roomBaseServer')

    const retParmams = {
      webinar_id: params.webinarId || state.webinar.id,
      is_no_check: 1 || params.is_no_check
    }

    return $http({
        url: '/v3/webinars/webinar/info',
        type: 'POST',
        data: retParmams
    })
}

// 查询活动配置信息
const getConfigList = params => {
    const { state } = contextServer.get('roomBaseServer')

    const retParmams = {
        webinar_id: params.webinar_id || state.webinar.id,
        webinar_user_id: params.webinar_user_id,
        scene_id: params.scene_id
    }

    return $http({
        url: '/v3/users/permission/get-config-list',
        type: 'POST',
        data: retParmams
    })
}

const roomBase = {
    getWebinarInfo,
    getConfigList
}

export default roomBase