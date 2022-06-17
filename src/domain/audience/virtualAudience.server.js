import { virtualClient } from '../../request/index';
import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useMsgServer from '@/domain/common/msg.server.js';

class VirtualClientStartServer extends BaseServer {
  constructor() {
    super();
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
      virtualOnline: 0,
      uvHot: 0, // 真实热度
      virtualHot: 0,
      addCount: ''
    };
    this.listenEvent();
    VirtualClientStartServer.instance = this;
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
  init() {
    const { online, pv } = useRoomBaseServer().state.watchInitData;
    this.state.virtualOnline = online && online.num;
    this.state.virtualHot = pv && pv.num;
    this.state.uvHot = pv && pv.num2;
  }
  listenEvent() {
    const msgServer = useMsgServer();
    let isSendClient = Boolean(['send', 'record', 'clientEmbed'].includes(useRoomBaseServer().state.clientType))
    if (isSendClient) return;
    // 加入房间
    msgServer.$onMsg('JOIN', msg => {
      this.state.uvOnline = msg.uv;
      if (msg.context.pv > this.state.uvHot) {
        this.state.uvHot = msg.context.pv;
      }
    });
    // 离开房间 ROOM_NUM_UPDATE
    msgServer.$onMsg('LEFT', msg => {
      this.state.uvOnline = msg.uv;
    });
    // 添加虚拟人数和热度
    msgServer.$onMsg('ROOM_MSG', msg => {
      let msgs = msg.data;
      if (msgs.type == 'base_num_update') {
        this.state.virtualHot = this.state.virtualHot + Number(msgs.update_pv);
        this.state.virtualOnline = this.state.virtualOnline + Number(msgs.update_online_num);
      } else if (msgs.type == 'main_room_join_change') {
        // 分组直播，小组中和主房间切换，需要维护在线人数
        this.state.uvOnline = msg.uv;
      }
    });
  }
}
export default function useVirtualAudienceServer() {
  if (typeof VirtualClientStartServer.instance === 'object') {
    return VirtualClientStartServer.instance;
  }
  return new VirtualClientStartServer();
}
