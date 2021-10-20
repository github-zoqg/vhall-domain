class ContextServer {
    constructor() {
        this.value = {}
    }

    set(key, value) {
        this.value[key] = value
    }

    get(key) {
        return this.value[key]
    }
}
const contextServer = new ContextServer();
export default contextServer;
