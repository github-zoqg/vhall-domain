/*
 * @Author: yincece(cece.yin@vhall.com) 
 * @Date: 2022-07-21 11:29:14
 * @Desc: 状态-用户
 */

import useMicServer from '../media/mic.server.js';
import useRoomBaseServer from '../room/roombase.server';
import useGroupServer from '../group/StandardGroupServer';
import { WATCH_WEBINAR_MODE } from './status.const';

// 当前用户是否在上麦列表中
const isSpeaker = () => {
	const { watchInitData } = useRoomBaseServer().state;
	return useMicServer().getSpeakerByAccountId(watchInitData.join_info.third_party_user_id);
};

// 如果当前用户在上麦列表中，mute 状态需要从上麦列表中获取，否则默认开启
export const getSpeakerValue = () => {
	const { watchInitData } = useRoomBaseServer().state;
	const speakerValue = useMicServer().getSpeakerByAccountId(watchInitData.join_info.third_party_user_id);
	if (speakerValue) {
		return {
			audio: speakerValue.audioMuted,
			video: speakerValue.videoMuted
		};
	}
	// 否则返回为空
	return null;
};

// 获取server数据
export const getBaseInfo = () => {
	const { watchInitData, interactToolStatus } = useRoomBaseServer().state;
	const { groupInitData } = useGroupServer().state
	const {
		isInGroup,
		doc_permission
	} = groupInitData;
	const {
		third_party_user_id,
		role_name,
		nickname
	} = watchInitData.join_info;
	const isGroupLeader = isInGroup && third_party_user_id === doc_permission;
	const roleName = isGroupLeader ? GROUP_LEADER : role_name;
	// 是否是上麦
	const isWebinarMode = watchInitData.webinar.mode === WATCH_WEBINAR_MODE;
	

	return {
		watchInitData,
		interactToolStatus,
		groupInitData,
		isGroupLeader,
		groupLeaderRoleName: roleName,
		roleName,
		nickname,
		isWebinarMode,
		attributes: {
			roleName,
			accountId: third_party_user_id,
			nickname: nickname,
			nickName: nickname // app端字段不统一，过渡方案，待字段统一后可删除
		}
	};
};