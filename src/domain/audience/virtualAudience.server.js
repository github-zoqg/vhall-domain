import requestApi from '../../request/index';

export default function useVirtualClientStartServe() {
    const state = {
        preson: {
            pv: '',
            basePv: '',
            baseTime: '',
            onlineNum: '',
            baseOnlineNum: ''
        },
        addCount: ''
    };

    const virtualClientStart = data => {
        return requestApi.virtualClient.virtualClientStart(data);
    };

    const virtualAccumulation = data => {
        return requestApi.virtualClient.virtualAccumulation(data);
    };

    const virtualClientGet = data => {
        let http = requestApi.virtualClient.virtualClientGet(data);
        http.then(res => {
            console.log('请求成功！！！！！');
            state.preson.pv = res.data.pv;
            state.preson.basePv = res.data.base_pv;
            state.preson.baseTime = res.data.base_time;
            state.addCount = res.data.base_time;
            state.preson.onlineNum = res.data.online;
            state.preson.baseOnlineNum = res.data.base_online;
        });
        return http;
    };

    return { state, virtualClientStart, virtualAccumulation, virtualClientGet };
}
