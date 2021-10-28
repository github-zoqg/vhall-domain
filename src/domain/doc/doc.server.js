import contextServer from '@/domain/common/context.server.js'

export default function useDocServer() {
    const state = {
        docInstance:null
    }

    const on = (type,cb)=>{
        if(!state.docInstance)return;
        state.docInstance.$on(type,cb)
    }

    const destroy = ()=>{
        return state.docInstance.destroy()
    }

    const init = (options) => {
        const { state: roomInitGroupServer } = contextServer.get('roomInitGroupServer')
        console.log('create doc',roomInitGroupServer.vhallSaasInstance.createDoc)
        return roomInitGroupServer.vhallSaasInstance.createDoc(options).then(instance => {
            state.docInstance = instance;
            return instance
        }).catch(e => {
            return e
        })

    }
    return { state,init,on,destroy }
}
