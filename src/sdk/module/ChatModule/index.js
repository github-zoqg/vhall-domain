import BaseModule from '../Base'
import { merge, isPc } from '@/utils/index.js'
import store from '../../store/index.js'

export default class ChatModule extends BaseModule {
  constructor() {
    super()
  }

  /**
   * 初始化聊天 SDK
   * @param {Object} customOptions 用户自定义参数
   */
  init(customOptions = {}) {
    const defaultOptions = this.initDefaultOptions()

    const options = merge.recursive({}, defaultOptions, customOptions)

    options.context = JSON.stringify(options.context)

    return new Promise((resolve, reject) => {
      VhallChat.createInstance(options, (event) => {
        this.instance = event.message
        this.listenEvents();
        resolve(event)
      }, reject)
    })
  }

  /**
   * 销毁聊天实例
   */
  destroy() {
    this.instance.destroy()
    this.instance = null
  }

  /**
   * 获取实例化聊天的默认参数
   * @returns {Object} defaultOptions 默认参数
   */
  initDefaultOptions() {
    const isPcClient = isPc()

    const { paasInfo, userInfo } = store.get('roomInitData')

    const defaultContext = {
      nick_name: userInfo.nickname,
      avatar: userInfo.avatar,
      role_name: userInfo.role_name,
      device_type: isPcClient ? '2' : '1', // 设备类型 1手机端 2PC 0未检测
      device_status: '0', // 设备状态  0未检测 1可以上麦 2不可以上麦
      is_banned: userInfo.is_gag, // 是否禁言 1是 0否
      watch_type: isPcClient ? '1' : '2', // 1 pc  2 h5  3 app  4 是客户端
      is_kick: userInfo.is_kick
    }

    const defaultOptions = {
      context: defaultContext,
      appId: paasInfo.paas_app_id,
      accountId: userInfo.third_party_user_id,
      channelId: paasInfo.channel_id,
      token: paasInfo.paas_access_token,
      hide: false, // 是否隐身
    }

    return defaultOptions
  }

  /**
   * 注册聊天事件
   */
  listenEvents() {
    this.instance.onRoomMsg((msg) => { // 房间消息（不对外）
      this.$emit('ROOM_MSG', msg)
    })
    this.instance.on((msg) => { // 聊天消息
      this.$emit('CHAT', msg)
    });
    this.instance.onCustomMsg((msg) => { // 自定义消息
      this.$emit('CUSTOM_MSG', msg)
    });
    this.instance.onOffLine(() => { // 连接断开
      this.$emit('OFFLINE')
    });
    this.instance.onOnLine(() => { // 连接连接上了
      this.$emit('ONLINE')
    });
    this.instance.onDocMsg((msg) => { // 文档消息（不对外）
      this.$emit('DOC_MSG')
    });
    this.instance.join((msg) => { // 用户加入
      this.$emit('JOIN', msg)
    });
    this.instance.leave((msg) => { // 用户离开
      this.$emit('LEFT', msg)
    });
  }

  /**
   * 发送聊天消息
   * @param {String} data 消息体
   * @param {String} context 上线文
   * @returns {Promise}
   */
  emitTextChat(data, context) {
    return this.instance.emit(data, context);
  }

  /**
   * 发送自定义消息
   * @param {String} data 消息体
   * @returns {Promise}
   */
  emitCustomChat(data) {
    return this.instance.emitCustomMsg(data)
  }

  /**
   * 发送文档消息（不对外）
   * @param {Object} data 消息体
   * @returns {Promise}
   */
  emitDocMsg(data) {
    return this.instance.emitDocMsg(data)
  }

  /**
   * 发送房间消息（不对外）
   * @param {Object} data 消息体
   * @returns {Promise}
   */
  emitRoomMsg(data) {
    const retData = JSON.stringify(data)
    return this.instance.emitRoomMsg(retData)
  }

  /**
   * 获取用户列表信息
   * @param {Object} params 分页参数
   * @returns {Promise}
   */
  getUserListInfo(params) {

    const defaultParams = {
      currPage: 1,
      pageSize: 10
    }

    const retParams = merge.recursive({}, defaultParams, params)

    return new Promise((resolve, reject) => {
      this.instance.getUserListInfo(retParams, resolve, reject)
    })
  }

  /**
   * 禁言某个用户
   * @param {Object} accountId 用户 id 
   * @returns {Promise}
   */
  setUserDisable(accountId) {
    return new Promise((resolve, reject) => {
      let param = {
        type: VhallChat.TYPE_DISABLE,
        targetId: accountId
      }
      chat.setDisable(param, resolve, reject);
    })
  }

  /**
   * 取消禁言某个用户
   * @param {Object} accountId 用户 id 
   * @returns {Promise}
   */
  setUserPermit(accountId) {
    return new Promise((resolve, reject) => {
      let param = {
        type: VhallChat.TYPE_PERMIT,
        targetId: accountId
      }
      chat.setDisable(param, resolve, reject);
    })
  }

  /**
   * 禁言频道
   * @returns {Promise}
   */
  setChannelDisable() {
    return new Promise((resolve, reject) => {
      let param = {
        type: VhallChat.TYPE_DISABLE_ALL
      }
      chat.setDisable(param, resolve, reject);
    })
  }

  /**
   * 取消禁言频道
   * @returns {Promise}
   */
  setChannelPermit() {
    return new Promise((resolve, reject) => {
      let param = {
        type: VhallChat.TYPE_PERMIT_ALL
      }
      chat.setDisable(param, resolve, reject);
    })
  }

  /**
   * 获取历史聊天消息
   * @returns {Promise}
   */
  getHistoryList(params) {
    const defaultParams = {
      currPage: 1,
      pageSize: 200
    }

    const retParams = merge.recursive({}, defaultParams, params)
    return new Promise((resolve, reject) => {
      this.instance.getHistoryList(retParams, resolve, reject)
    })
  }

  /**
   * 获取房间在线信息
   * @param {Object} params 分页参数
   * @returns {Promise}
   */
  getOnlineInfo(params) {

    const defaultParams = {
      currPage: 1,
      pageSize: 200
    }

    const retParams = merge.recursive({}, defaultParams, params)

    return new Promise((resolve, reject) => {
      this.instance.getOnlineInfo(retParams, resolve, reject)
    })
  }
}