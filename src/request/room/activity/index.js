import $http from '@/utils/http.js';

/**
 * 查询活动基础信息
 * */
function getActivityBasicInfo(params = {}) {
    return $http({
        url: '/v4/room/webinar/info',
        type: 'POST',
        data: params
    });
}

export default {
    getActivityBasicInfo
}
