import { inviteApi } from '@/request';

class InviteServer {
  constructor() {
    if (typeof InviteServer.instance === 'object') {
      return InviteServer.instance;
    }

    this.state = {};
  }

  createInvite(data = {}) {
    return inviteApi.createInvite(data);
  }

  createInviteItem(data = {}) {
    return inviteApi.createInviteItem(data);
  }

  wechatShare(data = {}) {
    return inviteApi.wechatShare(data);
  }
}

export default function useInviteServer() {
  if (!useInviteServer.instance) {
    useInviteServer.instance = new InviteServer();
  }

  return useInviteServer.instance;
}
