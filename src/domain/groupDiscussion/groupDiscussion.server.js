import contextServer from "@/domain/common/context.server.js"
export default function useGroupDiscussionServer() {
    // 收到切换小组消息,判断是否需要切换 channel
    const getGroupJoinChangeInfo = async (group_ids) => {
        const roomBaseServer = contextServer.get('roomBaseServer')
        const { groupInitData } = roomBaseServer.state
        // 备份之前的小组信息
        const oldGroupInitData = { ...groupInitData }
        // 如果在主直播间，并且 group_ids 中包括主直播间
        if (!oldGroupInitData.isInGroup && group_ids.indexOf(0) > -1) {
            // 重新获取最新的 groupInitData
            await roomBaseServer.getGroupInitData()
            const { groupInitData } = roomBaseServer.state
            // 如果新的小组跟之前的小组不一样则需要关心,否则不需要关心
            return {
                isNeedCare: groupInitData.isInGroup,
                from: 0,
                to: groupInitData.group_id
            }
        }
        // 如果是在小组中，并且 group_ids 中包括了该小组
        if (oldGroupInitData.isInGroup && group_ids.indexOf(oldGroupInitData.group_id) > -1) {
            await roomBaseServer.getGroupInitData()
            const { groupInitData } = roomBaseServer.state
            // 如果现在变为不在小组了,则需要关心
            if (!oldGroupInitData.isInGroup) {
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

    return { getGroupJoinChangeInfo }
}
