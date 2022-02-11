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

  // 获取转播列表页
  getList(params = {}) {
    return rebroadcastRequest.getRebroadcastList(params);
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

export default function useRebroadCastServer() {
  if (!useRebroadCastServer.instance) {
    useRebroadCastServer.instance = new RebroadCastServer();
  }

  return useRebroadCastServer.instance;
}
