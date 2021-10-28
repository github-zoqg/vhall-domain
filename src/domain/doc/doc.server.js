import contextServer from '@/domain/common/context.server.js'
import requestApi from '../../request/index.js';

const docApi = requestApi.doc

export default function useDocServer() {
    const state = {
        docInstance: null
    }

    const on = (type, cb) => {
        if (!state.docInstance) return;
        state.docInstance.$on(type, cb)
    }

    const destroy = () => {
        return state.docInstance.destroy()
    }

    const init = (options) => {
        const { state: roomInitGroupServer } = contextServer.get('roomInitGroupServer')
        console.log('create doc', roomInitGroupServer.vhallSaasInstance.createDoc)
        return roomInitGroupServer.vhallSaasInstance.createDoc(options).then(instance => {
            state.docInstance = instance;
            return instance
        }).catch(e => {
            return e
        })

    }

    const getVodAllCids = (val) => {
        return state.docInstance.getVodAllCids(val)
    }

    // 获取文档列表(资料库所有文档)
    const getAllDocList = (params) => {
        return docApi.getAllDocList
    }

    // 显示文档列表
    const getWebinarDocList = (params) => {
        return docApi.getWebinarDocList
    }

    // 同步文档
    const syncDoc = (params) => {
        return docApi.syncDoc
    }

    // 获取文档列表(资料库所有文档)
    const getDocDetail = (params) => {
        return docApi.getDocDetail
    }

    // 同步文档
    const delDocList = (params) => {
        return docApi.delDocList
    }

    return {
        state,
        init,
        on,
        destroy,
        getVodAllCids,
        getAllDocList,
        getWebinarDocList,
        getDocDetail,
        syncDoc,
        delDocList
    }
}
