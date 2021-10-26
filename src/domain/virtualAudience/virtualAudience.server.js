import requestApi from '../../request/index';

export default function userVirtualClientStartServe(_this) {

    const virtualClientStart = (data) => {
        return requestApi.virtualClient.virtualClientStart(data)
    }

    const virtualAccumulation = (data) => {
        return requestApi.virtualClient.virtualAccumulation(data)
    }

    const virtualClientGet = (data) => {
        return requestApi.virtualClient.virtualClientGet(data)
    }

    return { virtualClientStart, virtualAccumulation, virtualClientGet }
}