import {im as iMRequest, qa as qARequest} from '@/request/index.js';
import BaseServer from '@/domain/common/base.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import {Domain} from '@/domain';
import VhallPaasSDK from '@/sdk/index.js';
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
      //未审核的消息
      auditList: [],
      //已通过的消息
      passedList: [],
      //禁言列表
      mutedList: [],
      //已踢出列表
      kickedList: [],
      //未审核的数量
      auditNum: 0,
      //已通过总数
      passedNum: 0,
      //已禁言总数
      mutedNum: 0,
      //已踢出的总数
      kickedNum: 0,
      //是否开启聊天审核
      enableChatAuth: 1,
      //是否开启自动审核
      enableAutoHandle: '1'
    };
    // 聊天sdk实例
    this.chatInstance = null;
    //接收自定义消息的sdk实例
    this.customChatInstance = null;
    ChatAuthServer.instance = this;
    return this;
  }

  /**
   * 初始化方法
   * */
  init() {

  }

  /**
   * 设置state中的值
   * */
  setState(key, value) {
    !['', null, void (0)].includes(key) && (this.state[key] = value);
  }

  /**
   * 初始化监听事件
   * */
  listenEvents() {
    this.chatInstance.on(msg => {
      console.log(msg, 'chat的msg');
      let temp = Object.assign({}, msg);
      if (typeof temp.data !== 'object') {
        temp.data = ![null, void (0), ''].includes(temp.context) ? JSON.parse(temp.data) : '';
        temp.context = ![null, void (0), ''].includes(temp.context) ? JSON.parse(temp.context) : '';
      }
      const type = temp.data.type;
      switch (type) {
        case 'disable': // 禁言
        case 'room_kickout': // 踢出
          this.operateUser(temp.data.target_id, type);
          break;
        case 'permit': // 取消禁言
        case 'room_kickout_cancel':

          if (type === 'room_kickout_cancel') {
            this.state.kickedList = this.state.kickedList.filter(item => {
              return item.account_id !== temp.data.target_id;
            });
            this.state.kickedNum--;
            return;
          }

          if (type === 'permit') {
            this.state.mutedList = this.state.mutedList.filter(item => {
              return item.account_id !== temp.data.target_id;
            });
            this.state.mutedNum--;
          }
          break;
        default:
          break;
      }
    });
  }

  /**
   * 注册监听自定义消息的回调
   * */
  listenCustomMsg() {
    this.customChatInstance.onCustomMsg(msg => {
      let temp = Object.assign({}, msg);
      if (typeof temp.data !== 'object') {
        temp.data = ![null, void (0), ''].includes(temp.context) ? JSON.parse(temp.data) : '';
        temp.context = ![null, void (0), ''].includes(temp.context) ? JSON.parse(temp.context) : '';
      }
      const operate = temp.data.operation_status;
      console.log(temp.data, '收到自定义消息');
      switch (operate) {
        case 1:
          Object.assign(temp.data, {
            isOperate: 0,
            join_id: temp.sender_id,
            nick_name: temp.context.nick_name || temp.context.nickname
          });
          this.state.auditList.push(temp.data);
          break;
        case 2:
          // 开启留言审核、自动阻止、自动发送
          if (temp.data.third_party_user_id === this.state.operatorId) {
            return;
          }
          this.state.enableChatAuth = parseInt(temp.data.switch);
          if (Object.prototype.hasOwnProperty.call(temp.data, 'switch_options')) {
            this.state.enableAutoHandle = temp.data.switch_options + '';
          }
          break;
        case 5:
          // 通过、全部通过、阻止、全部阻止
          if (!Object.prototype.hasOwnProperty.call(temp.data, 'msg_id')) {
            return;
          }
          //更新数据操作状态
          this.state.auditList.forEach(item => {
            (temp.data.msg_id || '').split(',').forEach(it => {
              if (item.msg_id === it) {
                item.isOperate = parseInt(temp.data.status);
                if (item.isOperate === 1) {
                  this.state.passedNum++;
                }
              }
            });
          });
          break;
        default:
          break;
      }
    });
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

        return res;
      });
  }

  // 初始化聊天实例
  async initChatInstance(params = {}) {
    //todo 询问一下为啥频道id一个是ck+频道id ,一个就是单纯的频道id
    const options = {
      appId: this.state.baseChanelInfo.app_id, // appId 必须
      accountId: this.state.baseChanelInfo.third_party_user_id, // 第三方用户ID
      channelId: this.state.baseChanelInfo.channel_id, // 频道id 必须
      token: this.state.baseChanelInfo.access_token, // 必须， token，初始化接口获取
      hide: true
    };

    // 创建domain实例
    await new Domain({
      plugins: ['chat'],
      isNotInitRoom: true
    });

    const customChatInstance = new Promise((resolve, reject) => {
      VhallPaasSDK.modules.VhallChat.createInstance(
        Object.assign({}, options, {channelId: ['ck_', options.channelId].join('')}),
        event => {
          // 互动实例
          this.customChatInstance = event.message;
          this.listenCustomMsg();
          resolve(event);
        },
        error => {
          reject(error);
        }
      );
    });
    await customChatInstance;

    return new Promise((resolve, reject) => {
      VhallPaasSDK.modules.VhallChat.createInstance(
        options,
        event => {
          // 互动实例
          this.chatInstance = event.message;
          this.listenEvents();
          resolve(event);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * 获取房间信息
   * */
  getRoomInfo(params = {}) {
    return qARequest.list.initChatMess(params);
  }

  /**
   * 获取未审核的列表
   * */
  fetchChatMessageList() {
    const {baseChanelInfo = {}} = this.state || {};
    const params = Object.assign({}, baseChanelInfo);
    this.state.auditList = [];
    let tempItem = {};
    let object = {};
    let context, data;
    return this.getAuditMessageList(params).then(res => {
      for (let i in (res.data || {})) {
        object = JSON.parse(res.data[i]);
        context =
          typeof JSON.parse(object.context) === 'object'
            ? JSON.parse(object.context)
            : JSON.parse(JSON.parse(object.context));
        tempItem.nick_name = context.nickname || context.nick_name;
        tempItem.time = object.time;
        tempItem.type = object.type;
        tempItem.msg_id = i;
        tempItem.third_party_user_id = object.sender_id; // 发送消息的人第三方id
        tempItem.channel = object.channel;
        tempItem.room_id = object.room_id;
        data = JSON.parse(object.data);
        if (tempItem.type === 'text') {
          tempItem.text_content = data.barrageTxt || data.text_content;
        } else if (tempItem.type === 'video') {
          tempItem.video_url = data.video_url;
        } else if (tempItem.type === 'voice') {
          tempItem.voice_url = data.voice_url;
        } else if (tempItem.type === 'image') {
          tempItem.image_urls = data.image_urls;
          if (Object.prototype.hasOwnProperty.call(data, 'text_content')) {
            tempItem.text_content = data.barrageTxt || data.text_content;
          }
        } else if (tempItem.type === 'link') {
          tempItem.link_url = data.link_url;
        }
        tempItem.isOperate = 0; // 0 未对数据操作， 1审核通过，2拒绝
        this.state.auditList.push(tempItem);
        tempItem = {};
        object = {};
      }
    });
  }

  /**
   * 获取已通过审核的列表
   * */
  fetchPassedMessageList(params = {}) {
    const {baseChanelInfo = {}, createTime = ''} = this.state;
    const defaultParams = {
      ...baseChanelInfo,
      msg_type: 'image,text,link,video,voice',
      start_time: createTime
    };
    Object.assign(defaultParams, params);
    return this.getPassedMessageList(defaultParams).then(res => {
      this.state.passedList = res.data.list || [];
      this.state.passedNum = res.data.total || 0;
    });
  }

  /**
   * 获取已禁言的用户列表
   * */
  fetchMutedUserList(params = {}) {
    const {roomInfo = {}} = this.state;
    const requestParams = Object.assign({}, {...roomInfo}, params);
    return this.getBannedList(requestParams).then(res => {
      this.state.mutedList = res.data.list || [];
      this.state.mutedNum = res.data.total || 0;
    });
  }

  /**
   * 获取已踢出的用户列表
   * */
  fetchKickedUserList(params = {}) {
    const {roomInfo = {}} = this.state;
    const requestParams = Object.assign({}, {...roomInfo}, params);
    return this.getKickedList(requestParams).then(res => {
      this.state.kickedList = res.data.list || [];
      this.state.kickedNum = res.data.total || 0;
    });
  }

  /**
   * 操作用户
   * */
  operateUser(id, type) {
    //更新tab栏上的未读数
    if (type === 'room_kickout') {
      this.state.kickedNum++;
    } else if (type === 'disable') {
      this.state.mutedNum++;
    }
    const params = {
      ...this.state.baseChanelInfo,
      msg_id: '',
      status: 2
    };
    this.state.auditList.forEach(item => {
      if (item.third_party_user_id === id) {
        params.msg_id += item.msg_id + ',';
      }
    });
    this.fetchOperate(params);
  }

  //操作消息
  fetchOperate(params, cb) {
    if (!params.msg_id) return;
    this.operateMessage(params)
      .finally(() => {
        this.getAuditMessageList();
      });
  }

  /**
   * 通过、全部通过、阻止、全部阻止的时候更新对应数据状态
   * */

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
  setMessageFilterOptions(params = {}) {
    return iMRequest.chatAuth.setMessageFilterOptions(params);
  }

  /**
   * 获取聊天设置开关状态
   * */
  getChatAuthEnableStatus(params = {}) {
    return iMRequest.chatAuth.getChatAuthStatus(params);
  }

  /**
   * 取消禁言/禁言
   * /v3/interacts/chat-user/set-banned
   * */
  toggleBannedStatus(params = {}) {
    return iMRequest.chat.setBanned(params);
  }

  /**
   * 取消踢出/踢出
   * /v3/interacts/chat-user/set-kicked
   * */
  toggleKickedStatus(params = {}) {
    return iMRequest.chat.setKicked(params);
  }
}

export default function useChatAuthServer() {
  return new ChatAuthServer();
}