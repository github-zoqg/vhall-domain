import { virtualClient } from '../../request/index';
import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useMsgServer from '@/domain/common/msg.server.js';

const msgServer = useMsgServer();
const roomBaseServer = useRoomBaseServer();
class VirtualClientStartServer extends BaseServer {
  constructor() {
    super();
    if (typeof VirtualClientStartServer.instance === 'object') {
      return VirtualClientStartServer.instance;
    }
    // this.virtualInstance = null; // 互动实例
    this.state = {
      person: {
        pv: '',
        basePv: '',
        baseTime: '',
        onlineNum: '',
        baseOnlineNum: ''
      },
      uvOnline: 1, // 真实人数
      virtualOnline: Number(roomBaseServer.state.watchInitData.online.num) || 0,
      uvHot: Number(roomBaseServer.state.watchInitData.pv.num2) || 0, // 真实热度
      virtualHot: Number(roomBaseServer.state.watchInitData.pv.num) || 0,
      addCount: ''
    };
    return this;
  }
  virtualClientStart(data = {}) {
    return virtualClient.virtualClientStart(data);
  }
  virtualAccumulation(data = {}) {
    return virtualClient.virtualAccumulation(data);
  }
  virtualClientGet(data = {}) {
    return virtualClient.virtualClientGet(data).then(res => {
      this.state.person.pv = res.data.pv;
      this.state.person.basePv = res.data.base_pv;
      this.state.person.baseTime = res.data.base_time;
      this.state.addCount = res.data.base_time;
      this.state.person.onlineNum = res.data.online;
      this.state.person.baseOnlineNum = res.data.base_online;
      return res;
    });
  }
  listenEvent() {
    // 加入房间
    msgServer.$onMsg('JOIN', msg => {
      this.$nextTick(() => {
        this.state.uvOnline = msg.uv;
        if (msg.context.pv > this.state.uvHot) {
          this.state.uvHot = msg.context.pv;
        }
      });
    });
    // 离开房间 ROOM_NUM_UPDATE
    msgServer.$onMsg('LEFT', msg => {
      this.$nextTick(() => {
        this.state.uvOnline = msg.uv;
      });
    });
    // 添加虚拟人数和热度
    msgServer.$onMsg('ROOM_MSG', msg => {
      let msgs = JSON.parse(msg.data);
      if (msgs.type == 'base_num_update') {
        console.log(msg, msgs, '14zhangxiao==========');
        this.$nextTick(() => {
          this.state.virtualHot = this.state.virtualHot + Number(msgs.update_pv);
          this.state.virtualOnline = this.state.virtualOnline + Number(msgs.update_online_num);
        });
      }
    });
  }
}
export default function useVirtualClientStartServe() {
  return new VirtualClientStartServer();
}
