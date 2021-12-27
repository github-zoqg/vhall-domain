function useContextServer() {

    let state = {
        serverPool: {}
    };

    function set(key, server) {
        const {serverPool} = state;
        serverPool[key] = server;
    }

    function get(key) {
        const {serverPool} = state;
        return serverPool[key];
    }

    function show() {
        const {serverPool} = state;
        return {...serverPool};
    }

    function clear(){
        let { serverPool } = state;
        serverPool = {};
    }

    return { set, get, show, clear };
}

const contextServer = useContextServer();
export default contextServer;
