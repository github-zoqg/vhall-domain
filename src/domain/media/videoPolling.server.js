import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useInteractiveServer from './interactive.server';
import useMsgServer from '../common/msg.server';
import userMemberServer from '../member/member.server';
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
      isAutoPolling: false, //是否是自动轮巡
      downTime: 600,
      currentVideoPollingInfo: {
        accountId: '', //开启视频轮询者的账户 ID
        roleName: 1 //开启视频轮询者的角色, 1 主持人， 3 助理； 未开启时为空
      },
      isPolling: false, // 当前观众是否在轮巡列表中
      localPollinger: {} // 当前轮训人的流信息
    };
    VideoPollingServer.instance = this;

    return this;
  }

  // 初始化视频轮询互动实例
  async init(options = {}) {
    console.log('options.isWatch', options.isWatch)
    if (options.isWatch) {
      await this.getVideoRoundUsers()
    } else {
      await this.getVideoRoundUsers()
      await this.initInteractiveInstance()
      this._addListeners()
    }
  }

  // 初始化互动实例
  initInteractiveInstance(customOptions) {
    const interactiveServer = useInteractiveServer()
    const { watchInitData } = useRoomBaseServer().state

    const defaultOptions = {
      appId: watchInitData.interact.paas_app_id, // 互动应用ID，必填
      inavId: watchInitData.interact.inav_id, // 互动房间ID，必填
      roomId: watchInitData.interact.room_id, // 如需开启旁路，必填。
      accountId: watchInitData.join_info.third_party_user_id + '_video_polling', // 第三方用户ID，必填
      token: watchInitData.interact.paas_access_token, // access_token，必填
      mode:
        watchInitData.webinar.no_delay_webinar == 1
          ? VhallRTC.MODE_LIVE
          : VhallRTC.MODE_RTC, //应用场景模式，选填，可选值参考下文【应用场景类型】。支持版本：2.3.1及以上。
      role: VhallRTC.ROLE_AUDIENCE, //用户角色，选填，可选值参考下文【互动参会角色】。当mode为rtc模式时，不需要配置role。支持版本：2.3.1及以上。
      attributes: '', // String 类型
      autoStartBroadcast: false, // 是否开启自动旁路 Boolean 类型   主持人默认开启true v2.3.5版本以上可用
      otherOption: watchInitData.report_data
    };
    const options = merge.recursive({}, defaultOptions, customOptions);

    console.log('%cVHALL-DOMAIN-互动初始化参数', 'color:blue', options);

    return new Promise((resolve, reject) => {
      interactiveServer.createInteractiveInstance(
        options,
        event => {
          this.updateVideoPollingStreams(event.currentStreams)
          resolve(event);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  // 设置当前轮训人的流信息
  setlocalPollingInfo(data) {
    this.state.localPollinger = data
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

    // 开启视频轮巡
    msgServer.$onMsg('ROOM_MSG', msg => {
      if (msg.data.type === 'video_round_start') {
        this.$emit('VIDEO_POLLING_START', msg);
      }
      // 直播结束，视频轮巡墙关闭
      if (msg.data.type === 'live_over') {
        this.$emit('VIDEO_POLLING_OVER', msg);
      }
      if (msg.data.type === 'video_round_users') {
        const { join_info } = useRoomBaseServer().state.watchInitData;
        if (msg.data?.uids.includes(join_info.third_party_user_id)) {
          this.state.isPolling = true
        } else {
          this.state.isPolling = false
        }
        this.$emit('VIDEO_POLLING_UPDATE', msg); // 更新轮训用户列表
      }
      if (msg.data.type === 'video_round_end') {
        this.state.isPolling = false
        this.$emit('VIDEO_POLLING_END', msg) // 轮训结束
      }
    });
  }

  // 获取流列表更新轮巡列表
  getStreamsAndUpdatePollingList() {
    const streamList = useInteractiveServer().getRoomStreams()
    this.updateVideoPollingStreams(streamList)
  }

  // 获取视频轮询流列表
  updateVideoPollingStreams(streamList) {
    let streams = streamList.filter(stream => {
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
  getVideoRoundUsers(params = {}) {
    const { watchInitData } = useRoomBaseServer().state
    // 默认查询当前房间当前组的列表
    const resultParams = {
      room_id: params.room_id || watchInitData.interact.room_id,
      is_next: params.is_next || 0
    }
    return videoRound.getRoundUsers(resultParams).then(res => {
      if (res.code === 200 && res.data.list) {
        this.state.pollingList = res.data.list.map(item => new PollingUser(item))

        this.state.isAutoPolling = Boolean(res.data.is_auto);
        this.state.downTime = res.data.interval;
        this.state.isPolling = res.data.list.some(el => { return el.account_id == watchInitData?.join_info?.third_party_user_id })
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

  // 根据轮询列表更新在线列表的状态
  updateOnlineUsers() {
    const memberServer = userMemberServer()
    let onlineUsers = memberServer.state.onlineUsers
    const memberPolling = []

    if (onlineUsers && onlineUsers.length) {
      onlineUsers = onlineUsers.map(item => {
        item = {
          ...item,
          isPolling: 0
        }
        this.state.pollingList.some(elem => {
          if (elem.accountId == item.account_id) {
            memberPolling.push(elem.accountId)
            item = {
              ...item,
              isPolling: 1
            }
          }
        })
        return item
      })
      this.state.pollingList?.forEach((elem) => {
        if (!memberPolling.includes(elem.accountId)) {
          elem = {
            ...elem,
            account_id: elem.accountId,
            isPolling: 1,
          }
          onlineUsers.push(elem)
        }
      })
    }
    memberServer.state.onlineUsers = memberServer._sortUsers(onlineUsers)

  }


}
export default function useVideoPollingServer() {
  return new VideoPollingServer();
}
