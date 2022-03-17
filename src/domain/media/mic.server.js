import { merge } from '../../utils/index';
import { im } from '../../request';
import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import userMemberServer from '../member/member.server';
import useGroupServer from '../group/StandardGroupServer';
import Speaker from './speaker-class';
import useInteractiveServer from './interactive.server';
class MicServer extends BaseServer {
  constructor() {
    super();
    if (typeof MicServer.instance === 'object') {
      return MicServer.instance;
    }
    this.state = {
      // isAllowhandup: false, // 是否开始允许举手
      isSpeakOn: false, // 是否在麦上
      isSpeakOffToInit: false, // 是否下麦后去初始化互动（自动上麦，下麦后，不走自动上麦）
      speakerList: [] // 上麦人员列表
    };
    MicServer.instance = this;
    window.micServer = this
    return this;
  }
  init() {
    this.updateSpeakerList()
    this.getSpeakerStatus();
    this._initEventListeners();
  }
  // 更新上麦列表,接口更新时调用
  updateSpeakerList() {
    const { watchInitData, interactToolStatus } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state

    let speakerList = interactToolStatus.speaker_list || []
    if (groupInitData.isInGroup) {
      speakerList = groupInitData.speaker_list || []
    }

    // 接口数据更新时，将接口返回的speakerList和本地比对，只保留接口返回的用户
    this.state.speakerList = speakerList.map(sourceSpeaker => {
      let speaker = this.state.speakerList.find(item => item.accountId == sourceSpeaker.account_id)
      if (speaker) {
        return speaker
      } else {
        return new Speaker(sourceSpeaker)
      }
    })
  }

  setSpeakerList(val) {
    this.state.speakerList = val
  }

  // 获取是否上麦状态
  getSpeakerStatus() {
    const { join_info } = useRoomBaseServer().state.watchInitData;
    this.state.isSpeakOn = this.state.speakerList.some(speaker => speaker.accountId == join_info.third_party_user_id)
    return this.state.isSpeakOn

  }

  // 通过accountId来更新speaker
  updateSpeakerByAccountId(accountId, params) {

    this.state.speakerList = this.state.speakerList.map(speaker => {
      if (speaker.accountId == accountId) {
        return Object.assign(speaker, params)
      } else {
        return speaker
      }
    })
  }

  // 通过streamId来更新speaker
  updateSpeakerByStreamId(streamId, params) {
    // let index = this.state.speakerList.findIndex(speaker => speaker.streamId == streamId)
    // if (index < 0) {
    //   console.error('上麦用户不存在streamId')
    //   return
    // }
    this.state.speakerList = this.state.speakerList.map(speaker => {
      if (speaker.streamId == streamId) {
        return Object.assign(speaker, params)
      } else {
        return speaker
      }
    })
  }

  getSpeakerByAccountId(accountId) {
    return this.state.speakerList.find(speaker => speaker.accountId == accountId)
  }

  removeAllApeakerStreamId() {
    this.state.speakerList.forEach(item => {
      item.streamId = ''
    })
  }


