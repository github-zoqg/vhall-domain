import contextServer from '@/domain/common/context.server.js'

export default function useDocServer() {

    const init = (options) => {
        console.log('-----------------------initDocServer----------------------')
        const { state: roomInitGroupServer } = contextServer.get('roomInitGroupServer')
        console.log(roomInitGroupServer.vhallSaasInstance.createDoc)
        return roomInitGroupServer.vhallSaasInstance.createDoc(options).then(instance => {
            console.log('-----------------------initDocServer-------resolve---------------')
            console.log(instance)
            return instance
        }).catch(e => {
            console.log('-----------------------initDocServerreject--------------', e)
            return e
        })

    }
    // -- TypeError: Cannot set properties of undefined (setting 'instance')
    // at new DocModule (context.server.js?b7c1:2)
    // at eval (index.js?9e93:2)
    // at new Promise (<anonymous>)
    // at VhallSaasSDK.createDoc (index.js?9e93:2)
    // at Object.init (player.server.js?4cd1:9)
    // at VueComponent.initDocSDK (doc.js?3682:165)
    // at Vue.eval (doc.js?3682:128)
    // at invokeWithErrorHandling (vue.runtime.esm.js?9800:1863)
    // at Vue.$emit (vue.runtime.esm.js?9800:3903)
    // at Vue.<computed> [as $emit] (backend.js:1793)

    return { init }
}
