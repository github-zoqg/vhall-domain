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
    return this;
  }
  init() {
    this._initEventListeners();
  }
  _initEventListeners() {
    const msgServer = useMsgServer();
    msgServer.$onMsg('ROOM_MSG', msg => {
      console.log('----micServer----room_msg----', msg);
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
