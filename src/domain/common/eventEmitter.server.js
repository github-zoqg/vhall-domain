export default function useEventEmitter() {
  let state = {
    eventMap: {}
  };

  function $on(eventName, callback) {
    const { eventMap } = state;
    if (eventMap[eventName] === undefined) eventMap[eventName] = [];
    eventMap[eventName].push(callback);
  }

  function $emit(eventName, payload = null) {
    const { eventMap } = state;

    if (!eventMap[eventName] || eventMap[eventName].length === 0) return;

    eventMap[eventName].forEach(eventCallback => {
      eventCallback(payload);
    });
  }

  function $off(eventName, callback = null) {
    const { eventMap } = state;

    if (callback === null) {
      eventMap[eventName] = [];
      return;
    }

    const index = eventMap[eventName].findIndex(cb => cb === callback);
    index && eventMap[eventName].splice(index, 1);
  }

  function $destroy() {
    let { eventMap } = state;
    eventMap = {};
  }

  return { $on, $emit, $off, $destroy };
}
