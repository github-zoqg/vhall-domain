import contextServer from '@/domain/common/context.server.js'

export default function useMsgServer() {
    const state = {
        msgInstance: null
    }

    const init = () => {
        if (!contextServer.get('roomInitGroupServer')) return
        const { state: roomInitGroupServer } = contextServer.get('roomInitGroupServer')
        return roomInitGroupServer.vhallSaasInstance.createChat().then(res => {
            state.msgInstance = res
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
        if (!state.msgInstance) return
        state.msgInstance.destroy
        state.msgInstance = null
    }

    return { state, init, destroy, $on, $emit }
}
