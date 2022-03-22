import BaseServer from '@/domain/common/base.server.js';
import useRoomBaseServer from '@/domain/room/roombase.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import redPacketApi from '../../request/redPacket';
import chatApi from '../../request/im/chat/index'

const RED_ENVELOPE_OK = 'red_envelope_ok'; // 发红包
const RED_ENVELOPE_OPEN_SUCCESS = 'red_envelope_open_success'; // 红包成功打开
const RED_ENVELOPE_PUSH = 'red_envelope_push'; // 红包推送
class RedPacketServer extends BaseServer {
  constructor(opts = {}) {
    super(opts);
    this._uuid = '';
    this.state = {
      info: {}, // 红包信息
      online: 0, // 在线人数
      amount: 0, // 获奖金额
      status: -1, // 红包状态: 0 抢光了, 1 可抢
      available: false // 当前红包是否可领取
    };
    this.listenMsg(opts);
  }

  // 更新红包id
  setUUid(uuid) {
    this._uuid = uuid;
  }

  // 设置红包是否可领取
  setAvailable(available) {
    this.state.available = available;
  }
  listenMsg(opts) {
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      switch (msg.data.event_type || msg.data.type) {
        case RED_ENVELOPE_OK:
          console.log('红包消息:RED_ENVELOPE_OK')
          this.state.available = true
          this.$emit(RED_ENVELOPE_OK, msg.data);
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
      useMsgServer().$onMsg('ROOM_MSG', msg => {
        console.log('红包消息:', msg)
        switch (msg.data.event_type || msg.data.type) {
          case RED_ENVELOPE_PUSH: // 红包推送消息
            console.log('红包消息:RED_ENVELOPE_PUSH')
            this.state.available = true
            break;
          case RED_ENVELOPE_OPEN_SUCCESS: // 红包领取消息
            console.log('红包消息:RED_ENVELOPE_OPEN_SUCCESS')
            this.state.available = !(msg.data?.red_packet_status === 0);
            console.log('available:' + this.state.available)
            break;
        }
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
    const { interact } = watchInitData;
    return redPacketApi
      .openRedpacket({
        room_id: interact.room_id,
        red_packet_uuid: this._uuid
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
    }).then(res => {
      if (res.data.red_packet) {
        this.state.info = res.data.red_packet
      }
      return res
    })
  }
  /**
   * @description 获取最后一个红包的领取信息
   */
  getLatestRedpacketUsage() {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi.getLatestRedpacketUsage({
      room_id: interact.room_id
    });
  }
}

export default function useRedPacketServer(opts) {
  if (!RedPacketServer.instance) {
    RedPacketServer.instance = new RedPacketServer(opts);
  }
  return RedPacketServer.instance;
}
