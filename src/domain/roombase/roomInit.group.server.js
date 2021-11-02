import contextServer from '@/domain/common/context.server.js'
import useMsgServer from '@/domain/common/msg.server.js'
import useRoomBaseServer from '@/domain/roombase/roombase.server.js'
import useInteractiveServer from '@/domain/stream/interactive.server.js';
import { setBaseUrl, setToken, setRequestHeaders } from '@/utils/http.js';
import useMicServer from "@/domain/stream/mic.server.js";

export default function useRoomInitGroupServer(options = {}) {
    const state = {
        bizId: options.biz_id || 2,// 区分 端（知客/直播） 2-直播 4-知客
        vhallSaasInstance: null,
        live_token: null
    }

    let roomBaseServer = useRoomBaseServer();
    let msgServer = useMsgServer();
    let interactiveServer = useInteractiveServer()
    let micServer = useMicServer()


    setTimeout(() => {
        contextServer.set('roomBaseServer', roomBaseServer)
        contextServer.set('msgServer', msgServer)
        contextServer.set('interactiveServer', interactiveServer)
        contextServer.set('micServer', micServer)
    }, 100)

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
        return new Promise((resolve, reject) => {
            state.vhallSaasInstance = new window.VhallSaasSDK()
            addToContext()
            resolve()
        })
    }

    // 初始化观看端互动直播
    const initReceiveInteractiveRoom = () => {
        // TODO: 创建互动实例
    }

    // 初始化观看端无延迟直播
    const initReceiveNoDelayRoom = () => {
        // TODO: 配置无延迟互动初始化参数并创建互动实例
    }

    // 初始化观看端分组直播
    const initReceiveGroupRoom = () => {
        // TODO: 根据情况初始化子房间互动和聊天实例   或者是初始化主房间互动实例
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

        if (customOptions.liveToken) {
            state.live_token = customOptions.liveToken
        }

        const options = Object.assign({}, defaultOptions, customOptions)
        setRequestConfig(options)

        await roomBaseServer.init(options);
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
        await roomBaseServer.getConfigList()
        await msgServer.init();

        if (roomBaseServer.state.watchInitData.webinar.mode === 6 && roomBaseServer.state.watchInitData.webinar.type == 1) { // 如果是分组直播
            roomBaseServer.setGroupStatus(true)
            await roomBaseServer.getGroupInitData()
            // initReceiveGroupRoom()
        } else if (roomBaseServer.state.watchInitData.webinar.no_delay_webinar == 1) { // 如果是无延迟直播
            // initReceiveNoDelayRoom()
        } else if (roomBaseServer.state.watchInitData.webinar.mode === 3 && roomBaseServer.state.watchInitData.webinar.type == 1) { // 如果是互动直播
            // initReceiveInteractiveRoom()
        }

        return true;
    }

    const result = { state, roomBaseServer, msgServer, interactiveServer, reload, initSendLive, initReceiveLive }

    function addToContext() {
        contextServer.set('roomInitGroupServer', result)
    }

    return result;
}
