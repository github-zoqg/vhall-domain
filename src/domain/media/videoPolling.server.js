import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useInteractiveServer from './interactive.server';
import useMsgServer from '../common/msg.server';
import videoRound from '../../request/interacts/video-round';
import { PollingUser } from './class'
import { merge } from '../../utils';

class VideoPollingServer extends BaseServer {
  constructor() {
    super();
    if (typeof VideoPollingServer.instance === 'object') {
      return VideoPollingServer.instance;
    }
    this.state = {
      pollingList: [], // 轮询列表
      surplusSpeakCount: 0, // 当前房间剩余麦位
      maxSpeakCount: 0, //最大房间麦位
      currentVideoPollingInfo: {
        accountId: '', //开启视频轮询者的账户 ID
        roleName: 1 //开启视频轮询者的角色, 1 主持人， 3 助理； 未开启时为空
      }
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
    const interactiveServer = useInteractiveServer();
    const msgServer = useMsgServer();
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

    // 开启视频轮询
    msgServer.$onMsg('ROOM_MSG', msg => {
      if (msg.data.type === 'video_round_start') {
        this.$emit('VIDEO_POLLING_START', msg);
      }
    });
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
      if (res.code === 200 && res.data) {
        this.pollingList = res.data.list.map(item => new PollingUser(item))
      }
      return res
    })
  }

  // 获取视频轮训信息
  getVideoRoundInfo() {
    const { watchInitData } = useRoomBaseServer().state
    let params = {
      room_id: watchInitData.interact.room_id
    }
    return videoRound.getVideoRoundInfo(params).then(res => {
      if (res.code === 200 && res.data) {
        this.state.surplusSpeakCount = res.data.surplus_speak_count;
        this.state.maxSpeakCount = res.data.max_speak_count;
        this.state.currentVideoPollingInfo.accountId = res.data.account_id;
        this.state.currentVideoPollingInfo.roleName = res.data.role_name;
      }
      return res;
    })
  }

  // 开始视频轮训
  videoRoundStart(options) {
    const { watchInitData } = useRoomBaseServer().state
    // 默认参数
    const defaultParams = {
      room_id: watchInitData.interact.room_id
    }
    const params = merge.recursive(defaultParams, options);
    return videoRound.videoRoundStart(params).then(res => {
      if (res.code === 200 && res.data) {
        this.state.currentVideoPollingInfo.roleName = res.data.role_name;
      }
      return res;
    })
  }

  // 结束视频轮巡videoRoundEnd
  videoRoundEnd() {
    const { watchInitData } = useRoomBaseServer().state
    let params = {
      room_id: watchInitData.interact.room_id
    }
    return videoRound.videoRoundEnd(params).then(res => {
      // 重置
      if (res.code === 200 && res.data) {
        this.state.surplusSpeakCount = 0;
        this.state.maxSpeakCount = 0;
        this.state.currentVideoPollingInfo.accountId = '';
        this.state.currentVideoPollingInfo.roleName = '';
      }
      return res;
    })
  }


}
export default function useVideoPollingServer() {
  return new VideoPollingServer();
}
