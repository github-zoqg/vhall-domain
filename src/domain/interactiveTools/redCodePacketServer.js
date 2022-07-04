import BaseServer from '@/domain/common/base.server.js';
import useRoomBaseServer from '@/domain/room/roombase.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import redPacketApi from '../../request/redCodePacket';

const PWD_RED_ENVELOPE_OK = 'pwd_red_envelope_ok'; // 发红包
const PWD_RED_ENVELOPE_OPEN_SUCCESS = 'pwd_red_envelope_open_success'; // 红包成功打开
const PWD_RED_ENVELOPE_PUSH = 'pwd_red_envelope_push'; // 红包推送
class RedCodePacketServer extends BaseServer {
  constructor(opts = {}) {
    super(opts);
    this._uuid = ''; // 当期那操作的红包
    this._lastUUid = ''; // 最后一个红包的id(icon)
    this.state = {
      iconVisible: false, // icon显示
      dotVisible: false, // dot显示
      info: {}, // 红包信息
      online: 0, // 在线人数
      amount: 0, // 获奖金额
      is_luck: 2, //    0：打开没抢到     1:抢到了     2：没打开红包
      available: false, // 当前红包是否可领取
      red_code: '' //口令红包码
    };
    this.listenMsg(opts);
    //初始化在聚合接口之后
    this.initIconStatus()
  }

  initIconStatus() {
    console.log('initIconStatus,useRoomBaseServer-watch')
    console.log(useRoomBaseServer().state)
    const redPacketInfo = useRoomBaseServer().state?.pwdredPacket
    console.log(JSON.parse(JSON.stringify(redPacketInfo)))
    if (redPacketInfo) {
      //is_luck  0：打开没抢到     1:抢到了     2：没打开红包
      this.state.available = redPacketInfo.is_luck == 2 // 没打开红包就可以领
      // 没打开红包则显示红包小红点
      this.state.dotVisible = redPacketInfo.is_luck == 2
      console.log('available', this.state.available, 'dotVisible', this.state.dotVisible)
      // 显示红包icon
      if (redPacketInfo.status == 1) {
        this.state.iconVisible = true;
      }
      this._lastUUid = redPacketInfo.red_packet_uuid
    }
  }

  // 更新红包id
  setUUid(uuid) {
    this._uuid = uuid;
  }

  getLastUUid() {
    return this._lastUUid
  }

  // 设置红包是否可领取
  setAvailable(available) {
    this.state.available = available;
    console.log('setAvailable', available, this.state.available)
  }

  // 设置小红点状态
  setDotVisible(visible) {
    this.state.dotVisible = visible;
  }

  listenMsg(opts) {
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      switch (msg.data.event_type || msg.data.type) {
        case PWD_RED_ENVELOPE_OK:
          console.log('红包消息:PWD_RED_ENVELOPE_OK')
          this.state.available = true
          this.state.iconVisible = true
          this.state.dotVisible = true
          this._lastUUid = msg.data.red_packet_uuid
          this.$emit(PWD_RED_ENVELOPE_OK, msg.data);
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
        switch (msg.data.event_type || msg.data.type) {
          case PWD_RED_ENVELOPE_PUSH: // 红包推送消息
            console.log('红包消息:PWD_RED_ENVELOPE_PUSH')
            this.state.available = true
            break;
          case PWD_RED_ENVELOPE_OPEN_SUCCESS: // 红包领取消息
            console.log('红包消息:PWD_RED_ENVELOPE_OPEN_SUCCESS')
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
  getRedpacketTotal() {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi.getRedpacketTotal({
      room_id: interact.room_id
    }).then(res => {
      this.state.online = res.data.total;
      return res
    })
  }

  /**
   * @description 获取红包(观看端的初始化)
   */
  getCodeRedPacketInfo(uuid) {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    this._uuid = uuid;
    return redPacketApi
      .getCodeRedPacketInfo({
        room_id: interact.room_id,
        red_packet_uuid: this._uuid
      })
      .then(res => {
        this.state.info = res.data.red_packet;
        //is_luck  0：打开没抢到     1:抢到了     2：没打开红包
        this.state.is_luck = res.data.is_luck;
        //保存红包口令
        if (res.data.red_code) {
          this.state.red_code = res.data.red_code;
        } else {
          this.state.red_code = '';
        }
        return res;
      });
  }

  /**
   * @description 领红包
   */
  openCodeRedPacket() {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi
      .openCodeRedpacket({
        room_id: interact.room_id,
        red_packet_uuid: this._uuid
      })
      .then(res => {
        //存储口令
        if (res.data?.red_code) {
          this.state.red_code = res.data.red_code;
        } else {
          this.state.red_code = '';
        }
        return res;
      });
  }

  /**
   * @description 发送口令红包
   */
  createCodeRedPacket(params) {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi.createCodeRedpacket({
      room_id: interact.room_id,
      ...params
    });
  }

  /**
   * @description 红包中奖人列表
   */
  getCodeRedPacketWinners(params) {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi.getCodeRedPacketWinners({
      order: 'created_at',
      order_type: 'asc',
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
  getLatestCodeRedpacketUsage() {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return redPacketApi.getLatestRedpacketUsage({
      room_id: interact.room_id
    }).then(res => {
      if (res.code === 200) {
        this._lastUUid = res.data.red_packet_uuid
      }
      return res
    })
  }
}

export default function useCodeRedPacketServer(opts) {
  if (!RedCodePacketServer.instance) {
    RedCodePacketServer.instance = new RedCodePacketServer(opts);
  }
  return RedCodePacketServer.instance;
}
