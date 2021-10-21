import contextServer from "../common/context.server"
import useMsgServer from "../common/msg.server"

export default function useActiveServer(){
    const state = {
        isLiveOver:false,
        webinarVo:{},
        watchInitData:{}
    }

    const init=()=>{
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