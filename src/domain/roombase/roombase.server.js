import VhallSaasSDK from '@/libs/sdk'
import contextServer from "../common/context.server"
import useMsgServer from "../common/msg.server"

export default function useActiveServer() {
    const state = {
        isLiveOver: false,
        webinarVo: {},
        watchInitData: {},
        setWatchInitErrorData: {},
        configList: {},
        vhallSaas: null
    }

    const init = () => {
        state.vhallSaas = new VhallSaasSDK()
        vhallSaas.init({
            development: true,
            webinarId: 287395517,
            clientType: 'receive',
            receiveType: 'standard',
            requestHeaders: {
                platform: 7
            },
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MzM5MzMxODcsImV4cCI6MTYzNjUyNTE4NywidXNlcl9pZCI6IjE2NDIzMTUyIiwicGxhdGZvcm0iOiI3IiwiY2giOiJjIiwiYnVzaW5lc3NfYWNjb3VudF9pZCI6IiJ9.6qmS6dG9QMmIHdXE9oV7FSPN2zZdGZa1ERfJSYA7Ir4'
        }).then(res => {
            console.log('initResponseData', res)
        })

        contextServer.set('vhallSaas', vhallSaas)
        const msgServer = useMsgServer()
        contextServer.set('msgServer', msgServer)
    }

    const getGrayConfig = (data) => {
        state.watchInitData = VhallSaasSDK.watchInit(data);
    }

    const getWatchInitData = (data) => {
        state.watchInitData = VhallSaasSDK.init(data).then(res => {
            if (res.code === 200) {
                return state.watchInitData = res.data;
            } else {
                return state.setWatchInitErrorData = res;
            }
        });
    }

    // 嵌入观看端初始化
    const watchEmbedInit = () => {
        request('/v3/webinars/watch/inline-init', {
            method: 'GET',
            body: qs.stringify(data)
        }).then(res => {
            if (res.code === 200) {
                return state.watchInitData = res.data;
            } else {
                return state.setWatchInitErrorData = res;
            }
        })
    }

    // 获取活动信息
    const getWebinarInfo = (data) => {
        request('v3/webinars/webinar/info', {
            method: 'POST',
            body: qs.stringify(data)
        }).then(res => {
            state.webinarVo = res.data;
            return state.webinarVo;
        })
    }

    // 获取房间权限配置列表
    const getConfigList = (data) => {
        request('/v3/users/permission/get-config-list', {
            method: 'POST',
            body: qs.stringify(data)
        }).then(res => {
            state.configList = JSON.parse(res.data.permissions);
            return state.configList;
        })
    }

    return { state, init, getWatchInitData, getWebinarInfo, getConfigList, watchEmbedInit }
}