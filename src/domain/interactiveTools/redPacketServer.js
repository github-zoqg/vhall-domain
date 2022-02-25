import BaseServer from '@/domain/common/base.server.js';
import useRoomBaseServer from '@/domain/room/roombase.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import redPacketApi from '../../request/redPacket';

class RedPacketServer extends BaseServer {
  constructor() {
    super();
  }
  /**
   * @description 发送红包
   */
  createRedPacket(params) {
    console.log(params);
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi.createRedpacket({
      room_id: interact.room_id,
      ...params
    });
  }
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
