import BaseServer from '../common/base.server.js';

class MenuServer extends BaseServer {
  constructor() {
    if (typeof MenuServer.instance === 'object') {
      return MenuServer.instance;
    }

    super();
  }

  listenEvents() {}
}

export default function useMenuServer() {
  if (!useMenuServer.instance) {
    useMenuServer.instance = new MenuServer();
  }

  return useMenuServer.instance;
}
