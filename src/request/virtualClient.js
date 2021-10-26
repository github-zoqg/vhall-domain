import $http from '@/utils/http.js'
import { merge } from '../utils/index.js'
import contextServer from "../domain/common/context.server"

// 发起端-开始增加虚拟观众
const virtualClientStart = (params = {}) => {
    // const { state } = contextServer.get('roomInitGroupServer') || {}

    const retParmams = params

    return $http({
        url: '/v3/webinars/virtual/start',
        type: 'GET',
        data: retParmams
    })
}

// 发起端-增加虚拟观众
const virtualAccumulation = (params = {}) => {
    // const { state } = contextServer.get('roomInitGroupServer') || {}

    const retParmams = params

    return $http({
        url: '/v3/webinars/virtual/accumulation',
        type: 'GET',
        data: retParmams
    })
}

// 发起端-获取虚拟观众基数
const virtualClientGet = (params = {}) => {
    // const { state } = contextServer.get('roomInitGroupServer') || {}

    const retParmams = params

    return $http({
        url: '/v3/webinars/virtual/get-base',
        type: 'GET',
        data: retParmams
    })
}

const virtualClient = {
    virtualClientStart,
    virtualAccumulation,
    virtualClientGet
}

export default virtualClient