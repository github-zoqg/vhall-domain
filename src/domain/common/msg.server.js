export default function useMsgServer() {
    const state = {
        msgInstance: null
    }

    const init = () => {
        
    }

    const $on = (eventType, fn) => {
        if (!state.msgInstance) return;
        state.msgInstance.$on(eventType, fn);
    }

    const $emit = (eventType, params) => {
        if (!state.msgInstance) return;
        state.msgInstance.$emit(eventType, params);
    }

    return { state, init, $on, $emit }
}