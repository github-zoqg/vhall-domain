import { merge } from '../../utils/index';
import { im } from '../../request';
import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import userMemberServer from '../member/member.server';
import useGroupServer from '../group/StandardGroupServer';
import useInsertFileServer from '../media/insertFile.server';
import { Speaker } from './class'
import useInteractiveServer from './interactive.server';
import useMediaCheckServer from './mediaCheck.server';
import useDocServer from '../doc/doc.server';
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
    const { interactToolStatus } = useRoomBaseServer().state;
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
        // return Object.assign(speaker, new Speaker(sourceSpeaker))
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

    console.log('[mic server] updateSpeakerByAccountId', accountId)
    this.state.speakerList = this.state.speakerList.map(speaker => {
      if (speaker.accountId == accountId) {
        console.log('[mic server] speaker', speaker)
        return Object.assign(speaker, params)
      } else {
        return speaker
      }
    })

    // 派发上麦流列表更新事件
    this.$emit('INTERACTIVE_REMOTE_STREAMS_UPDATE', this.state.speakerList)
    return this.state.speakerList
  }

  // 通过streamId来更新speaker
  updateSpeakerByStreamId(streamId, params) {
    // let index = this.state.speakerList.findIndex(speaker => speaker.streamId == streamId)
    // if (index < 0) {
    //   console.error('上麦用户不存在streamId')
    //   return
    // }
    console.log('[mic server] updateSpeakerByStreamId', streamId)

    this.state.speakerList = this.state.speakerList.map(speaker => {
      if (speaker.streamId == streamId) {
        console.log('[mic server] speaker', speaker)
        return Object.assign(speaker, params)
      } else {
        return speaker
      }
    })

    // 派发上麦流列表更新事件
    this.$emit('INTERACTIVE_REMOTE_STREAMS_UPDATE', this.state.speakerList)
  }

  getSpeakerByAccountId(accountId) {
    return this.state.speakerList.find(speaker => speaker.accountId == accountId)
  }

  removeAllApeakerStreamId() {
    this.state.speakerList.forEach(item => {
      item.streamId = ''
    })
  }

  //   开始讨论时
  // 1、msgServer groupChat初始化之前，可能会有 组员上麦消息遗漏
  // 2、组内成员互动重新初始化之前，可能会有流加入订阅时没有互动实例而报错
  updateSpeakerListByStreams() {
    if (useInteractiveServer().interactiveInstance) {
      const streams = useInteractiveServer().getRoomStreams()
      this.state.speakerList.forEach(speaker => {
        const stream = streams.find(item => item.accountId == speaker.accountId)
        if (stream) {
          speaker.streamId = stream.streamId
        }
      })

    }
  }


  _initEventListeners() {
    const msgServer = useMsgServer();
    msgServer.$onMsg('ROOM_MSG', async msg => {
      const { watchInitData: { join_info, webinar }, interactToolStatus } = useRoomBaseServer().state;
      const isVideoPolling = useRoomBaseServer().state.configList['video_polling'] == 1;
      switch (msg.data.type) {
        // 开启允许举手
        case 'live_over':
          this.$emit('live_over', msg);
          break;
        // 开启允许举手
        case 'vrtc_connect_open':
          useRoomBaseServer().setInavToolStatus('is_handsup', 1);
          this.$emit('vrtc_connect_open', msg);
          break;
        // 关闭允许举手
        case 'vrtc_connect_close':
          useRoomBaseServer().setInavToolStatus('is_handsup', 0);
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
          }
          // 如果是主持人或者组长派发事件，更新成员列表
          if (join_info.third_party_user_id == msg.data.room_join_id || join_info.role_name == 1 || useGroupServer().state.groupInitData.isInGroup && useGroupServer().state.groupInitData.join_role == 20) {
            // 若上麦成功后发现设备不允许上麦，则进行下麦操作
            let device_status = useMediaCheckServer().state.deviceInfo.device_status;
            if (device_status == 2) {
              this.speakOff();
              return;
            } else if (device_status == 0 && [2, 4].includes(join_info.role_name)) {
              // 观众 嘉宾
              let _flag = await useMediaCheckServer().getMediaInputPermission({
                isNeedBroadcast: msgServer.isMobileDevice() ? false : isVideoPolling && webinar.mode != 6
              });
              if (!_flag) {
                this.speakOff();
                this.$emit('vrtc_exception_msg', { type: 1039 }) // 设备检测未通过抛出异常提示
                return;
              }
            }
            if (!msgServer.isMobileDevice()) {
              // 上麦成功后，如果开启文档可见，把主画面置为小屏
              if (useDocServer().state.switchStatus) {
                // 正在插播中，设置文档为小屏，否则为主画面音视频流
                if (useInsertFileServer().state.isInsertFilePushing) {
                  useRoomBaseServer().setChangeElement('doc');
                } else {
                  useRoomBaseServer().setChangeElement('stream-list');
                }
              }
            }
            window.vhallReportForProduct?.toResultsReporting(170032, { event_type: 'message', res: msg });
            this.$emit('vrtc_connect_success', msg);
          }
          break;
        // 用户成功下麦
        case 'vrtc_disconnect_success':
          this.state.speakerList = this.state.speakerList.filter(speaker => speaker.accountId != msg.data.target_id)
          if (join_info.third_party_user_id == msg.data.target_id) {
            this.state.isSpeakOn = false;
            if (!msg.data.vrtc_reason) { // vrtc_reason 为空时，表示自己或者其他用户通过接口下麦
              this.setSpeakOffToInit(true)
            }
            window.vhallReportForProduct?.toResultsReporting(170033, { event_type: 'message', res: msg });
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
          interactToolStatus.main_screen = msg.data.room_join_id;
          this.$emit('vrtc_big_screen_set', msg);
          break;
        // 设置主讲人 补充增加
        case 'vrtc_speaker_switch':
          this.$emit('vrtc_speaker_switch', msg)
          break;
      }
    });
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
    return im.signaling[methodName](retParams)
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
