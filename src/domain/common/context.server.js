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

export default new ContextServer()