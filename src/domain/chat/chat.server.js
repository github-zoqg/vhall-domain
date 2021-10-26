/**
 * 聊天服务
 * */
import {textToEmojiText} from './emoji';
import Msg from './msg-class';
import contextServer from '@/domain/common/context.server.js';
import $http from '@/utils/http.js';

export default function useChatServer() {

    const state = {
        //聊天记录
        chatList: [],
        //过滤的敏感词列表
        keywordList: [],
        //预览图片地址
        imgUrls: [],

        page: 0,
        limit: 10,

        roomId: '',
        avatar: '',
        roleName: ''
    };

    //消息服务
    const msgServer = contextServer.get('msgServer');

    //基础服务
    const roomServer = contextServer.get('roomBaseServer');

    const {roomId = '', roleName, avatar = ''} = roomServer.state.watchInitData;

    //接收聊天消息
    const getHistoryMsg = async (params = {}) => {

        //请求获取聊天消息
        let backData = await fetchHistoryData(params);

        let list = [];

        if (backData.data.list.length > 0) {
            list = (backData.data.list || [])
                .map(item => {

                    //处理普通内容
                    item.data.text_content && (item.data.text_content = textToEmojiText(item.data.text_content));

                    //处理图片预览
                    item.data.image_urls && _handleImgUrl(item.data.image_urls);

                    //处理私聊列表
                    if (item.context && Array.isArray(item.context.at_list) && item.context.at_list.length && item.data.text_content) {
                        item.context.at_list = _handlePrivateChatList(item, item.context.at_list);
                    }

                    //格式化消息
                    return _handleGenerateMsg(item);
                })
                .reduce((acc, curr) => {
                    const showTime = curr.showTime;
                    acc.some(s => s.showTime === showTime) ? acc.push({...curr, showTime: ''}) : acc.push(curr);
                    return acc;
                }, [])
                .reverse()
                .filter(item => ['customPraise'].includes(item.type));

            state.chatList.unshift(...list);
        }
        //返回原始数据等以方便使用
        return {
            backData,
            list,
            chatList: state.chatList,
            imgUrls:state.imgUrls || []
        };
    }

    //发送聊天消息(这部分主要是提取自PC观看端)
    const sendMsg = (params = {}) => {

        let {inputValue, needFilter = true} = params;

        const data = {};

        //组装内容也可考虑交由视图
        if (inputValue) {
            data.type = 'text';
            data.barrageTxt = inputValue.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
            data.text_content = inputValue;
        }

        const context = {
            nickname: state.name, // 昵称
            avatar: state.avatar, // 头像
            role_name: state.roleName // 角色 1主持人2观众3助理4嘉宾
        }

        let filterStatus = true;

        if (needFilter && state.keywordList.length) {
            //只要找到一个敏感词，消息就不让发
            filterStatus = !state.keywordList.some(item => inputValue.includes(item.name));
        }

        return new Promise((resolve,reject)=>{
            if (roleName != 2 || (roleName == 2 && filterStatus)) {
                msgServer.$emit(data,context);
                resolve();
            }else{
                reject();
            }
        });

    }

    //发起请求，或者聊天记录数据
    const fetchHistoryData = (params) => {

        let defaultParams = {
            room_id: roomId,
            pos: state.page * state.limit,
            limit: state.limit
        };

        let mixedParams = Object.assign({}, defaultParams, params);

        return $http({
            url:'/v3/interacts/chat/get-list',
            type:'POST',
            data: mixedParams
        });

    }

    //获取keywordList
    const setKeywordList = (list=[]) => {
        state.keywordList = list;
    }

    //私有方法，处理图片链接
    const _handleImgUrl = (rawData) => {
        state.imgUrls.push(...rawData);
    }

    //私有方法，处理私聊列表
    const _handlePrivateChatList = (item, list = []) => {
        return list.map(a => {
            // 向前兼容fix 14968  历史消息有得是@
            if (item.data.text_content.indexOf('***') >= 0) {
                item.data.text_content = item.data.text_content.replace(
                    `***${a.nick_name}`,
                    `<span style='color:#4da1ff;float:left'>@${a.nick_name} &nbsp;</span> `
                )
            } else {
                item.data.text_content = item.data.text_content.replace(
                    `@${a.nick_name}`,
                    `<span style='color:#4da1ff;float:left'>@${a.nick_name} &nbsp;</span> `
                )
            }
            return a;
        });
    }

    //私有方法，组装消息（暂时按照的h5版本的,大致数据一致，具体业务逻辑操作有差异，后续返回一个promise，并返回未处理的原始数据，由视图自己决定如何处理）
    const _handleGenerateMsg = (item = {}) => {
        let params = {
            type: item.data.type,
            //todo avatar这里没有给出兜底图片，因为没有必要把兜底资源放这里，考虑由消费api的地方自行兜底
            avatar: item.avatar ? item.avatar : '',
            sendId: item.sender_id,
            showTime: item.show_time,
            nickName: item.nickname,
            roleName: item.role_name,
            sendTime: item.date_time,
            content: item.data,
            context: item.context,
            replyMsg: item.context.reply_msg,
            atList: item.context.at_list
        };
        let resultMsg = new Msg(params);
        if (item.data.event_type) {
            resultMsg = {
                ...resultMsg,
                type: item.data.event_type,
                event_type: item.data.event_type,
                content: {
                    source_status: item.data.source_status,
                    gift_name: item.data.gift_name,
                    gift_url: item.data.gift_url
                }
            }
        }
        return resultMsg;
    }

    return {state, getHistoryMsg, sendMsg,fetchHistoryData,setKeywordList};
}
