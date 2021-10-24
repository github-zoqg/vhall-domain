
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

    const show = () => {
        const { serverPool } = state;
        return serverPool
    }

    return { set, get, show }
}

const contextServer = useContextServer()

export default contextServer;
