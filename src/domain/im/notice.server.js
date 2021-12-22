import contextServer from '@/domain/common/context.server.js';
import $http from '@/utils/http.js';

export default function useNoticeServer() {
    const state = {
        //公告列表
        noticeList: [],

        //请求的分页参数
        pageInfo: {
            pos: 0,
            limit: 10,
            pageNum: 1
        },
        //总页数
        totalPages: 1,
        //总条数
        total: 0,
    };

    const roomServer = contextServer.get('roomBaseServer');
    const {roomId = '', channelId = ''} = roomServer.state.watchInitData;

    //从服务器获取消息记录
    const fetchNoticeList = (params) => {
        return $http({
            url: '/v3/interacts/chat/get-announcement-list',
            type: 'POST',
            data: params
        });
    }

    //获取消息记录
    const getNoticeList = ({flag = false, params = {}}) => {

        if (!flag) {
            state.noticeList = [];
            state.pageInfo = {
                pos: 0,
                limit: 10,
                pageNum: 1
            };
            state.totalPages = 1;
            state.total = 0;
        } else {
            state.pageInfo.limit = params.limit;
            state.pageInfo.pos = params.pos;
            state.pageInfo.pageNum = params.pageNum;
        }


        return fetchNoticeList(params)
            .then(res => {
                if (res.code == 200 && res.data) {
                    state.total = res.data.total;
                    if (flag) {
                        state.noticeList.push(...res.data.list)
                    } else {
                        state.noticeList = res.data.list
                    }
                    state.totalPages = Math.ceil(res.data.total / state.pageInfo.limit);
                }
                return {backData:res,state};
            });
    }

    //发送消息
    const sendNotice = (params = {}) => {
        return $http({
            url: '/v3/interacts/chat/send-notice-message',
            type: 'POST',
            data: params
        });
    }

    return {state, sendNotice, getNoticeList, fetchNoticeList};
}
