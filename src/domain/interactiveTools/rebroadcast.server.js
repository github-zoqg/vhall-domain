import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import { rebroadcast as rebroadcastRequest } from '@/request';
import useMsgServer from '@/domain/common/msg.server.js';

class RebroadCastServer extends BaseServer {
  constructor() {
    if (typeof RebroadCastServer.instance === 'object') {
      return RebroadCastServer.instance;
    }

    super();

    this.state = this.resetState();

    this.listenEvent();
    RebroadCastServer.instance = this;
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
      docUrl: '',
      // docUrl:'//t-alistatic01.e.vhall.com/static/img/video_default_nologo.png',
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
    if (!rebroadcast || Object.keys(rebroadcast).length === 0) return;
    this.state.rebroadcastId = rebroadcast.id;
    this.state.roomId = rebroadcast.room_id;
    this.state.channelId = rebroadcast.channel_id;
    this.state.subject = rebroadcast.subject;
  }

  /**
   * 监听(维护)转播事件
   *
   */
  listenEvent() {
    const msgServer = useMsgServer();
    const roomBaseServer = useRoomBaseServer();

    msgServer.$onMsg('ROOM_MSG', rawMsg => {
      let msg = Object.assign({}, rawMsg);
      if (typeof msg.data !== 'object') {
        msg.data = JSON.parse(msg.data);
        msg.context = JSON.parse(msg.context);
      }

      const { type = '' } = msg.data || {};

      switch (type) {
        // 转播开始
        case 'live_broadcast_start':
          roomBaseServer.setRebroadcastInfo({
            id: msg.data.source_id,
            channel_id: msg.data.channel_id
          });
          this.$emit('live_broadcast_start');
          break;
        // 转播结束
        case 'live_broadcast_stop':
          roomBaseServer.setRebroadcastInfo({
            id: '',
            channel_id: ''
          });
          this.$emit('live_broadcast_stop');
          break;
        case 'live_over':
          roomBaseServer.setRebroadcastInfo({
            id: '',
            channel_id: ''
          });
        default:
          break;
      }
    });
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
    this.state.docUrl = data.document_url;

    return res;
  }

  // 开始转播
  start(params = {}) {
    const roomState = useRoomBaseServer().state;
    const localDesktopStreamId = roomState.watchInitData.localDesktopStreamId;
    const insertFileStreamId = roomState.watchInitData.insertFileStreamId;
    if (localDesktopStreamId || insertFileStreamId) {
      return false
    }
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
