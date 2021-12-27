export default function useEventEmitter() {
    const state = {
        eventMap: {}
    };

    const $on = (eventName, callback) => {
        const { eventMap } = state;
        if (eventMap[eventName] === undefined) eventMap[eventName] = [];

        eventMap[eventName].push(callback);
    };

    const $emit = (eventName, payload = null) => {
        const { eventMap } = state;

        if (!eventMap[eventName] || eventMap[eventName].length === 0) return;

        eventMap[eventName].forEach(eventCallback => {
            eventCallback(payload);
        });
    };

    const $off = (eventName, callback = null) => {
        const { eventMap } = state;

        if (callback === null) {
            eventMap[eventName] = [];
            return;
        }

        const index = eventMap[eventName].findIndex(cb => cb === callback);
        index && eventMap[eventName].splice(index, 1);
    };

    const $destroy = () => {
        const { eventMap } = state;
        eventMap = {};
    };

    return { $on, $emit, $off, $destroy };
}
