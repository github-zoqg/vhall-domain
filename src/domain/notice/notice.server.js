import contextServer from '@/domain/common/context.server.js';
import $http from '@/utils/http.js';
export default function useNoticeServer() {
    const state = {
        //公告列表
        noticeList: [],

        //请求的分页参数
        pageInfo:{
            pos: 0,
            limit: 10,
            pageNum: 1
        },
        //总页数
        totalPages:1,
        //总条数
        total:0,
    };

    const roomServer = contextServer.get('roomBaseServer');
    const {roomId = '', channelId = ''} = roomServer.state.watchInitData;

    //更新当前公告列表
    const updateContentList = (msg) => {
        state.noticeList.unshift({
            text: msg.room_announcement_text,
            time: msg.push_time
        });
    }

    //获取消息记录
    const getNoticeList = ({isFirst=false,roomId='',isCache=1})=>{

        if (isFirst) {
            state.noticeList = [];
            state.pageInfo = {
                pos: 0,
                limit: 10,
                pageNum: 1
            };
        }

        //todo 待替换为相应服务
       return  _fetchNoticeList({
            roomId: roomId,
            is_cache: 1,
            ...state.pageInfo
        }).then(res => {
            if (res.code == 200 && res.data) {
                state.total = res.data.total;
                if (!isFirst) {
                    state.noticeList.push(...res.data.list)
                } else {
                    state.noticeList = res.data.list
                }
                state.totalPages = Math.ceil(res.data.total / state.pageInfo.limit);
            }
        });
    }

    //发送消息
    const sendNotice = (params = {}) => {
        //todo 借助api发送消息,返回一个promise
        const {content = '', roomId = '', channelId = ''} = params;
        let requestParams = {
            room_id: state.roomId,
            channel_id: state.channelId,
            body: content
        };

        return _fetchNoticeList(params);
    }

    //从服务器获取消息记录
    const _fetchNoticeList = (params)=>{
        return $http({
            url: '/v3/interacts/chat/send-notice-message',
            type: 'POST',
            data: params
        });
    }

    return {state, updateContentList, sendNotice,getNoticeList};
}
