import requestApi from "@/request/index.js";

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

    const iMRequest = requestApi.im;

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


        return iMRequest.notice.getNoticeList(params)
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
                return {backData: res, state};
            });
    }

    /**
     * 发送公告消息
     * */
    function sendNotice(params = {}) {
        return iMRequest.notice.sendNotice(params);
    }

    return {state, sendNotice, getNoticeList};
}
