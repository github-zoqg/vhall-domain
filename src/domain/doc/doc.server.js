import interactive from "../../request/interactive";

export default function useDocServer() {
    const state = {
        docInstance: null
    }

    const init = () => {
        const { state: roomInitGroupServer } = contextServer.get('roomInitGroupServer')
        return roomInitGroupServer.vhallSaasInstance.createDoc().then(res => {
            state.docInstance = res
            return res
        })
    }

    init()

    return { state }
}
