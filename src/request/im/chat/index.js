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
        url: '/v4/im-chat/chat/delete',
        type: 'POST',
        data: params
    });
}
/**
 * 批量删除聊天消息
 * */
function batchDeleteMessage(params = {}) {
    return $http({
        url: '/v4/interacts/chat/batch-delete-message',
        type: 'POST',
        data: params
    });
}

/**
 * 删除活动所有聊天的消息
 * */
function deleteRoomMessage(params = {}) {
    return $http({
        url: '/v3/interacts/chat/delete-room-message',
        type: 'POST',
        data: params
    });
}

/**
 * 删除用户所有聊天的消息
 * */
function deleteUserMessage(params = {}) {
    return $http({
        url: '/v4/im-chat/chat/delete-user-message',
        type: 'POST',
        data: params
    });
}

/**
 * 获取禁言用户列表
 * */
function getBannedList(params={}){
    return $http({
        url: '/v4/interacts/chat-user/get-banned-list',
        type: 'POST',
        data: params
    });
}

/**
 * 获取踢出用户列表
 * */
function getKickedList(params={}){
    return $http({
        url: '/v4/interacts/chat-user/get-kicked-list',
        type: 'POST',
        data: params
    });
}

/**
 * 获取在线用户列表
 * */
function getOnlineList(params={}){
    return $http({
        url: '/v4/interacts/chat-user/get-online-list',
        type: 'POST',
        data: params
    });
}

/**
 * 获取受限用户列表
 * */
function getBoundedList(params={}){
    return $http({
        url: '/v4/interacts/chat-user/get-bounded-list',
        type: 'POST',
        data: params
    });
}

/**
 * 设置 / 取消用户禁言
 * */
function setBanned(params={}){
    return $http({
        url: '/v4/interacts/chat-user/set-banned',
        type: 'POST',
        data: params
    });
}

/**
 * 设置 / 取消全体用户禁言
 * */
function setAllBanned(params={}){
    return $http({
        url: '/v4/interacts/chat-user/set-all-banned',
        type: 'POST',
        data: params
    });
}

/**
 * 踢出用户 / 取消踢出
 * */
function setKicked(params={}){
    return $http({
        url: '/v4/interacts/chat-user/set-kicked',
        type: 'POST',
        data: params
    });
}

/**
 * 发送自定义消息
 * */
function sendCustomMessage(params={}){
    return $http({
        url: '/v4/interacts/chat/send-custom-message',
        type: 'POST',
        data: params
    });
}

export default {
    getChatList,
    getBannedList,
    getKickedList,
    getOnlineList,
    getBoundedList,
    setBanned,
    setAllBanned,
    setKicked,
    deleteMessage,
    batchDeleteMessage,

    sendCustomMessage,

}
