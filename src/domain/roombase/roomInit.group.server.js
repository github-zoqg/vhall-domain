import contextServer from '@/domain/common/context.server.js'
import useMsgServer from '@/domain/common/msg.server.js'
import useRoomBaseServer from '@/domain/roombase/roombase.server.js'
import { setBaseUrl, setToken, setRequestHeaders } from '@/utils/http.js';

export default function useRoomInitGroupServer(options = {}) {
    const state = {
        bizId: options.biz_id || 2,
        vhallSaasInstance: null
    }

    let roomBaseServer = useRoomBaseServer();
    let msgServer = useMsgServer();

    contextServer.set('roomBaseServer', roomBaseServer)
    contextServer.set('msgServer', msgServer)

    const reload = async () => {
        msgServer.destroy();
        await msgServer.init();
    }

    const setRequestConfig = (options) => {
        if (options.development) {
            setBaseUrl('https://t-saas-dispatch.vhall.com')
        } else {
            setBaseUrl('https://saas-api.vhall.com')
        }

        setToken(options.token, options.liveToken)

        if (options.requestHeaders) {
            setRequestHeaders(options.requestHeaders)
        }
    }

    const initSdk = () => {
        state.vhallSaasInstance = new window.VhallSaasSDK()
        addToContext()
    }

    const initSendLive = async (customOptions = {}) => {
        initSdk()
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
        return true;
    }

    const result = { state,roomBaseServer, msgServer,reload, initSendLive, initReceiveLive }

    function addToContext() {
        contextServer.set('roomInitGroupServer', result)
    }

    return result;
}
