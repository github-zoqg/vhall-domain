import useMsgServer from '@/domain/common/msg.server.js'
import useRoomBaseServer from '@/domain/roombase/roombase.server.js'
import contextServer from '@/domain/common/context.server.js'


export default function useRoomInitGroupServer(options = {}) {
    const state = {
        biz_id: options.biz_id || 2,
        platform: options.platform || 7
    }

    let roomBaseServer = useRoomBaseServer();
    let msgServer = useMsgServer();

    contextServer.set('roomBaseServer', roomBaseServer)
    contextServer.set('msgServer', msgServer)


    const initSendLive = async (customOptions = {}) => {
        const defaultOptions = {
            clientType: 'send',
            development: true,
            requestHeaders: {
                platform: 7
            },
            development: true
        }
        const options = Object.assign({}, defaultOptions, customOptions)
        await roomBaseServer.init(options);
        await roomBaseServer.getWebinarInfo();
        await roomBaseServer.getConfigList();
        await msgServer.init();


        return true;
    }

    const initReciveLive = async (customOptions = {}) => {
        const defaultOptions = {
            clientType: 'recive',
            development: true,
            requestHeaders: {
                platform: 7
            },
            development: true
        }
        const options = Object.assign({}, defaultOptions, customOptions)

        await roomBaseServer.init(options)
        await roomBaseServer.getWebinarInfo()
        await roomBaseServer.getConfigList()
        await msgServer.init();
        return true;

    }

    return { state, roomBaseServer, msgServer, initSendLive, initReciveLive }
}
