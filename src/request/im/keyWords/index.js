import $http from '@/utils/http.js';

/**
 * 获取聊天关键词
 *
 * */
function getKeyWordsList(params = {}) {
    return $http({
        url: '/v4/interacts/keyword/get-list',
        type: 'POST',
        data: params
    });
}

export default {
    getKeyWordsList
};
