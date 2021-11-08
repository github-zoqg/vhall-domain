import contextServer from '@/domain/common/context.server.js'
import { isPc, merge, randomNumGenerator } from '@/utils/index.js'

export default function useMsgServer() {
    const state = {
        msgInstance: null,
        eventsPool: [],
        msgSdkInitOptions: {}
    }

    let groupMsgInstance = null

    const _eventhandlers = {
        ROOM_MSG: [],
        CHAT: [],
        CUSTOM_MSG: [],
        OFFLINE: [],
        ONLINE: [],
        DOC_MSG: [],
        JOIN: [],
        LEFT: []
    }

    // 发送房间消息
    const sendChatMsg = (data, context) => {
        if (state.groupMsgInstance) {
            state.groupMsgInstance.emitTextChat(data, context)
        } else {
            state.msgInstance.emitTextChat(data, context)
        }
    }

    // 发送房间消息
    const sendRoomMsg = (data) => {
        if (state.groupMsgInstance) {
            state.groupMsgInstance.emitRoomMsg(data)
        } else {
            state.msgInstance.emitRoomMsg(data)
        }
    }

    // 为聊天实例注册事件
    const _addListeners = (instance) => {
        for (let eventType in _eventhandlers) {
            instance.$on(eventType, (msg) => {
                if (_eventhandlers[eventType].length) {
                    _eventhandlers[eventType].forEach((handler) => {
                        handler(msg)
                    })
                }
            })
        }
    }

    // 为聊天实例注销事件
    const _removeListeners = (instance) => {
        for (let eventType in _eventhandlers) {
            instance.$off(eventType)
        }
    }

    Object.defineProperty(state, 'groupMsgInstance', {
        get() {
            return groupMsgInstance
        },
        set(newVal) {
            // 如果新值旧值都为假，或者新值旧值相同，直接 return
            if (!newVal && !groupMsgInstance || newVal === groupMsgInstance) return

            if (!newVal) { // 如果是销毁子房间实例，重新注册主房间事件
                state.msgInstance && _addListeners(state.msgInstance)
            } else { // 如果是新创建子房间实例，注销主房间事件
                state.msgInstance && _removeListeners(state.msgInstance)
            }

            groupMsgInstance = newVal
        }
    })

    // 获取主房间聊天sdk初始化默认参数
    const getDefaultOptions = () => {
        const { state: roomBaseServerState } = contextServer.get('roomBaseServer')

        const isPcClient = isPc()

        const { watchInitData, groupInitData } = roomBaseServerState

        const defaultContext = {
            nickname: watchInitData.join_info.nickname,
            avatar: watchInitData.join_info.avatar,
            pv: watchInitData.pv.num2 || watchInitData.pv.real, // pv
            uv: watchInitData.online.num || watchInitData.online.virtual,
            role_name: watchInitData.join_info.role_name,
            device_type: isPcClient ? '2' : '1', // 设备类型 1手机端 2PC 0未检测
            device_status: '0', // 设备状态  0未检测 1可以上麦 2不可以上麦
            audience: roomBaseServerState.clientType === 'send',
            kick_mark: `${randomNumGenerator()}${watchInitData.webinar.id}`,
            privacies: watchInitData.join_info.privacies || '',
            group_id: groupInitData.group_id || null
        }

        const defaultOptions = {
            context: defaultContext,
            appId: watchInitData.interact.paas_app_id,
            accountId: watchInitData.join_info.third_party_user_id,
            channelId: watchInitData.interact.channel_id,
            token: watchInitData.interact.paas_access_token,
            hide: false, // 是否隐身
        }

        return defaultOptions
    }

    // 初始化主房间聊天sdk
    const init = (customOptions = {}) => {
        if (!contextServer.get('roomInitGroupServer')) return
        const { state: roomInitGroupServerState } = contextServer.get('roomInitGroupServer')

        const defaultOptions = getDefaultOptions()

        const options = merge.recursive({}, defaultOptions, customOptions)
        console.log('聊天初始化参数', options)

        state.msgSdkInitOptions = options

        return roomInitGroupServerState.vhallSaasInstance.createChat(options).then(res => {
            state.msgInstance = res
            if (!state.groupMsgInstance) {
                _addListeners(res)
            }
            return res
        })
    }

    // 设置主频道静默状态
    const setMainChannelMute = (mute) => {
        if (mute) {
            _removeListeners(state.msgInstance)
        } else {
            _addListeners(state.msgInstance)
        }
    }

    // 获取子房间聊天sdk初始化默认参数
    const getGroupDefaultOptions = () => {
        const { state: roomBaseServerState } = contextServer.get('roomBaseServer')

        const isPcClient = isPc()

        const { watchInitData, groupInitData } = roomBaseServerState

        const defaultContext = {
            nick_name: watchInitData.join_info.nickname,
            avatar: watchInitData.join_info.avatar,
            role_name: watchInitData.join_info.role_name,
            device_type: isPcClient ? '2' : '1', // 设备类型 1手机端 2PC 0未检测
            device_status: '0', // 设备状态  0未检测 1可以上麦 2不可以上麦
            is_banned: groupInitData.is_banned, // 是否禁言 1是 0否
            watch_type: isPcClient ? '1' : '2', // 1 pc  2 h5  3 app  4 是客户端
        }

        const defaultOptions = {
            context: defaultContext,
            appId: watchInitData.interact.paas_app_id,
            accountId: watchInitData.join_info.third_party_user_id,
            channelId: groupInitData.channel_id,
            token: groupInitData.access_token,
            hide: false, // 是否隐身
        }

        return defaultOptions
    }

    // 初始化子房间聊天sdk
    const initGroupMsg = (customOptions = {}) => {
        if (!contextServer.get('roomInitGroupServer')) return
        const { state: roomInitGroupServerState } = contextServer.get('roomInitGroupServer')

        const defaultOptions = getGroupDefaultOptions()

        const options = merge.recursive({}, defaultOptions, customOptions)

        state.groupMsgSdkInitOptions = options
        console.log('创建子房间聊天实例', options)
        return roomInitGroupServerState.vhallSaasInstance.createChat(options).then(res => {
            state.groupMsgInstance = res
            _addListeners(res)
            return res
        })
    }

    // 注册事件
    const $on = (eventType, fn) => {
        if (!_eventhandlers.hasOwnProperty(eventType)) {
            throw new TypeError('Invalid eventType')
        }
        _eventhandlers[eventType].push(fn)
    }

    // 注销事件
    const $off = (eventType, fn) => {
        if (!isPropertityExist(_eventhandlers, eventType)) {
            throw new TypeError('Invalid eventType')
        }

        if (!fn) {
            _eventhandlers[eventType] = []
        }

        const index = _eventhandlers[eventType].indexOf(fn)
        if (index > -1) {
            _eventhandlers.splice(index, 1)
        }
    }

    // 销毁子房间聊天实例
    const destroyGroupMsg = () => {
        if (!state.groupMsgInstance) return
        state.groupMsgInstance.destroy()
        state.groupMsgInstance = null
    }

    // 销毁主房间聊天实例
    const destroy = () => {
        if (!state.msgInstance) return
        state.msgInstance.destroy()
        state.msgInstance = null
    }

    return { state, init, initGroupMsg, destroy, destroyGroupMsg, $on, $off,
        getGroupDefaultOptions, getDefaultOptions, setMainChannelMute, sendRoomMsg,
        sendChatMsg }
}
