/**
 * 聊天服务
 * */
import { textToEmojiText } from './emoji';
import Msg from './msg-class';
import contextServer from '@/domain/common/context.server.js';
import { im as iMRequest } from '@/request/index.js';

export default function useChatServer() {
  let state = {
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
    roleName: '',
    defaultAvatar: ''
  };


  //消息服务
  const msgServer = contextServer.get('msgServer');

  //消息sdk
  const { msgInstance } = msgServer.state;

  //基础服务
  const roomServer = contextServer.get('roomBaseServer');

  const { roomId = '', roleName, avatar = '' } = roomServer.state.watchInitData;

  //setSate
  function setState(key, value) {
    state[key] = value;
  }

  //接收聊天消息
  async function getHistoryMsg(params = {}, from = '观看端') {
    //请求获取聊天消息
    let backData = await fetchHistoryData(params);

    let list = (backData.data.list || [])
      .map(item => {
        //处理普通内容
        item.data.text_content &&
          (item.data.text_content = textToEmojiText(item.data.text_content));

        //处理图片预览
        item.data.image_urls && _handleImgUrl(item.data.image_urls);

        //处理私聊列表
        if (
          item.context &&
          Array.isArray(item.context.at_list) &&
          item.context.at_list.length &&
          item.data.text_content
        ) {
          item.context.at_list = _handlePrivateChatList(item, item.context.at_list);
          //发起端的特殊处理，可以考虑统一
          item.context.atList = item.context.at_list;
        }

        //格式化消息
        return _handleGenerateMsg(item, from);
      })
      .reduce((acc, curr) => {
        const showTime = curr.showTime;
        acc.some(s => s.showTime === showTime)
          ? acc.push({ ...curr, showTime: '' })
          : acc.push(curr);
        return acc;
      }, [])
      .reverse()
      .filter(item => !['customPraise'].includes(item.type));

    if (['观看端'].includes(from)) {
      list.forEach((msg, index) => {
        if (index !== 0) {
          const preMsgTime = list[index - 1].sendTime;
          if (preMsgTime.slice(0, 13) === msg.sendTime.slice(0, 13)) {
            msg.showTime = '';
          }
        }
      });
    }

    state.chatList.unshift(...list);

    //返回原始数据等以方便使用
    return {
      backData,
      list,
      chatList: state.chatList,
      imgUrls: state.imgUrls || []
    };
  }

  // 清空聊天消息
  function clearHistoryMsg() {
    state.chatList.splice(0, state.chatList.length);
  }

  //发送聊天消息
  function sendMsg(params = {}) {
    let { inputValue, needFilter = true, data = {}, context = {} } = params;
    // let filterStatus = checkHasKeyword(needFilter, inputValue);
    // return new Promise((resolve, reject) => {
    //     if (roleName != 2 || (roleName == 2 && filterStatus)) {
    //         msgServer.$emit(data, context);
    //         resolve();
    //     } else {
    //         reject();
    //     }
    // });

    return new Promise((resolve, reject) => {
      msgServer.sendChatMsg(data, context);
      resolve();
    });
  }

  //发起请求，或者聊天记录数据
  function fetchHistoryData(params) {
    return iMRequest.chat.getChatList(params);
  }

  //获取keywordList
  function setKeywordList(list = []) {
    state.keywordList = list;
  }

  //检测是否包含敏感词
  function checkHasKeyword(needFilter = true, inputValue) {
    let filterStatus = true;

    if (needFilter && state.keywordList.length) {
      //只要找到一个敏感词，消息就不让发
      filterStatus = !state.keywordList.some(item => inputValue.includes(item.name));
    }

    return filterStatus;
  }

  //私有方法，处理图片链接
  function _handleImgUrl(rawData) {
    state.imgUrls.push(...rawData);
  }

  //私有方法，处理私聊列表
  function _handlePrivateChatList(item, list = [], from = '观看端') {
    if (['观看端'].includes(from)) {
      return list.map(a => {
        item.data.text_content = item.data.text_content.replace(
          `***${a.nick_name}`,
          `@${a.nick_name}`
        );
        return a;
      });
    }

    if (['h5'].includes(from)) {
      return list.map(a => {
        // 向前兼容fix 14968  历史消息有得是@
        if (item.data.text_content.indexOf('***') >= 0) {
          item.data.text_content = item.data.text_content.replace(
            `***${a.nick_name}`,
            `<span style='color:#4da1ff;float:left'>@${a.nick_name} &nbsp;</span> `
          );
        } else {
          item.data.text_content = item.data.text_content.replace(
            `@${a.nick_name}`,
            `<span style='color:#4da1ff;float:left'>@${a.nick_name} &nbsp;</span> `
          );
        }
        return a;
      });
    }
  }

  //私有方法，组装消息（暂时按照的h5版本的,大致数据一致，具体业务逻辑操作有差异，后续返回一个promise，并返回未处理的原始数据，由视图自己决定如何处理）
  function _handleGenerateMsg(item = {}, from = '') {
    let params = {};

    if (['观看端', '发起端'].includes(from)) {
      params = {
        type: item.data.type,
        avatar: item.avatar ? item.avatar : state.defaultAvatar,
        sendId: item.sender_id,
        showTime: item.showTime,
        nickName: item.nickname,
        roleName: item.role_name,
        sendTime: item.date_time,
        content: item.data,
        replyMsg: item.context.reply_msg,
        atList: item.context.atList,
        msgId: item.msg_id,
        channel: item.channel_id,
        isHistoryMsg: true
      };

      if (['发起端'].includes(from) && params.avatar === '') {
        params.avatar =
          'https://cnstatic01.e.vhall.com/3rdlibs/vhall-static/img/default_avatar.png';
      }
    }

    if (['h5'].includes(from)) {
      params = {
        type: item.data.type,
        avatar: item.avatar ? item.avatar : state.defaultAvatar,
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
    }

    let resultMsg = new Msg(params, from);
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
      };
      if (['观看端'].includes(from)) {
        resultMsg.nickName =
          item.nickname.length > 8 ? item.nickname.substr(0, 8) + '...' : item.nickname;
        resultMsg.interactToolsStatus = true;
      }
    }
    return resultMsg;
  }

  /**
   * 禁言
   * */
  function setBanned(params = {}) {
    return iMRequest.chat.setBanned(params);
  }

  /**
   * 全体禁言
   * /v3/interacts/chat-user/set-all-banned
   * */
  function setAllBanned(params = {}) {
    return iMRequest.chat.setAllBanned(params);
  }

  /**
   * 删除消息
   * /v3/interacts/chat/delete-message
   * */
  function deleteMessage(params) {
    return iMRequest.chat.deleteMessage(params);
  }

  /**
   * 踢出
   * /v3/interacts/chat-user/set-kicked
   * */
  function setKicked(params = {}) {
    return iMRequest.chat.setKicked(params);
  }

  /**
   * 获取关键词
   * */
  function getKeyWordsList(params = {}) {
    return iMRequest.keyWords.getKeyWordsList(params);
  }

  const result = {
    state,
    setState,
    getHistoryMsg,
    clearHistoryMsg,
    sendMsg,
    fetchHistoryData,
    setKeywordList,
    checkHasKeyword,
    setBanned,
    setAllBanned,
    deleteMessage,
    setKicked,
    getKeyWordsList
  };

  contextServer.set('chatServer', result);

  return result;
}
