function useContextServer() {
    const state = {
        serverPool: {}
    }

    const set = (key, server) => {
        const { serverPool } = state;
        serverPool[key] = server;
    }

    const get = (key) => {
        const { serverPool } = state;
        return serverPool[key]
    }

    return { set, get }
}

const contextServer = useContextServer();
export default contextServer;
