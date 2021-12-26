import $http from '@/utils/http.js';
import contextServer from '@/domain/common/context.server.js';

// 允许上下麦
const allowSpeak = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer');

    let retParams = {
        room_id: params.roomId || state.watchInitData.interact.room_id,
        receive_account_id: ''
    };
    retParams = Object.assign(retParams, params);

    return $http({
        url: '/v3/interacts/inav/agree-apply',
        type: 'POST',
        data: retParams
    });
};

// 用户上麦
const speakOn = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer');

    let retParams = {
        room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);

    return $http({
        url: '/v3/interacts/inav-user/speak',
        type: 'POST',
        data: retParams
    });
};

// 用户自己下麦
const speakOff = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer');

    let retParams = {
        room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);

    return $http({
        url: '/v3/interacts/inav-user/nospeak',
        type: 'POST',
        data: retParams
    });
};

// 设置其他人下麦
const speakUserOff = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer');

    let retParams = {
        room_id: params.room_id || state.watchInitData.interact.room_id
    };

    retParams = Object.assign(retParams, params);

    return $http({
        url: '/v3/interacts/inav/nospeak',
        type: 'POST',
        data: retParams
    });
};

// 允许举手
const setHandsUp = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer');

    let retParams = {
        room_id: params.room_id || state.watchInitData.interact.room_id,
        status: 0 // 1-允许 0-不允许
    };

    retParams = Object.assign(retParams, params);

    return $http({
        url: '/v3/interacts/inav/set-handsup',
        type: 'POST',
        data: retParams
    });
};

// 邀请上麦
const inviteMic = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer');

    let retParams = {
        room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);

    return $http({
        url: '/v3/interacts/inav/invite',
        type: 'POST',
        data: retParams
    });
};

// 取消申请
const cancelApply = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer');

    let retParams = {
        room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);

    return $http({
        url: '/v3/interacts/inav-user/cancel-apply',
        type: 'POST',
        data: retParams
    });
};

// 拒绝邀请上麦
const refuseInvite = (params = {}) => {
    const { state } = contextServer.get('roomBaseServer');

    let retParams = {
        room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);

    return $http({
        url: '/v3/interacts/inav-user/reject-invite',
        type: 'POST',
        data: retParams
    });
};

export default {
    allowSpeak, // 允许上麦
    speakOn, // 用户上麦
    speakOff, // 用户下麦
    speakUserOff, // 设置其他人下麦
    inviteMic, // 邀请上麦
    setHandsUp, // 允许举手
    cancelApply, // 取消申请
    refuseInvite // 拒绝邀请上麦
};
