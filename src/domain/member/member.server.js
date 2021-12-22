import $http from '@/utils/http.js';
export default function userMemberServer(){
    const state = {
        //在线的成员
        onlineUsers:[],
        //申请上麦的人员
        applyUsers:[],
        //是否刷新了
        isRefresh:false,

        //总数
        totalNum:0,
        //当前页数
        page:1,

        //举手状态
        raiseHandTip:false

    };

    //设置state的值
    const setState = (key, value) => {
        state[key] = value;
    }

    //请求在线成员列表然后处理
    const getOnlineUserList = (params = {}) => {
        return _getOnlineUser(params)
            .then(res => {
                console.warn('当前在线人员列表', res);

                if(res && [200,'200'].includes(res.code)){

                    if (state.isRefesh) {
                        state.onlineUsers = _sortUsers(res.data.list);
                        state.isRefesh = false;
                        console.log('>>>>>>aaaa2', state.applyUsers)
                        state.applyUsers.forEach(element => {
                            state.onlineUsers.forEach(item => {
                                if (element.accountId == item.accountId) {
                                    item.isApply = true
                                }
                            })
                        })
                    }

                    if (!state.isRefesh && res.data.list.length === 0) {
                        state.page--;
                    }

                    state.totalNum = res.data.total;
                }

                if(![200,'200'].includes(res.code)){
                    state.page--;
                }

                return res;
            });
    }

    /**
     * 将在线人员列表分为五个部分排序 主持人 / 上麦嘉宾 / 下麦嘉宾 / 助理 / 上麦观众 / 普通观众
     */
   const  _sortUsers =  (list=[])=> {
        let host = []; // 主持人
        let onMicGuest = []; // 上麦嘉宾
        let downMicGuest = []; // 下麦嘉宾
        let assistant = []; // 助理
        let onMicAudience = []; // 上麦观众
        let downMicAudience = []; // 普通观众
        list.forEach(item => {
            switch (Number(item.role_name)) {
                // 主持人
                case 1:
                    host.push(item);
                    break;

                // 观众
                case 2:
                    item.is_speak
                        ? onMicAudience.push(item)
                        : downMicAudience.push(item);
                    break;

                // 助理
                case 3:
                    assistant.push(item);
                    break;

                // 嘉宾
                case 4:
                    item.is_speak ? onMicGuest.push(item) : downMicGuest.push(item);
                    break;
                default:
                    console.error('角色未定义');
            }
        });

        // 加载更多的时候，如果普通观众超过200，只显示后200
        if (downMicAudience.length > 200) {
            downMicAudience = downMicAudience.slice(-200);
        }
        return host.concat(
            onMicGuest,
            downMicGuest,
            assistant,
            onMicAudience,
            downMicAudience
        );
    }

    //请求在线成员列表
    const _getOnlineUser = (params={})=>{
        return $http({
            url: '/v3/interacts/chat-user/get-online-list',
            type: 'POST',
            data: params
        });
    }

    //踢出成员
    const kickedUser = (params={})=>{
       return _kickedUser(params)
           .then(res=>{
               return res;
           })
    }

    //禁言成员
    const mutedUser = (params={})=>{
       return _mutedUser(params)
           .then(res=>{
               return res;
           });
    }



    //请求踢出成员
    const _kickedUser = (params={})=>{
        return $http({
            url: '/v3/interacts/chat-user/set-kicked',
            type: 'POST',
            data: params
        });
    }


    //请求禁言
    const _mutedUser = (params={})=>{
        return $http({
            url: '/v3/interacts/chat-user/set-banned',
            type: 'POST',
            data: params
        });
    }

    //请求禁言的成员列表
    const getMutedUserList = (params={})=>{
        return $http({
            url: '/v3/interacts/chat-user/get-banned-list',
            type: 'POST',
            data: params
        });
    }
    //请求踢出的成员列表
    const getKickedUserList = (params={})=>{
        return $http({
            url: '/v3/interacts/chat-user/get-kicked-list',
            type: 'POST',
            data: params
        });
    }

    /**
     * 邀请演示、邀请上麦
     * v3/interacts/inav/invite
     * */
    function inviteUserToInteract(){

    }

    /**
     * 结束演示
     * /v3/interacts/inav/nopresentation
     * /v3/interacts/inav-user/nopresentation
     * todo 考虑跟后端沟通，是否接口可以合并
     * */
    function endPresentation(){

    }

    /**
     * 踢出活动、踢出小组
     * /v3/interacts/chat-user/set-kicked
     * */
    function setKicked(){

    }

    /**
     * 同意上麦
     * /v3/interacts/inav/agree-apply
     * */
    function agreeApply(){

    }

    /**
     * 用户下麦
     * /v3/interacts/inav/nospeak
     * */
    function noSpeak(){

    }

    /**
     * 我要演示
     * /v3/interacts/inav-user/presentation
     * */
    function applyPresentation(){

    }



    return {
        state,
        setState,
        getOnlineUserList,
        getMutedUserList,
        getKickedUserList,
        mutedUser,
        kickedUser,
        inviteUserToInteract,
        endPresentation,
        setKicked,
        agreeApply,
        noSpeak,
        applyPresentation
    };
}
