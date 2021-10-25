import '../libs/sdk.js'
import roomBase from './roomBase.js'
import user from './user.js'

class RequestApi {
    constructor() {
        this.live = window.VhallSaasSDK.requestApi.live
        this.roomBase = roomBase
        this.user = user
    }
}

const requestApi = new RequestApi()
export default requestApi
