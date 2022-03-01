import useInteractiveServer from './interactive.server';
import useRoomBaseServer from '../room/roombase.server';
import BaseServer from '../common/base.server';
import { merge } from '../../utils';
class SplitScreenServer extends BaseServer {
  constructor() {
    super();
    if (typeof SplitScreenServer.instance === 'object') {
      return SplitScreenServer.instance;
    }
    this.state = {
      isOpenSplitScreen: false  // 是否开启分屏
    };
    SplitScreenServer.instance = this;

    return this;
  }

  /**
   * 开启分屏
   */
  startSplit() { }

  /**
   * 关闭分屏
   */
  stopSplit() { }

}
export default function useSplitScreenServer() {
  return new SplitScreenServer();
}
