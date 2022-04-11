import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useInteractiveServer from './interactive.server';
import videoRound from '../../request/interacts/video-round';
import { PollingUser } from './class'

class VideoPollingServer extends BaseServer {
  constructor() {
    super();
    if (typeof VideoPollingServer.instance === 'object') {
      return VideoPollingServer.instance;
    }
    this.state = {
      pollingList: [] // 轮询列表
    };
    VideoPollingServer.instance = this;

    return this;
  }

  // 初始化视频轮询互动实例
  async init() {
    await this.getVideoRoundUsers()
    await this.initInteractiveInstance()
  }

  // 初始化互动实例
  initInteractiveInstance() {
    const interactiveServer = useInteractiveServer()
    const { join_info } = useRoomBaseServer().state.watchInitData

    return interactiveServer.init({
      accountId: join_info.third_party_user_id + '_video_polling'
    }).then(event => {
      this.updateVideoPollingStreams(event)
      return event
    })
  }

  /**
   * 注册事件监听
   */
  _addListeners() {
    const interactiveServer = useInteractiveServer()
    // 流加入
    interactiveServer.$on('EVENT_REMOTESTREAM_ADD', e => {
      if (e.data.streamType === 5) {
        let params = {
          streamId: e.data.streamId,
          attributes: e.data.attributes
        }

        this.updatePollingItemByAccountId(e.data.accountId, params)
        this.$emit('EVENT_VIDEO_POLLING_STREAM_ADD', e);
      }
    })
    // 流删除
    interactiveServer.$on('EVENT_REMOTESTREAM_REMOVED', e => {
      if (e.data.streamType === 5) {
        let params = {
          streamId: '',
        }

        this.updatePollingItemByAccountId(e.data.accountId, params)
        this.$emit('EVENT_VIDEO_POLLING_STREAM_REMOVED', e);
      }
    })
  }

  // 获取视频轮询流列表
  updateVideoPollingStreams(event) {
    let streams = event.currentStreams.filter(stream => {
      try {
        if (stream.attributes && typeof stream.attributes == 'string') {
          stream.attributes = JSON.parse(stream.attributes);
        }
      } catch (error) {
      }
      // 过滤出 streamType 为 5 的 stream
      if (stream?.streamType == 5) {
        return stream;
      }
    });

    streams.forEach(stream => {
      this.updatePollingItemByAccountId(stream.accountId, stream)
    })

  }

  /**
   * 通过更新轮询人信息
   * @param {String} accountId 更新用户的 accountId
   * @param {Object} params 更新用户对应的信息
   * @returns undefined
   */
  updatePollingItemByAccountId(accountId, params) {
    // 如果列表为空直接 return
    if (!this.state.pollingList || !this.state.pollingList.length) return
    // 更新轮询列表中对应人的信息
    this.state.pollingList = this.state.pollingList.map(speaker => {
      if (speaker.accountId == accountId) {
        return Object.assign(speaker, params)
      } else {
        return speaker
      }
    })
  }

  // 获取当前轮询人列表
  getVideoRoundUsers(params) {
    const { watchInitData } = useRoomBaseServer().state
    // 默认查询当前房间当前组的列表
    const defaultParams = params || {
      room_id: watchInitData.interact.room_id,
      is_next: 0
    }
    return videoRound.getRoundUsers(defaultParams).then(res => {
      this.pollingList = res.data.list.map(item => new PollingUser(item))
    })
  }
}
export default function useVideoPollingServer() {
  return new VideoPollingServer();
}
