import useMsgServer from '@/domain/common/msg.server.js'
import useRoomBaseServer from '@/domain/roombase/roombase.server.js'
import contextServer from '@/domain/common/context.server.js'


export default function useRoomInitGroupServer() {
    let roomBaseServer = useRoomBaseServer();
    let msgServer = useMsgServer();

    contextServer.set('roomBaseServer', roomBaseServer)
    contextServer.set('msgServer', msgServer)

    const reload = async () => {
        msgServer.destroy();
        await msgServer.init();
    }

    const initSendLive = async (customOptions = {}) => {
        const defaultOptions = {
            clientType: 'send',
            development: true,
            requestHeaders: {
                platform: 7
            }
        }
        const options = Object.assign({}, defaultOptions, customOptions)
        await roomBaseServer.init(options);
        await roomBaseServer.getWebinarInfo();
        await roomBaseServer.getConfigList();
        await msgServer.init();


        return true;
    }

    const initReceiveLive = async (customOptions = {}) => {
        const defaultOptions = {
            clientType: 'receive',
            development: true,
            requestHeaders: {
                platform: 7
            },
            receiveType: 'standard'
        }
        const options = Object.assign({}, defaultOptions, customOptions)

        console.log('recive live:',options)
        await roomBaseServer.init(options)
        await roomBaseServer.getWebinarInfo()
        await roomBaseServer.getConfigList()
        await msgServer.init();
        return true;
    }

    return { roomBaseServer, msgServer,reload, initSendLive, initReceiveLive }
}