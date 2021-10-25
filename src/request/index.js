import '../libs/sdk.js'
import roomBase from './roomBase.js'
import user from './user.js'
import insertFile from './insertFile.js'

class RequestApi {
    constructor() {
        this.live = window.VhallSaasSDK.requestApi.live
        this.roomBase = roomBase
        this.user = user
        this.insertFile = insertFile
    }
}

const requestApi = new RequestApi()
export default requestApi
