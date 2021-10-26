import contextServer from '@/domain/common/context.server.js'
import useMsgServer from '@/domain/common/msg.server.js'
import useRoomBaseServer from '@/domain/roombase/roombase.server.js'
import useInteractiveServer from '@/domain/stream/interactive.server.js';
import { setBaseUrl, setToken, setRequestHeaders } from '@/utils/http.js';

export default function useRoomInitGroupServer(options = {}) {
    const state = {
        bizId: options.biz_id || 2,// 区分 端（知客/直播） 2-直播 4-知客
        vhallSaasInstance: null
    }

    let roomBaseServer = useRoomBaseServer();
    let msgServer = useMsgServer();
    let interactiveServer = useInteractiveServer()

    contextServer.set('roomBaseServer', roomBaseServer)
    contextServer.set('msgServer', msgServer)
    contextServer.set('interactiveServer',interactiveServer)

    const reload = async () => {
        msgServer.destroy();
        await msgServer.init();
    }

    const setRequestConfig = (options) => {
        setToken(options.token, options.liveToken)

        if (options.requestHeaders) {
            setRequestHeaders(options.requestHeaders)
        }
    }

    const initSdk = () => {
        return new Promise((resolve,reject)=>{
            state.vhallSaasInstance = new window.VhallSaasSDK()
            addToContext()
            resolve()
        })
    }

    const initSendLive = async (customOptions = {}) => {
        await initSdk()
        const defaultOptions = {
            clientType: 'send',
            development: true,
            requestHeaders: {
                platform: 7
            }
        }
        const options = Object.assign({}, defaultOptions, customOptions)
        setRequestConfig(options)

        await roomBaseServer.init(options);
        await roomBaseServer.getWebinarInfo();
        await roomBaseServer.getConfigList();
        await msgServer.init();
        await interactiveServer.init();

        return true;
    }

    const initReceiveLive = async (customOptions = {}) => {
        initSdk()
        const defaultOptions = {
            clientType: 'receive',
            development: true,
            requestHeaders: {
                platform: 7
            },
            receiveType: 'standard'
        }
        const options = Object.assign({}, defaultOptions, customOptions)
        setRequestConfig(options)

        await roomBaseServer.init(options)
        await roomBaseServer.getWebinarInfo()
        await roomBaseServer.getConfigList()
        await msgServer.init();
        await interactiveServer.init();
        
        return true;
    }

    const result = { state,roomBaseServer, msgServer,interactiveServer,reload, initSendLive, initReceiveLive }

    function addToContext() {
        contextServer.set('roomInitGroupServer', result)
    }

    return result;
}
