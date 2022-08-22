
export class Speaker {
  // audio video   数字1 代表fasle 不禁止
  constructor({ account_id: accountId,
    audio: audioMuted,
    video: videoMuted,
    role_name: roleName, nick_name: nickname,
    streamId = '' }) {
    this.accountId = accountId
    this.audioMuted = !audioMuted
    this.videoMuted = !videoMuted
    this.roleName = roleName
    this.nickname = nickname
    this.streamId = streamId
    this.attributes = {}
  }
}

export class PollingUser {
  constructor(options = {}) {
    this.accountId = options.account_id
    this.roleName = options.role_name
    this.role_name = options.role_name
    this.nickname = options.nick_name || options.nickname
    this.streamId = options.streamId
    this.attributes = {}
  }
}
