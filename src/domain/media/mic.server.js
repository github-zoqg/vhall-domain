import { merge } from '../../utils/index';
import { im, room } from '../../request';
import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import useInteractiveServer from './interactive.server';
import userMemberServer from '../member/member.server';
import useGroupServer from '../group/StandardGroupServer';

class MicServer extends BaseServer {
  constructor() {
    super();
    if (typeof MicServer.instance === 'object') {
      return MicServer.instance;
    }
    this.state = {
      // isAllowhandup: false, // 是否开始允许举手
      isSpeakOn: false // 是否在麦上
    };
    MicServer.instance = this;
    return this;
  }
  init() {
    this.initMicState();
    this._initEventListeners();
  }
  _initEventListeners() {
    const msgServer = useMsgServer();
    msgServer.$onMsg('ROOM_MSG', msg => {
      const { join_info } = useRoomBaseServer().state.watchInitData;
      console.log(
        '----连麦服务----房间消息',
        msg,
        msg.data.receive_account_id,
        join_info.third_party_user_id
      );
      switch (msg.data.type) {
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
          if (join_info.third_party_user_id == msg.data.room_join_id) {
            this.state.isSpeakOn = true;
          }
          this.$emit('vrtc_connect_success', msg);
          break;
        // 用户成功下麦
        case 'vrtc_disconnect_success':
          if (join_info.third_party_user_id == msg.data.target_id) {
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
        // 主持人开启允许举手
        case 'vrtc_connect_open':
          useRoomBaseServer().setInavToolStatus('is_handsup', true);
          this.$emit('vrtc_connect_open', msg);
          break;
        // 设置主画面
        case 'vrtc_big_screen_set':
          const { interactToolStatus, watchInitData } = useRoomBaseServer().state;
          interactToolStatus.main_screen = msg.data.room_join_id;
          this.$emit('vrtc_big_screen_set', msg);
          // const str = watchInitData.webinar.mode == 6 ? '主画面' : '主讲人';
          // this.$message.warning(`${msg.nick_name}设成为${str}`);
          break;
      }
    });
  }

  // 初始化用户上麦状态
  async initMicState() {
    const roomBaseServer = useRoomBaseServer();
    const { speaker_list } = roomBaseServer.state.interactToolStatus;
    const { join_info } = roomBaseServer.state.watchInitData;
    // 分组直播speaker list
    await useGroupServer().init();
    const groupSpeakerList = useGroupServer().state.groupInitData?.speaker_list;
    if (groupSpeakerList && groupSpeakerList.length) {
      this.state.isSpeakOn = groupSpeakerList.some(
        item => item.account_id == join_info.third_party_user_id
      );
      return this.state.isSpeakOn;
    }
    if (!speaker_list) return;
    if (speaker_list && speaker_list.length) {
      this.state.isSpeakOn = speaker_list.some(
        item => item.account_id == join_info.third_party_user_id
      );
      return this.state.isSpeakOn;
    }
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
    return im.signaling[methodName](retParams);
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
    // const msgServer = useMsgServer();

    // TODO:后续发消息统一由接口发，现阶段前端自己发消息，联调用
    // msgServer.sendRoomMsg({
    //   type: 'user_apply',
    //   applyUserId: watchInitData.join_info.third_party_user_id,
    //   nickname: watchInitData.join_info.nickname
    // });

    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);

    return im.signaling.userApply(retParams);
  }
  // 同意用户的上麦申请
  hostAgreeApply(data = {}) {
    const { watchInitData } = useRoomBaseServer().state;
    // const msgServer = useMsgServer();

    // TODO:后续发消息统一由接口发，现阶段前端自己发消息，联调用
    // msgServer.sendRoomMsg({
    //   type: 'user_apply_host_agree',
    //   receive_account_id: data.receive_account_id,
    //   nickname: watchInitData.join_info.nickname
    // });

    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);

    return im.signaling.hostAgreeApply(retParams);
  }
  // 拒绝用户的上麦申请
  hostRejectApply(data = {}) {
    const { watchInitData } = useRoomBaseServer().state;
    const msgServer = useMsgServer();

    // TODO:后续发消息统一由接口发，现阶段前端自己发消息，联调用
    // msgServer.sendRoomMsg({
    //   type: 'user_apply_host_reject',
    //   receive_account_id: data.receive_account_id,
    //   nickname: watchInitData.join_info.nickname
    // });

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
    console.log('观看端-用户同意上麦', data);
    return im.signaling.userAgreeInvite(data);
  }
  // 观看端-用户拒绝邀请上麦
  userRejectInvite(data = {}) {
    console.log('观看端-用户拒绝上麦', data);
    return im.signaling.userRejectInvite(data);
  }
  // 拒绝邀请
  // refuseInvite(data = {}) {}
}

export default function useMicServer() {
  return new MicServer();
}