  _initEventListeners() {
    const msgServer = useMsgServer();
    msgServer.$onMsg('ROOM_MSG', msg => {
      const { join_info } = useRoomBaseServer().state.watchInitData;
      console.log(
        '----连麦服务----房间消息',
        this.state.isSpeakOn,
        msg.data.receive_account_id,
        join_info.third_party_user_id
      );
      switch (msg.data.type) {
        // 开启允许举手
        case 'live_over':
          this.$emit('live_over', msg);
          break;
        // 开启允许举手
        case 'vrtc_connect_open':
          useRoomBaseServer().setInavToolStatus('is_handsup', true);
          this.$emit('vrtc_connect_open', msg);
          break;
        // 关闭允许举手
        case 'vrtc_connect_close':
          useRoomBaseServer().setInavToolStatus('is_handsup', false);
          this.$emit('vrtc_connect_close', msg);
          break;
        // 用户申请上麦
        case 'vrtc_connect_apply':
          this.$emit('vrtc_connect_apply', msg);
          break;
        // 用户取消申请上麦
        case 'vrtc_connect_apply_cancel':
          this.$emit('vrtc_connect_apply_cancel', msg);
          break;
        // 主持人拒绝用户上麦申请
        // case 'user_apply_host_reject':
        //   if (
        //     (join_info.role_name == 1 && msg.sourceId != join_info.third_party_user_id) || // 当前用户是主持人并且消息不是自己发的
        //     (join_info.role_name == 3 && msg.sourceId != join_info.third_party_user_id) || // 当前用户是助理并且消息不是自己发的
        //     (join_info.role_name == 2 &&
        //       msg.data.receive_account_id == join_info.third_party_user_id) // 当前用户是观众
        //   ) {
        //     this.$emit('user_apply_host_reject', msg);
        //   }
        //   break;
        // 主持人同意用户上麦申请
        case 'vrtc_connect_agree':
          // 只有嘉宾和观众此条件为true,所以此处不加角色判断
          if (msg.data.room_join_id == join_info.third_party_user_id) {
            this.$emit('vrtc_connect_agree', msg);
          }
          break;
        // 用户成功上麦
        case 'vrtc_connect_success':
          let params = {
            account_id: msg.data.room_join_id,
            audio: msg.data.vrtc_audio_status == 'on' ? 1 : 0,
            nick_name: msg.data.nick_name,
            role_name: Number(msg.data.room_role),
            video: msg.data.vrtc_video_status == 'on' ? 1 : 0
          }

          // 主持人是先推流后收到上麦成功消息，此时接受到消息，需要把streamId合并
          if (useInteractiveServer().interactiveInstance) {
            const streams = useInteractiveServer().getRoomStreams()
            const stream = streams.find(item => item.accountId == msg.data.room_join_id)
            if (stream) {
              params.streamId = stream.streamId
            }
          }


          if (!this.state.speakerList.find(speaker => speaker.accountId === params.account_id)) {
            this.state.speakerList.push(new Speaker(params));
          }

          if (join_info.third_party_user_id == msg.data.room_join_id) {
            this.state.isSpeakOn = true;
            this.$emit('vrtc_connect_success', msg);
          } else if (join_info.role_name == 1 || useGroupServer().state.groupInitData.join_role == 20) {
            // 如果是主持人或者组长派发事件，更新成员列表
            this.$emit('vrtc_connect_success', msg);
          }
          break;
        // 用户成功下麦
        case 'vrtc_disconnect_success':
          this.state.speakerList = this.state.speakerList.filter(speaker => speaker.accountId != msg.data.target_id)
          if (join_info.third_party_user_id == msg.data.target_id) {
            this.state.isSpeakOffToInit = true
            this.state.isSpeakOn = false;
            this.$emit('vrtc_disconnect_success', msg);
          }
          break;
        // 主持人邀请观众上麦
        case 'vrtc_connect_invite':
          this.$emit('vrtc_connect_invite', msg);
          break;
        // 用户同意上麦
        case 'vrtc_connect_invite_agree':
          this.$emit('vrtc_connect_invite_agree', msg);
          break;
        // 用户拒绝上麦
        case 'vrtc_connect_invite_refused':
          this.$emit('vrtc_connect_invite_refused', msg);
          break;
        // 设置主画面
        case 'vrtc_big_screen_set':
          if (useGroupServer().state.groupInitData.isInGroup) return;
          const { interactToolStatus, watchInitData } = useRoomBaseServer().state;
          // if(useGroupServer().state.groupInitData.isInGroup)
          interactToolStatus.main_screen = msg.data.room_join_id;
          this.$emit('vrtc_big_screen_set', msg);
          // const str = watchInitData.webinar.mode == 6 ? '主画面' : '主讲人';
          break;
      }
    });
    const groupServer = useGroupServer()
    groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
      this.updateSpeakerList()
    })
  }

  setSpeakOffToInit(val) {
    this.state.isSpeakOffToInit = val
  }


  // 用户上麦
  userSpeakOn(data = {}) {
    const { watchInitData } = useRoomBaseServer().state;
    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return im.signaling.userSpeakOn(retParams);
  }
  // 用户下麦
  speakOff(data = {}) {
    // 停止推流 ——> 调下麦接口
    // const interactiveServer = useInteractiveServer();
    const { watchInitData } = useRoomBaseServer().state;
    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);

    const methodName = data.receive_account_id ? 'speakOffUser' : 'speakOffSelf';
    let res = im.signaling[methodName](retParams);
    return res
  }
  // 允许举手
  setHandsUp(data = {}) {
    const { watchInitData } = useRoomBaseServer().state;

    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);

    return im.signaling.setHandsUp(retParams);
  }
  // 用户举手申请上麦
  userApply(data = {}) {
    const { watchInitData } = useRoomBaseServer().state;

    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);

    return im.signaling.userApply(retParams);
  }
  // 同意用户的上麦申请
  hostAgreeApply(data = {}) {
    const { watchInitData } = useRoomBaseServer().state;

    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);

    return im.signaling.hostAgreeApply(retParams);
  }
  // 拒绝用户的上麦申请
  hostRejectApply(data = {}) {
    const { watchInitData } = useRoomBaseServer().state;

    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);

    return im.signaling.hostRejectApply(retParams);
  }
  // 主持人邀请上麦
  inviteMic(data = {}) {
    return userMemberServer().inviteUserToInteract(data);
  }
  // 取消申请
  userCancelApply(data = {}) {
    const { watchInitData } = useRoomBaseServer().state;
    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return im.signaling.userCancelApply(retParams);
  }
  // 观看端-用户同意邀请上麦
  userAgreeInvite(data = {}) {
    return im.signaling.userAgreeInvite(data);
  }
  // 观看端-用户拒绝邀请上麦
  userRejectInvite(data = {}) {
    return im.signaling.userRejectInvite(data);
  }
}

export default function useMicServer() {
  return new MicServer();
}
