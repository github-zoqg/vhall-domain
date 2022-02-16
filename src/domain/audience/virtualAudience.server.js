import { virtualClient } from '../../request/index';
import BaseServer from '../common/base.server';

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
}
export default function useVirtualClientStartServe() {
  return new VirtualClientStartServer();
}
// export default function useVirtualClientStartServe() {
//   let state = {
//     person: {
//       pv: '',
//       basePv: '',
//       baseTime: '',
//       onlineNum: '',
//       baseOnlineNum: ''
//     },
//     addCount: ''
//   };

//   function virtualClientStart(data = {}) {
//     return virtualClient.virtualClientStart(data);
//   }

//   function virtualAccumulation(data = {}) {
//     return virtualClient.virtualAccumulation(data);
//   }

//   function virtualClientGet(data = {}) {
//     let http = virtualClient.virtualClientGet(data);
//     http.then(res => {
//       state.person.pv = res.data.pv;
//       state.person.basePv = res.data.base_pv;
//       state.person.baseTime = res.data.base_time;
//       state.addCount = res.data.base_time;
//       state.person.onlineNum = res.data.online;
//       state.person.baseOnlineNum = res.data.base_online;
//     });
//     return http;
//   }

//   return { state, virtualClientStart, virtualAccumulation, virtualClientGet };
// }
