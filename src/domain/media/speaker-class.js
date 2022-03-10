
import useRoomBaseServer from '../room/roombase.server';
import useGroupServer from '../group/StandardGroupServer';
export default class Speaker {
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
