import contextServer from './context.server.js'

export default function useMsgServer() {
    const state = {
        msgInstance: null
    }

    const init = () => {
        if(!contextServer.get('roomBaseServer')) return
        const roomBaseState = contextServer.get('roomBaseServer').state
        return roomBaseState.vhallSaasInstance.createChat().then(res => {
            state.msgInstance = res
            console.log('state', state)
            return res
        })
    }

    const $on = (eventType, fn) => {
        if (!state.msgInstance) return;
        state.msgInstance.$on(eventType, fn);
    }

    const $emit = (eventType, params) => {
        if (!state.msgInstance) return;
        state.msgInstance.$emit(eventType, params);
    }

    const destroy = () => {
        if(!state.msgInstance) return
        state.msgInstance.destroy
        state.msgInstance = null
    }

    return { state, init, destroy, $on, $emit }
}