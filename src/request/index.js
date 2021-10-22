import '../libs/sdk.js'
import roomBase from './roomBase.js'

class RequestApi {
    constructor() {
        this.live = window.VhallSaasSDK.requestApi.live
        this.roomBase = roomBase
    }
}

const requestApi = new RequestApi()
export default requestApi