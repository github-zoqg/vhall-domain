import { inviteApi, wechatApi } from '@/request';

class InviteServer {
  constructor() {
    if (typeof InviteServer.instance === 'object') {
      return InviteServer.instance;
    }

    this.state = {};
  }

  createInvite(data = {}, options = {}) {
    return inviteApi.createInvite(data, options);
  }

  createInviteItem(data = {}, options = {}) {
    return inviteApi.createInviteItem(data, options);
  }

  wechatShare(data = {}) {
    return wechatApi.wechatShare(data);
  }
}

export default function useInviteServer() {
  if (!useInviteServer.instance) {
    useInviteServer.instance = new InviteServer();
  }

  return useInviteServer.instance;
}
