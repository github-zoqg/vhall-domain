import {im as iMRequest, qa as qARequest} from '@/request/index.js';
import BaseServer from '@/domain/common/base.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
//消息服务
const msgServer = useMsgServer();

class ChatAuthServer extends BaseServer {
  constructor() {
    if (typeof ChatAuthServer.instance === 'object') {
      return ChatAuthServer.instance;
    }
    super();
    this.state = {
      //房间信息，这里只能通过接口获取
      roomInfo: {
        room_id: '',
        vss_token: ''
      },
      //活动原始信息
      watchInitData: {},
      //基础频道信息
      baseChanelInfo: {
        app_id: '',
        client: 'pc_browser',
        access_token: '',
        channel_id: '',
        third_party_user_id: null, // 支持人的id
        package_check: '1.7.1'
      },
      //操作人员id
      operatorId: '',
      //操作人员的角色
      roleName: '',
      //是否是主持人
      hostUserId: '',
      //活动标题
      activityTitle: '',
      //起始时间
      createTime: '',
      //消息服务实例
      messageServerInstance: null,
    };
    ChatAuthServer.instance = this;
    return this;
  }

  /**
   * 初始化方法
   * */
  init() {

  }

  /**
   * 初始化监听事件
   * */
  listenEvents() {
    // msgServer.$onMsg('CHAT', rawMsg => {
    //   let temp = Object.assign({}, rawMsg);
    //   if (typeof temp.data !== 'object') {
    //     temp.data = JSON.parse(temp.data);
    //     temp.context = JSON.parse(temp.context);
    //   }
    //   const { type = '' } = temp.data || {};
    //   switch (type){
    //     case "disable":
    //       break;
    //     case 'permit':
    //       break;
    //     default:
    //       break;
    //   }
    // });
    // msgServer.$onMsg('ROOM_MSG',rawMsg=>{
    //   let temp = Object.assign({}, rawMsg);
    //   if (typeof temp.data !== 'object') {
    //     temp.data = JSON.parse(temp.data);
    //     temp.context = JSON.parse(temp.context);
    //   }
    //   const { type = '' } = temp.data || {};
    // })
  }

  /**
   * 初始化房间信息，聊天实例等
   * */
  initRoomInfo(params = {}) {
    return this.getRoomInfo(params)
      .then(res => {
        console.warn('获取到的关键信息点---', res.data);
        //保存一份活动信息
        this.state.watchInitData = Object.assign(res.data || {});
        const {interact = {}, join_info = {}, webinar = {}} = res.data || {};
        this.state.roomInfo.room_id = interact.room_id;
        this.state.roomInfo.vss_token = interact.paas_access_token;
        this.state.operatorId = join_info.third_party_user_id;
        this.state.activityTitle = webinar.subject;
        this.state.roleName = join_info.role_name;
        this.state.hostUserId = webinar.userinfo.user_id; // 是否是主持人
        this.state.createTime = '2020-12-09 19:52:00'.split(' ')[0].split('-').join('/');
        // appId 必须
        this.state.baseChanelInfo.app_id = interact.paas_app_id;
        // 第三方用户ID
        this.state.baseChanelInfo.third_party_user_id = join_info.third_party_user_id;
        // 必须， token，初始化接口获取
        this.state.baseChanelInfo.access_token = interact.paas_access_token;
        // 频道id 必须
        this.state.baseChanelInfo.channel_id = interact.channel_id;

        this.listenEvents();
        return res;
      });
  }

  /**
   * 获取房间信息
   * */
  getRoomInfo(params = {}) {
    return qARequest.list.initChatMess(params);
  }


  /**
   * 开启/关闭聊天审核
   * /sdk/v2/message/set-channel-switch
   * */
  toggleChatAuthStatus(params = {}) {
    return iMRequest.chatAuth.toggleChatAuthStatus(params);
  }

  /**
   * 获取聊天审核列表
   * /sdk/v2/message/get-chat-audit-lists
   * */
  getAuditMessageList(params = {}) {
    return iMRequest.chatAuth.getChatAuditList(params);
  }

  /**
   * 获取已通过列表
   * /sdk/v2/message/lists
   * */
  getPassedMessageList(params = {}) {
    return iMRequest.chatAuth.getPassedMessageList(params);
  }

  /**
   * 获取禁言列表
   * /v3/interacts/chat-user/get-banned-list
   * */
  getBannedList(params = {}) {
    return iMRequest.chat.getBannedList(params);
  }

  /**
   * 获取踢出列表
   * /v3/interacts/chat-user/get-kicked-list
   * */
  getKickedList(params = {}) {
    return iMRequest.chat.getKickedList(params);
  }

  /**
   * 对消息进行操作 (通过、阻止、通过并回复,全部阻止，全部通过)
   * /sdk/v2/message/apply-message-send
   * */
  operateMessage(params = {}) {
    return iMRequest.chatAuth.applyMessageSend(params);
  }

  /**
   * 过滤设置开关 （过滤设置：未审核超过200条时自动发送 / 阻止）
   * /sdk/v2/message/set-channel-switch-options
   * */
  setMessageFilterOptions() {
  }

  /**
   * 获取聊天设置开关状态
   * */
  getChatAuthEnableStatus(params = {}) {
    return iMRequest.chatAuth.getChatAuthStatus(params);
  }

  /**
   * 取消禁言
   * /v3/interacts/chat-user/set-banned
   * */
  toggleBannedStatus(params = {}) {
    return iMRequest.chat.setBanned(params);
  }

  /**
   * 取消踢出
   * /v3/interacts/chat-user/set-kicked
   * */
  toggleKickedStatus(params = {}) {
    return iMRequest.chat.setKicked(params);
  }
}

export default function useChatAuthServer() {
  return new ChatAuthServer();
}