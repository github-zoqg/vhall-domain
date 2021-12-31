import { mountSDK } from '@/utils/loader.js'
import store from './store/index.js';
import passSdk from './lib/pass-sdk.js';
import { InteractiveModule, PlayerModule, DocModule, ChatModule } from './module/index.js'
class VhallSaasSDK {
    static msgBus = null
    static loadStatus = false
    static baseState = store
    //初始化成功回调
    initSuccessHook = () => { }
    //初始化失败回调用
    initErrorHook = () => { }
    //加载pass-sdk
    static init(options = { clientType: 'send', receiveType: 'standard', plugins: [] }) {
        this.setRequestConfig(options)
        this.setClientType(options.clientType)
        this.loadSdk(options.plugins)
        return this
    }
    static async loadSdk(plugins) {
        const sdklist = ['base', ...plugins].map((item) => {
            return mountSDK(passSdk[item])
        })
        try {
            const loadres = await Promise.all(sdklist)
            this.loadStatus = true;
            this.initSuccessHook(this)
        } catch (error) {
            console.error('加载vhall-pass-sdk失败', error)
        }

    }
    static onSuccess(callback) {
        if (this.loadStatus) {
            callback(this)
        }
        this.initSuccessHook = callback
        return this
    }
    static OnError(callback) {
        this.initErrorHook = callback
        return this
    }
    static setClientType(clientType) {
        if (clientType !== 'send' && clientType !== 'receive') {
            throw new TypeError('clientType is invalid')
        }
        store.set('clientType', clientType)
    }
    static createPlayer(options = {}) {
        return new Promise((resolve, reject) => {
            const instance = new PlayerModule(options)
            instance.init(options).then(res => {
                resolve(instance)
            })
        })
    }
    static createInteractive(options = {}) {
        return new Promise((resolve, reject) => {
            const instance = new InteractiveModule(options)
            instance.init(options).then(res => {
                resolve(instance)
            })
        })
    }

    static createChat(options = {}) {
        return new Promise((resolve, reject) => {
            const instance = new ChatModule()
            instance.init(options).then(res => {
                resolve(instance)
            })
        })
    }

    static createDoc(options = {}) {
        return new Promise((resolve, reject) => {
            const instance = new DocModule(options)
            instance.init(options).then(res => {
                resolve(instance)
            })
        })
    }
}
export default VhallSaasSDK