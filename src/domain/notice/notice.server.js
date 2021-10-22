export default function useNoticeServer() {
    const state = {
        //公告列表
        contentList: []
    };

    const init = (params = {}) => {
        const {roomId = '', channelId = ''} = params;
        state.roomId = roomId;
        state.channelId = channelId;
    }

    //更新当前公告列表
    const updateContentList = (msg) => {
        state.contentList.unshift({
            text: msg.room_announcement_text,
            time: msg.push_time
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
        return Promise.resolve();
    }

    return {state, updateContentList, sendNotice};
}
