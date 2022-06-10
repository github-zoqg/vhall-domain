import BaseServer from '../common/base.server.js';

class MenuServer extends BaseServer {
  constructor() {
    if (typeof MenuServer.instance === 'object') {
      return MenuServer.instance;
    }

    super();

    this.state = {
      selectedType: '',
      list: [
        { name: '聊天', type: 3, status: '1', welcome_content: '' },
        { name: '公告', type: 'notice', status: '1' },
        { name: '成员', type: 8, text: '成员', status: '1' },
      ]
    };
  }

  listenEvents() { }
}

export default function useMenuServer() {
  if (!useMenuServer.instance) {
    useMenuServer.instance = new MenuServer();
  }

  return useMenuServer.instance;
}
