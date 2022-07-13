import { roomSubjectApi, wechatApi } from '@/request/index';

class SubjectServer {
  constructor() {
    if (typeof SubjectServer.instance === 'object') {
      return SubjectServer.instance;
    }

    this.state = {
      subjectDetailInfo: {}
    };
  }

  getSubjectInfo(data = {}) {
    return roomSubjectApi.subject.getSubjectInfo(data);
  }

  wechatShare(data = {}) {
    return wechatApi.wechatShare(data);
  }
}

export default function useSubjectServer() {
  if (!useSubjectServer.instance) {
    useSubjectServer.instance = new SubjectServer();
  }

  return useSubjectServer.instance;
}
