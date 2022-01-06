import requestApi from '../../request/index';

export default function useVirtualClientStartServe() {
  let state = {
    person: {
      pv: '',
      basePv: '',
      baseTime: '',
      onlineNum: '',
      baseOnlineNum: ''
    },
    addCount: ''
  };

  function virtualClientStart(data = {}) {
    return requestApi.virtualClient.virtualClientStart(data);
  }

  function virtualAccumulation(data = {}) {
    return requestApi.virtualClient.virtualAccumulation(data);
  }

  function virtualClientGet(data = {}) {
    let http = requestApi.virtualClient.virtualClientGet(data);
    http.then(res => {
      state.person.pv = res.data.pv;
      state.person.basePv = res.data.base_pv;
      state.person.baseTime = res.data.base_time;
      state.addCount = res.data.base_time;
      state.person.onlineNum = res.data.online;
      state.person.baseOnlineNum = res.data.base_online;
    });
    return http;
  }

  return { state, virtualClientStart, virtualAccumulation, virtualClientGet };
}
