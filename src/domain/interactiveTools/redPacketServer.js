import BaseServer from '@/domain/common/base.server.js';
import useRoomBaseServer from '@/domain/room/roombase.server.js';
import useChatServer from '@/domain/chat/chat.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import redPacketApi from '../../request/redPacket';
import chatApi from '../../request/im/chat/index'
const RED_ENVELOPE_OK = 'red_envelope_ok'; // 发红包
const RED_ENVELOPE_OPEN_SUCCESS = 'red_envelope_open_success'; // 红包成功打开
const RED_ENVELOPE_PUSH = 'red_envelope_push'; // 红包推送
class RedPacketServer extends BaseServer {
  constructor(opts) {
    super(opts);
    this._uuid = '';
    this.state = {
      info: {},
      online: 0, // 在线人数
      amount: 0,
      status: -1, // 红包状态: 0 抢光了
      available: false // 当前红包是否可领取
    };
    this.listenMsg(opts);
  }
  setUUid(uuid) {
    this._uuid = uuid;
  }
  listenMsg(opts) {
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      switch (msg.data.event_type || msg.data.type) {
        case RED_ENVELOPE_OK:
          this.$emit(RED_ENVELOPE_OK, msg.data);
          if (opts?.mode === 'watch') {
            useChatServer().addChatToList({
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content: '红包派发中'
              },
              type: msg.type,
              interactStatus: true,
              Show: true
            });
          }
          break;
      }
    });
    // 发起端需要监听在线人数
    if (opts?.mode === 'live') {
      useMsgServer().$onMsg('JOIN', () => {
        this.state.online++
      });
      useMsgServer().$onMsg('LEFT', msg => {
        // 离开房间
        this.state.online--
        if (this.state.online < 0) {
          this.state.online = 0
        }
      });
    }
    if (opts?.mode === 'watch') {
      useMsgServer().$onMsg(RED_ENVELOPE_PUSH, msg => {
        // 红包推送消息
        this.state.available = true
      });
      useMsgServer().$onMsg(RED_ENVELOPE_OPEN_SUCCESS, () => {
        // 
        this.state.available = !(e.data?.red_packet_status == 0);
      });
    }
  }
  /**
   * @description 获取在线人数
   */
  getOnline() {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return chatApi.getOnlineList({
      room_id: interact.room_id,
      pos: 0,
      limit: 1 // 只需要取总数  不需要列表
    }).then(res => {
      this.state.online = res.data.total;
      return res
    })
  }
  /**
   * @description 获取红包(观看端的初始化)
   */
  getRedPacketInfo(uuid) {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    this._uuid = uuid;
    return redPacketApi
      .getRedPacketInfo({
        room_id: interact.room_id,
        red_packet_uuid: this._uuid
      })
      .then(res => {
        this.state.info = res.data.red_packet;
        this.state.status = res.data.status;
        if (res.data.amount) {
          this.state.amount = res.data.amount;
        }
        return res;
      });
  }
  /**
   * @description 领红包
   */
  openRedPacket() {
    const { watchInitData } = useRoomBaseServer().state;
    const { redPacket } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi
      .openRedpacket({
        room_id: interact.room_id,
        red_packet_uuid: this._uuid || redPacket.red_packet_uuid
      })
      .then(res => {
        this.state.amount = res.data.amount;
        return res;
      });
  }

  /**
   * @description 发送红包
   */
  createRedPacket(params) {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi.createRedpacket({
      room_id: interact.room_id,
      ...params
    });
  }
  /**
   * @description 红包中奖人列表
   */
  getRedPacketWinners(params) {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi.getRedPacketWinners({
      order: 'created_at',
      room_id: interact.room_id,
      red_packet_uuid: this._uuid,
      ...params
    });
  }
  /**
   * @description 发送红包后的数据上报
   */
  createReport(params) {
    this.$vhall_paas_port({
      k: 110054,
      data: {
        business_uid: userId,
        user_id: '',
        webinar_id: this.$route.params.il_id,
        refer: '',
        s: '',
        report_extra: {},
        ref_url: '',
        req_url: ''
      }
    });
    this.$vhall_paas_port({
      k: this.redcouponType === 1 ? 110055 : 110056,
      data: {
        business_uid: userId,
        user_id: '',
        webinar_id: this.$route.params.il_id,
        refer: '',
        s: '',
        report_extra: {},
        ref_url: '',
        req_url: ''
      }
    });
    this.$vhall_paas_port({
      k: this.channel === 'ALIPAY' ? 110058 : 110059,
      data: {
        business_uid: userId,
        user_id: '',
        webinar_id: this.$route.params.il_id,
        refer: '',
        s: '',
        report_extra: {},
        ref_url: '',
        req_url: ''
      }
    });
  }
}

export default function useRedPacketServer(opts) {
  return new RedPacketServer(opts);
}
