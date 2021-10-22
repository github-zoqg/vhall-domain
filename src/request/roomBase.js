import $http from '../utils/http.js'
import { merge } from '../utils/index.js'

// 查询活动基础信息
const getWebinarInfo = params => {
    const retParmams = {
      webinar_id: params.webinarId,
      is_no_check: 1 || params.is_no_check
    }

    return new Promise((resolve, reject) => {
        $http({
            url: '/v3/webinars/webinar/info',
            type: 'POST',
            data: retParmams
        }).then(res => {
            resolve(res)
        }).catch(e => reject(e))
    })
}

const roomBase = {
  getWebinarInfo
}

export default roomBase