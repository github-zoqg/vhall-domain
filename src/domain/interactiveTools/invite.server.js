class InviteServer {
  constructor() {
    if (typeof InviteServer.instance === 'object') {
      return InviteServer.instance;
    }

    this.state = {};
  }
}
