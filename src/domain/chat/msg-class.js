let count = 0
export default class Msg {
  constructor({
    avatar = '',
    sendId = '',
    nickName = '',
    type = 'text',
    showTime = '',
    roleName = '',
    content = {},
    sendTime = '',
    client = '',
    self = false,
    replyMsg = {},
    atList = [],
    context = {}, // 回复或者@消息集合
    source = 'mobile' // 暂时没用到
  }) {
    // 用户id
    this.type = type
    this.avatar = avatar
    this.sendId = sendId
    this.nickName = nickName
    this.roleName = roleName
    this.content = content
    this.showTime = showTime
    this.sendTime = sendTime
    this.client = client
    this.count = count++
    this.self = self
    this.replyMsg = replyMsg
    this.atList = atList
    this.context = context
    this.source = source
  }
}
