import { customMenu as customMenuRequest } from '@/request';

class CustomMenuServer {
  constructor() {
    if (typeof CustomMenuServer.instance === 'object') {
      return CustomMenuServer.instance;
    }

    this.state = this.resetState();
    CustomMenuServer.instance = this;
    return this;
  }

  reset() {
    this.state = this.resetState();
  }

  resetState() {
    return {
      customTabs: []
    };
  }

  // 获取推广列表
  getPromoteList() { }

  // 获取活动直播列表
  getActiveList(params = {}) {
    return customMenuRequest.getActiveList(params);
  }

  // 获取专题列表
  getProjectList(params = {}) {
    return customMenuRequest.getProjectList(params);
  }

  // 获取自定义菜单详细内容
  getCustomMenuDetail(params = {}) {
    return customMenuRequest.getCustomMenuDetail(params);
  }

  // 自定义菜单排行榜
  getInviteTopList(params = {}) {
    return customMenuRequest.getInviteTopList(params)
  }

  // 自定义菜单的邀请信息
  getInviteInfo(params = {}) {
    return customMenuRequest.getInviteInfo(params)
  }

  getAwardList(params = {}) {
    return customMenuRequest.getAwardList(params)
  }
}

export default function useCustomMenuServer() {
  if (!useCustomMenuServer.instance) {
    useCustomMenuServer.instance = new CustomMenuServer();
  }

  return useCustomMenuServer.instance;
}
