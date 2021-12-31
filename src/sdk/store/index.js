class Store {
    constructor() {
        this.state = {}
    }

    set(key, value) {
        this.state[key] = value;
    }

    get(key) {
        return this.state[key]
    }

}

const store = new Store()
export default store;