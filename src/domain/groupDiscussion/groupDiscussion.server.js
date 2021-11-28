import contextServer from "@/domain/common/context.server.js"
import { isPc } from '@/utils/index.js'

export default function useGroupDiscussionServer() {
    // 收到切换小组消息,判断是否需要切换 channel
    const getGroupJoinChangeInfo = async (group_ids) => {
        const roomBaseServer = contextServer.get('roomBaseServer')
        const { groupInitData } = roomBaseServer.state
        // 备份之前的小组信息
        const oldGroupInitData = JSON.parse(JSON.stringify(groupInitData))
        console.log('domain -------- oldGroupInitData', oldGroupInitData)
        // 如果在主直播间，并且 group_ids 中包括主直播间
        if (!oldGroupInitData.isInGroup && group_ids.indexOf(0) > -1) {
            // 重新获取最新的 groupInitData
            await roomBaseServer.getGroupInitData()
            const { groupInitData } = roomBaseServer.state
            console.log('domain -------- groupInitData', groupInitData)
            // 如果新的小组跟之前的小组不一样则需要关心,否则不需要关心
            return {
                isNeedCare: groupInitData.isInGroup,
                from: 0,
                to: groupInitData.group_id
            }
        }
        // 如果是在小组中，并且 group_ids 中包括了该小组
        if (oldGroupInitData.isInGroup && group_ids.indexOf(Number(oldGroupInitData.group_id)) > -1) {
            await roomBaseServer.getGroupInitData()
            const { groupInitData } = roomBaseServer.state
            console.log('domain -------- groupInitData', groupInitData)
            // 如果现在变为不在小组了,则需要关心
            if (!groupInitData.isInGroup) {
                return {
                    isNeedCare: true,
                    from: oldGroupInitData.group_id,
                    to: 0
                }
            }
            // 如果新的小组跟之前的小组不一样则需要关心,否则不需要关心
            return {
                isNeedCare: oldGroupInitData.group_id !== groupInitData.group_id,
                from: oldGroupInitData.group_id,
                to: groupInitData.group_id
            }
        }
        // 如果不满足上述两个 if 则不需要关心
        return {
            isNeedCare: false,
            from: oldGroupInitData.isInGroup ? oldGroupInitData.group_id : 0,
            to: oldGroupInitData.isInGroup ? oldGroupInitData.group_id : 0
        }
    }

    // 分组直播，进出子房间需要在主房间发消息，维护主房间 online-list
    const sendMainRoomJoinChangeMsg = (options = { isJoinMainRoom: false, isBanned: false }) => {
        const roomBaseServer = contextServer.get('roomBaseServer')
        const msgServer = contextServer.get('msgServer')
        const { watchInitData } = roomBaseServer.state
        const { msgInstance } = msgServer.state

        const isPcClient = isPc()

        const body = {
            type: 'main_room_join_change',
            nickname: watchInitData.join_info.nickname,
            accountId: watchInitData.join_info.third_party_user_id,
            isJoinMainRoom: options.isJoinMainRoom,
            role_name: watchInitData.join_info.role_name,
            device_type: isPcClient ? '2' : '1',
            isBanned: options.isBanned
        }

        msgInstance && msgInstance.emitRoomMsg(body)
    }

    return { getGroupJoinChangeInfo, sendMainRoomJoinChangeMsg }
}
