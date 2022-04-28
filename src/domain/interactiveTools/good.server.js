import BaseServer from '@/domain/common/base.server.js';
import { goodSaasApi } from '@/request/index.js';

/**
 * 问答服务
 * @returns
 */

class GoodServer extends BaseServer {
  constructor() {
    if (typeof GoodServer.instance === 'object') {
      return GoodServer.instance;
    }
    super();

    this.state = {};

    GoodServer.instance = this;
    return this;
  }

  // 修改数据
  setState(key, value) {
    this.state[key] = value;
  }

  //监听msgServer通知
  listenEvents() {}

  // 根据问题id查询索引值
  static _findMsgItemByList(data, question_id) {
    let index = data.findIndex(item => {
      return item.id == question_id;
    });
    return index;
  }

  queryGoodsList(params = {}) {
    return goodSaasApi.queryGoodsList(params).then(res => {
      return res;
    });
  }
}

export default function useGoodServer() {
  return new GoodServer();
}
