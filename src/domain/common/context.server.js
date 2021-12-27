function useContextServer() {
    const state = {
        serverPool: {}
    };

    const set = (key, server) => {
        const { serverPool } = state;
        serverPool[key] = server;
    };

    const get = key => {
        const { serverPool } = state;
        return serverPool[key];
    };

    const show = () => {
        const { serverPool } = state;
        return { ...serverPool };
    };

    const clear = () => {
        const { serverPool } = state;
        serverPool = {};
    };

    return { set, get, show, clear };
}

const contextServer = useContextServer();
export default contextServer;
