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

    this.state = {
    };

    GoodServer.instance = this;
    return this;
  }

  // 修改数据
  setState(key, value) {
    this.state[key] = value;
  }

  //监听msgServer通知
  listenEvents() {
    // 自定义消息
    useMsgServer().$onMsg('CUSTOM_MSG', rawMsg => {
      let temp = Object.assign({}, rawMsg);

      if (typeof temp.data !== 'object') {
        temp.data = JSON.parse(temp.data);
        temp.context = JSON.parse(temp.context);
      }
      console.log(temp, '原始消息');
      const { type = '' } = temp.data || {};
      switch (type) {
        // 商品更新
        case 'goods_update_info':
          this.$emit('goods_update_info', temp);
          break;
        default:
          break;
      }
    });
  }

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

  queryGoodsListJson(params = {}) {
    return goodSaasApi.queryGoodsListJson(params).then(res => {
      return res;
    });
  }
}

export default function useGoodServer() {
  return new GoodServer();
}
