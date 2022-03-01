import { homepageApi, wechatApi, meeting } from '@/request/index';

class HomepageServer {
  constructor() {
    if (typeof HomepageServer.instance === 'object') {
      return HomepageServer.instance;
    }

    this.state = {};
  }
  getConfigList(data = {}) {
    return meeting.getConfigList(data).then(res => {
      if (res.code == 200) {
        this.state.configList = JSON.parse(res.data.permissions);
      }
      return res;
    });
  }
  getUserHomeInfo(data = {}) {
    return homepageApi.getUserHomeList(data);
  }
  //直播
  getlivingList(data = {}) {
    return homepageApi.getlivingList(data);
  }

  // 专题
  getSubjectList(data = {}) {
    return homepageApi.getSubjectList(data);
  }

  wechatShare(data = {}) {
    return wechatApi.wechatShare(data);
  }
}

export default function useHomepageServer() {
  if (!useHomepageServer.instance) {
    useHomepageServer.instance = new HomepageServer();
  }

  return useHomepageServer.instance;
}
