import { roomSubjectApi, wechatApi } from '@/request/index';

class SubjectServer {
  constructor() {
    if (typeof SubjectServer.instance === 'object') {
      return SubjectServer.instance;
    }

    this.state = {
      subjectDetailInfo: {},
      subjectAuthInfo: {},
      webinarList: []
    };
  }

  // 获取专题详情信息
  getSubjectInfo(data = {}) {
    return roomSubjectApi.subject.getSubjectInfo(data).then(res => {
      if (res.code === 200) {
        // 基本信息
        this.state.subjectDetailInfo = res.data;
      }
      return res;
    });
  }

  // 获取专题详情信息
  getWebinarList(data = {}) {
    return roomSubjectApi.subject.getWebinarList(data).then(res => {
      if (res.code === 200) {
        // 基本信息
        this.state.webinarList = res.data.list
      }
      return res;
    });
  }

  wechatShare(data = {}) {
    return wechatApi.wechatShare(data);
  }

  // 专题鉴权
  getSubjectWatchAuth(data = {}) {
    return roomSubjectApi.subject.getSubjectWatchAuth(data);
  }

  //专题初始化
  initSubjectInfo(data = {}) {
    return roomSubjectApi.subject.initSubjectInfo(data).then(res => {
      if (res.code == 200) {
        // 权限
        this.state.subjectAuthInfo = res.data;
        localStorage.setItem('visitorId', res.data.visitor_id)
      }
      return res;
    })
  }
}

export default function useSubjectServer() {
  if (!useSubjectServer.instance) {
    useSubjectServer.instance = new SubjectServer();
  }

  return useSubjectServer.instance;
}
