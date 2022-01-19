import { merge } from '../../utils/index';
import { mic, im } from '../../request';
import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
class MicServer extends BaseServer {
  constructor() {
    super();
    if (typeof MicServer.instance === 'object') {
      return MicServer.instance;
    }
    this.state = {};
    MicServer.instance = this;
    this._init();
    return this;
  }
  _init() {
    this._initEventListeners();
  }
  _initEventListeners() {
    const msgServer = useMsgServer();
    const { join_info } = useRoomBaseServer().state.watchInitData;
    msgServer.$onMsg('ROOM_MSG', msg => {
      console.log(
        '----连麦服务----房间消息',
        msg,
        msg.data.receive_account_id,
        join_info.third_party_user_id
      );
      switch (msg.data.type) {
        // 开启允许举手
        case 'vrtc_connect_open':
          if (join_info.role_name == 1) {
            this.$emit('vrtc_connect_open', msg);
          }
          break;
        // 关闭允许举手
        case 'vrtc_connect_close':
          break;
        // 用户申请上麦
        case 'vrtc_connect_apply':
          if (join_info.role_name == 1) {
            this.$emit('vrtc_connect_apply', msg);
          }
          break;
        // 用户取消申请上麦
        case 'vrtc_connect_apply_cancel':
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
          if (
            (join_info.role_name == 1 && msg.sourceId != join_info.third_party_user_id) || // 当前用户是主持人并且消息不是自己发的
            (join_info.role_name == 3 && msg.sourceId != join_info.third_party_user_id) || // 当前用户是助理并且消息不是自己发的
            (join_info.role_name == 2 &&
              msg.data.receive_account_id == join_info.third_party_user_id) // 当前用户是观众
          ) {
            this.$emit('vrtc_connect_agree', msg);
          }
          break;
        // 用户成功上麦
        case 'vrtc_connect_success':
          break;
        // 用户成功下麦
        case 'vrtc_disconnect_success':
          break;
        // 主持人邀请观众上麦
        case 'vrtc_connect_invite':
          break;
        // 用户同意上麦
        case 'vrtc_connect_invite_agree':
          break;
        // 用户拒绝上麦
        case 'vrtc_connect_invite_refused':
          break;
      }
    });
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
  userSpeakOff(data = {}) {
    const { watchInitData } = useRoomBaseServer().state;
    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);
    return im.signaling.userSpeakOff(retParams);
  }
  // 允许举手
  setHandsUp(data = {}) {
    return mic.setHandsUp(data);
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
    const msgServer = useMsgServer();

    // TODO:后续发消息统一由接口发，现阶段前端自己发消息，联调用
    msgServer.sendRoomMsg({
      type: 'user_apply_host_agree',
      receive_account_id: data.receive_account_id,
      nickname: watchInitData.join_info.nickname
    });

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
    msgServer.sendRoomMsg({
      type: 'user_apply_host_reject',
      receive_account_id: data.receive_account_id,
      nickname: watchInitData.join_info.nickname
    });

    const defaultParams = {
      room_id: watchInitData.interact.room_id
    };
    const retParams = merge.recursive({}, defaultParams, data);

    return im.signaling.hostRejectApply(retParams);
  }
  // 邀请上麦
  inviteMic(data = {}) {
    return mic.inviteMic(data);
  }
  // 取消申请
  cancelApply(data = {}) {
    return mic.cancelApply(data);
  }
  // 拒绝邀请
  refuseInvite(data = {}) {
    return mic.refuseInvite(data);
  }
}

export default function useMicServer() {
  return new MicServer();
}
