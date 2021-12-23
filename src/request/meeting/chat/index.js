import $http from '@/utils/http.js';

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

export default {
    getBannedList,
    getKickedList,
    getOnlineList,
    getBoundedList,

    setBanned,
    setAllBanned,
    setKicked
}
