import { rebroadcast as rebroadcastRequest } from '@/request';

class RebroadCastServer {
  constructor() {
    if (typeof RebroadCastServer.instance === 'object') {
      return RebroadCastServer.instance;
    }

    this.state = this.resetState();
    RebroadCastServer.instance = this;
    return this;
  }

  reset() {
    this.state = this.resetState();
  }

  resetState() {
    return {
      total: 0,
      current: '',
      sourceWebinarId: '',
      list: []
    };
  }

  // 获取转播列表页
  getList(params = {}) {
    return rebroadcastRequest.getRebroadcastList(params).then(res => {
      if (res.code === 200 && res.data) {
        this.state.list = res.data.list;
        this.state.total = res.data.total;
      }
      return res;
    });
  }

  // 预览转播
  preview(params = {}) {
    return rebroadcastRequest.rebroadcastPreview(params);
  }

  // 开始转播
  start(params = {}) {
    return rebroadcastRequest.startRebroadcast(params);
  }

  // 结束转播
  stop(params = {}) {
    return rebroadcastRequest.stopRebroadcast(params);
  }
}

export default function useRebroadcastServer() {
  if (!useRebroadcastServer.instance) {
    useRebroadcastServer.instance = new RebroadCastServer();
  }

  return useRebroadcastServer.instance;
}
