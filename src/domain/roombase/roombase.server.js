
import requestApi from '@/request/index.js';
import contextServer from "@/domain/common/context.server.js"
import useEventEmitter from '@/domain/common/eventEmitter.server.js';
import { setRequestHeaders } from '@/utils/http.js';

export default function useRoomBaseServer() {
    const state = {
        inited: false,
        isLiveOver: false,
        webinarVo: {},
        watchInitData: {}, // 活动信息
        groupInitData: {
            event_type: 'start_discussion',
            room_id: "lss_ce8a7661",
            channel_id: "ch_yyu9KJ1t",
            inav_id: "inav_d52f8094",
            interact_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqaWQiOjE5MjE3MzQsInVpZCI6MCwidmlkIjoidjE0NTU4MzMzOTgzMjg5NTg5NzciLCJ0cHVpZCI6InZpc2l0X3YxNDU1ODMzMzk4MzI4OTU4OTc3Iiwid2lkIjoxMzU0NDExOTYsInJvb21faWQiOiJsc3NfY2U4YTc2NjEiLCJjdCI6MTYzNTk1NTM5Nn0.M8Nufk_g46x-ZC4sakc0xf-WYRd-i6L3aWhxkWoIYf8",
            paas_app_id: "fd8d3653",
            paas_access_token: "access:fd8d3653:325acccabcaf50f6",
            subscribe_paas_access_token: ""
        }, // 分组信息
        watchInitErrorData: undefined,// 默认undefined，如果为其他值将触发特殊逻辑
        configList: {},
        isGroupWebinar: false, // 是否是分组直播
        clientType: 'send'
    }

    const eventEmitter = useEventEmitter()

    // 设置当前房间是发起端还是观看端
    const setClientType = (type) => {
        state.clientType = type
    }

    // 初始化房间信息,包含发起/观看(嵌入/标品)
    const getWatchInitData = (options) => {
        console.log(contextServer.get('useRoomInitGroupServer'))
        const { state: roomInitGroupServer } = contextServer.get('roomInitGroupServer')

        console.log('init options:', roomInitGroupServer)

        return roomInitGroupServer.vhallSaasInstance.init(options).then(res => {
            if (res.code === 200) {
                state.inited = true;
                state.watchInitData = res.data;
                setRequestHeaders({
                    'interact-token': res.data.interact.interact_token
                })
            } else {
                state.watchInitErrorData = res;
            }
            return res
        });
    }

    const on = (type, cb) => {
        eventEmitter.$on(type, cb)
    }

    const destroy = () => {
        eventEmitter.$destroy()
    }

    // 设置活动是否为分组活动
    const setGroupStatus = (status) => {
        this.isGroupWebinar = status
    }

    // 获取分组初始化信息
    const getGroupInitData = (data) => {
        return requestApi.roomBase.getGroupInitData(data).then(res => {
            state.groupInitData = res.data;
            return res;
        })
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

    // 开始/恢复录制
    const startRecord = () => {
        return requestApi.roomBase.recordApi({
            status: 1
        })
    }

    // 暂停录制
    const pauseRecord = () => {
        return requestApi.roomBase.recordApi({
            status: 2
        })
    }

    // 结束录制
    const endRecord = () => {
        return requestApi.roomBase.recordApi({
            status: 3
        })
    }

    const init = (option) => {
        return getWatchInitData(option)
    }



    return { state, init, on, destroy, getWatchInitData, getWebinarInfo, getConfigList,
        startLive, endLive, setDevice, startRecord, pauseRecord, endRecord,
        getGroupInitData, setGroupStatus, setClientType }

}
