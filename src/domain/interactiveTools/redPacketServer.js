import BaseServer from '@/domain/common/base.server.js';
import useRoomBaseServer from '@/domain/room/roombase.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import redPacketApi from '../../request/redPacket';

const RED_ENVELOPE_OK = 'red_envelope_ok'; // 支付成功消息
class RedPacketServer extends BaseServer {
  constructor() {
    super();
    this.listenMsg();
  }

  listenMsg() {
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      switch (msg.data.event_type || msg.data.type) {
        case RED_ENVELOPE_OK:
          this.$emit(RED_ENVELOPE_OK, msg);
          break;
      }
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

export default function useRedPacketServer() {
  return new RedPacketServer();
}
