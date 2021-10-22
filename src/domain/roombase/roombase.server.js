
import contextServer from "../common/context.server"
import useMsgServer from "../common/msg.server"
import '../../libs/sdk.js'

export default function useRoomBaseServer(){
    const state = {
        isLiveOver:false,
        webinarVo:{},
        watchInitData:{},
        vhallSaas: null
    }

    const init=()=>{
        state.vhallSaas = new window.VhallSaasSDK()
        vhallSaas.init({
            development:true,
            webinarId:287395517,
            clientType: 'receive',
            receiveType: 'standard',
            requestHeaders: {
                platform:7
            },
            token:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MzM5MzMxODcsImV4cCI6MTYzNjUyNTE4NywidXNlcl9pZCI6IjE2NDIzMTUyIiwicGxhdGZvcm0iOiI3IiwiY2giOiJjIiwiYnVzaW5lc3NfYWNjb3VudF9pZCI6IiJ9.6qmS6dG9QMmIHdXE9oV7FSPN2zZdGZa1ERfJSYA7Ir4'
        }).then(res => {
            console.log('initResponseData', res)
        })
        
        contextServer.set('vhallSaas',vhallSaas)
        const msgServer = useMsgServer()
        contextServer.set('msgServer',msgServer)
    }

    const watchInit=()=>{

    }

    const watchEmbedInit=()=>{

    }

    const getGrayConfig=()=>{

    }

    const getWebinarInfo=()=>{

    }

    return {state,init,getWebinarInfo}
}