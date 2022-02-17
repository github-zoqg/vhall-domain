import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useMsgServer from '@/domain/common/msg.server.js';
import { im as iMRequest } from '@/request';

const msgServer = useMsgServer();
const roomBaseServer = useRoomBaseServer();
export default class StandardNoticeServer extends BaseServer {
  constructor() {
    super();

    this.state = {
      //公告列表
      noticeList: [],
      latestNotice: {
        noticeContent:
          roomBaseServer.state.noticeInfo.total &&
          roomBaseServer.state.noticeInfo.list[0].content['content'],
        total: roomBaseServer.state.noticeInfo.total
      },
      //请求的分页参数
      pageInfo: {
        pos: 0,
        limit: 10,
        pageNum: 1
      },
      //总页数
      totalPages: 1,
      //总条数
      total: 0
    };
  }
  /**
   * 获取单实例
   * @returns
   */
  static getInstance() {
    if (!StandardNoticeServer.instance) {
      StandardNoticeServer.instance = new StandardNoticeServer();
    }
    return StandardNoticeServer.instance;
  }

  // 消息内容
  listenMsg() {
    msgServer.$onMsg('ROOM_MSG', msg => {
      if (msg.data.type === 'room_announcement') {
        this.$emit('room_announcement', msg.data);
      }
    });
  }

  //获取消息记录
  getNoticeList({ flag = false, params = {} }) {
    if (!flag) {
      this.state.noticeList = [];
      this.state.pageInfo = {
        pos: 0,
        limit: 10,
        pageNum: 1
      };
      this.state.totalPages = 1;
      this.state.total = 0;
    } else {
      this.state.pageInfo.limit = params.limit;
      this.state.pageInfo.pos = params.pos;
      this.state.pageInfo.pageNum = params.pageNum;
    }

    return iMRequest.notice.getNoticeList(params).then(res => {
      if (res.code == 200 && res.data) {
        this.state.total = res.data.total;
        if (flag) {
          this.state.noticeList.push(...res.data.list);
        } else {
          this.state.noticeList = res.data.list;
        }
        this.state.totalPages = Math.ceil(res.data.total / this.state.pageInfo.limit);
      }
      return res;
    });
  }

  // 设置最新公告（区分小组内和主直播间）
  setLatestNoticeInfo(info) {
    this.state.latestNotice.noticeContent = info;
  }

  /**
   * 发送公告
   * @param {String} content 消息内容
   * @param {String} messageType 1:主直播公告 2:小组公告 如果不是分组直播会报错
   * @returns
   */
  async sendNotice({ content, messageType, roomId, switchId }) {
    const { watchInitData } = roomBaseServer.state;
    const params = {
      room_id: roomId || watchInitData.interact.room_id, // 主直播房间ID
      switch_id: switchId || watchInitData.switch.switch_id, // 场次ID
      body: content,
      message_type: messageType
    };
    const result = await iMRequest.notice.sendNotice(params);
    if (result && result.code === 200) {
      console.log('公告发送完成:', result);
    }
    return result;
  }
}
