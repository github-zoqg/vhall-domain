import $http from '@/utils/http.js';

/**
 * 获取历史聊天消息
 * */
function getChatList(params = {}) {
    return $http({
        url: '/v3/interacts/chat/get-list',
        type: 'POST',
        data: params
    });
}

/**
 * 删除聊天消息
 * */
function deleteMessage(params = {}) {
    return $http({
        url: '/v4/interacts/chat/delete-message',
        type: 'POST',
        data: params
    });
}

export default {
    getChatList,
    deleteMessage
}
