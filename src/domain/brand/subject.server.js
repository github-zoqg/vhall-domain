import { roomSubjectApi, wechatApi } from '@/request/index';

class SubjectServer {
  constructor() {
    if (typeof SubjectServer.instance === 'object') {
      return SubjectServer.instance;
    }

    this.state = {
      subjectDetailInfo: {},
      subjectAuthInfo: {}
    };
  }

  getSubjectInfo(data = {}) {
    return roomSubjectApi.subject.getSubjectInfo(data);
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
    return roomSubjectApi.subject.getSubjectWatchAuth(data).then(res => {
      if (res.code == 200) {
        this.state.subjectAuthInfo = res.data;
      }
    })
  }
}

export default function useSubjectServer() {
  if (!useSubjectServer.instance) {
    useSubjectServer.instance = new SubjectServer();
  }

  return useSubjectServer.instance;
}
