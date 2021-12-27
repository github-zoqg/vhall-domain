import $http from '@/utils/http.js';
/**
 * 发送公告消息
 * */
function sendNotice(params = {}) {
    return $http({
        url: '/v4/im-chat/notice/send',
        type: 'POST',
        data: params
    });
}

/**
 * 获取公告列表
 * */
function getNoticeList(params = {}) {
    return $http({
        url: '/v4/im-chat/notice/get-list',
        type: 'POST',
        data: params
    });
}

export default {
    sendNotice,
    getNoticeList
};
