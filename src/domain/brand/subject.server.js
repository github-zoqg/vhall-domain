import { subjectApi, wechatApi } from '@/request/index';

class SubjectServer {
  constructor() {
    if (typeof SubjectServer.instance === 'object') {
      return SubjectServer.instance;
    }

    this.state = {};
  }

  getSubjectInfo(data = {}) {
    return subjectApi.getSubjectInfo(data);
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
