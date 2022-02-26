import useRoomBaseServer from '../room/roombase.server';
import { rebroadcast as rebroadcastRequest } from '@/request';

class RebroadCastServer {
  constructor() {
    if (typeof RebroadCastServer.instance === 'object') {
      return RebroadCastServer.instance;
    }

    this.state = this.resetState();
    RebroadCastServer.instance = this;

    window.rebroadcast = this;
    return this;
  }

  reset() {
    this.state = this.resetState();
  }

  resetState() {
    return {
      // 列表用
      total: 0,
      currentRoomId: '',
      sourceWebinarId: '',
      list: [],

      rebroadcastId: '',
      subject: '',
      appId: '',
      channelId: '',
      token: '',
      accountId: '',
      roomId: '',
      videoParam: {
        type: 'live'
      }
    };
  }

  init() {
    const roomState = useRoomBaseServer().state;
    const rebroadcast = roomState.watchInitData.rebroadcast;
    if (!rebroadcast) return;
    this.state.rebroadcastId = rebroadcast.id;
    this.state.roomId = rebroadcast.room_id;
    this.state.channelId = rebroadcast.channel_id;
    this.state.subject = rebroadcast.subject;
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
  async preview(params = {}) {
    const res = await rebroadcastRequest.rebroadcastPreview(params);
    const data = res.data;
    this.state.token = data.paas_access_token;
    this.state.accountId = data.third_party_user_id;
    this.state.appId = data.paas_app_id;
    this.state.roomId = data.room_id;

    return res;
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
