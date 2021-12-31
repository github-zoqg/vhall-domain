import BaseModule from '../Base'

export default class ChatGroup extends BaseModule {
  constructor(chatInstance) {
    if (!chatInstance) {
      throw new Error('Expected a chatInstance option')
    }
    super()
    this.chatInstance = chatInstance
  }

  /**
   * 根据已有groupId，生成小组
   * @param {String} groupId 
   */
  groupBuild(groupId) {
    if (this.groupInstance) {
      throw new Error('GroupInstance cannot be created repeatedly')
    }
    this.groupInstance = this.chatInstance.groupBuild(groupId)
    this.listenEvents()
  }

  /**
   * 创建小组，自己必定会在小组内
   * @param {Array} accounts 小组成员列表（如不包含自己，则会自动加入），Array<string>
   * @param {*} context 小组的context信息，objetc
   * @returns {Promise}
   */
  groupCreate(accounts, context) {
    if (this.groupInstance) {
      throw new Error('GroupInstance cannot be created repeatedly')
    }
    return new Promise((resolve, reject) => {
      this.chatInstance.groupCreate(accounts, context).then(res => {
        this.groupInstance = res
        this.listenEvents()
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * 注册事件
   */
  listenEvents() {
    this.groupInstance.on(VhallChat.EVENTS.CHAT, (msg) => { // 聊天消息
      this.$emit('GROUP_CHAT', msg)
    });
    this.groupInstance.on(VhallChat.EVENTS.GROUP_MEMEBER_JOIN, function(ev) { // 小组加入新成员
      this.$emit('GROUP_MEMEBER_JOIN', ev)
    })
    this.groupInstance.on(VhallChat.EVENTS.GROUP_MEMEBER_LEFT, function(ev) { // 小组成员离开（掉线、离开）
      this.$emit('GROUP_MEMEBER_LEFT', ev)
    })
    this.groupInstance.on(VhallChat.EVENTS.GROUP_INFO_UPDATE, function(ev) { // 小组信息更新，context信息更新
      this.$emit('GROUP_INFO_UPDATE', ev)
    })
    this.groupInstance.on(VhallChat.EVENTS.GROUP_DISSOLVE, function(ev) { // 小组解散 (被从小组移除不会触发此事件)
      this.$emit('GROUP_DISSOLVE', ev)
    })
  }

  /**
   * 发送聊天消息
   * @param {String} text 消息内容
   * @param {Object} opt 消息选项
   * @returns {Promise}
   */
  emitTextChat(text, opt = {}) {
    return this.groupInstance.emitTextChat(text, opt)
  }

  /**
   * 获取最近的10条历史聊天消息
   * @returns {Promise}
   */
  getLatelyHistoryList() {
    return this.groupInstance.getLatelyHistoryList()
  }

  /**
   * 激活小组，之前的context不会保留
   * @param {Array} accounts 可选，小组成员列表，Array<string>
   * @param {Object} context 可选，小组的context信息 
   * @returns {Promise}
   */
  groupActivate(accounts, context) {
    return this.groupInstance.activate(accounts, context)
  }

  /**
   * 获取小组上下文信息
   * @returns {Object} 小组上下文对象 context
   */
  groupGetContext() {
    return this.groupInstance.getContext()
  }

  /**
   * 邀请成员加入（不需要确认）
   * @param {Array} accounts 小组成员列表，Array<string>
   * @returns {Promise}
   */
  groupInvite(accounts) {
    return this.groupInstance.inviter(accounts)
  }

  /**
   * 将成员移除
   * @param {Array} accounts 小组成员列表，Array<string>
   * @returns {Promise}
   */
  groupRemove(accounts) {
    return this.groupInstance.remove(accounts)
  }

  /**
   * 离开小组
   * @returns {Promise}
   */
  groupLeft() {
    return this.groupInstance.left()
  }

  /**
   * 解散小组（小组内所有成员会收到解散消息）
   * @returns {Promise}
   */
  groupDissolve() {
    return this.groupInstance.dissolve()
  }
}