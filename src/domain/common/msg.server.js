export default function useMsgServer() {
    const state = {
        msgInstance: null
    }

    const init = () => {

    }

    const $on = (eventType, fn) => {
        if (!msgInstance) return;
        msgInstance.$on(eventType, fn);
    }

    const $emit = (eventType, params) => {
        if (!msgInstance) return;
        msgInstance.$emit(eventType, params);
    }

    return { state, init, $on, $emit }
}