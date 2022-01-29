import BaseServer from '../common/base.server';
/**
 * 标准分组直播场景下的分组相关服务
 *
 * @class StandardGroupServer
 */
class StandardGroupServer extends BaseServer {
  constructor() {
    super();

    this.state = {
      show: false,
      //''-无分组讨论(默认); ready-分组待设置；grouping-分组中；discuss-讨论中
      status: ''
    };
  }

  /**
   * 获取单实例
   * @returns
   */
  static getInstance() {
    if (!StandardGroupServer.instance) {
      StandardGroupServer.instance = new StandardGroupServer();
    }
    return StandardGroupServer.instance;
  }
}

export default function useGroupServer() {
  return StandardGroupServer.getInstance();
}
