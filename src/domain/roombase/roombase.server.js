import requestApi from '../../request/index.js';
import '../../libs/sdk.js'

export default function useRoomBaseServer() {
    const state = {
        inited:false,
        isLiveOver: false,
        webinarVo: {},
        watchInitData: {},
        watchInitErrorData: undefined,// 默认undefined，如果为其他值将触发特殊逻辑
        configList: {},
        vhallSaasInstance: null
    }


    // 初始化房间信息,包含发起/观看(嵌入/标品)
    const getWatchInitData = (options) => {
        const { vhallSaasInstance } = state;

        console.log('init options:',options)

        return vhallSaasInstance.init(options).then(res => {
            if (res.code === 200) {
                state.inited = true;
                state.watchInitData = res.data;
            } else {
                state.watchInitErrorData = res;
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

        return getWatchInitData(option)
    }



    return { state, init, getWatchInitData, getWebinarInfo, getConfigList, startLive, endLive, setDevice }

}