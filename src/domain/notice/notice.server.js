import { im as iMRequest } from '@/request';

class NoticeServer {
  constructor() {
    if (typeof NoticeServer.instance === 'object') {
      return NoticeServer.instance;
    }
    this.state = this.resetState();
    NoticeServer.instance = this;
    return this;
  }

  reset() {
    this.state = this.resetState();
  }

  resetState() {
    return {
      //公告列表
      noticeList: [],

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

  //获取消息记录
  getNoticeList({ flag = false, params = {} }) {
    if (!flag) {
      try {
        this.state.noticeList = [];
        this.state.pageInfo = {
          pos: 0,
          limit: 10,
          pageNum: 1
        };
        this.state.totalPages = 1;
        this.state.total = 0;
      } catch (err) {
        console.log('errrrrrr', err);
      }
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
      return { backData: res, state: this.state };
    });
  }

  sendNotice(params = {}) {
    return iMRequest.notice.sendNotice(params);
  }
}

export default function useNoticeServer() {
  if (!useNoticeServer.instance) {
    useNoticeServer.instance = new NoticeServer();
  }

  return useNoticeServer.instance;
}
