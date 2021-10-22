import contextServer from "../common/context.server"
import useMsgServer from "../common/msg.server"
import requestApi from '../../request/index.js';
import '../../libs/sdk.js'

export default function useRoomBaseServer() {
    const state = {
        inited:false,
        isLiveOver: false,
        webinarVo: {},
        watchInitData: {},
        setWatchInitErrorData: {},
        configList: {},
        vhallSaasInstance: null
    }


    // 初始化房间信息,包含发起/观看(嵌入/标品)
    const getWatchInitData = (options) => {
        const { vhallSaasInstance } = state;
        return vhallSaasInstance.init(options).then(res => {
            if (res.code === 200) {
                state.inited = true;
                state.watchInitData = res.data;
            } else {
                state.setWatchInitErrorData = res;
            }
            return res
        });
    }


    // 获取活动信息
    const getWebinarInfo = (data) => {
        return requestApi.roomBase.getWebinarInfo(data).then(res => {
            state.webinarVo = res.data;
            return res;
        })
    }

    // 获取房间权限配置列表
    const getConfigList = (data) => {
        return requestApi.roomBase.getConfigList(data).then(res => {
            state.configList = JSON.parse(res.data.permissions);
            return res;
        })
    }

    // 设置设备检测状态
    const setDevice = (data) => {
        return requestApi.roomBase.setDevice(data).then(res => {
            return res;
        })
    }

    // 开播startLive
    const startLive = (data = {}) => {
        setDevice(data)
        return requestApi.live.startLive(data)
    }

    // 结束直播
    const endLive = (data) => {
        return requestApi.live.endLive(data)
    }

    const init = (option) => {
        const vhallSaasInstance = new window.VhallSaasSDK()
        state.vhallSaasInstance = vhallSaasInstance
        addToContext()
        return getWatchInitData(option).then(res => {
            initSubServer()
            return res
        })
    }

    const initSubServer = () => {
        const msgServer = useMsgServer();
        contextServer.set('msgServer', msgServer)
    }

    const result = { state, init, getWatchInitData, getWebinarInfo, getConfigList, startLive, endLive, setDevice }

    function addToContext() {
        contextServer.set('roomBaseServer', result)
    }

    return result;
}