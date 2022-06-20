import BaseServer from '@/domain/common/base.server';
import useMsgServer from '@/domain/common/msg.server.js';
import { subscribeApi } from '../../request/index';

class SubscribeServer extends BaseServer {
  constructor() {
    if (typeof SubscribeServer.instance === 'object') {
      return SubscribeServer.instance;
    }
    super();
    SubscribeServer.instance = this;
    this.state = {
      isFirstEnterPlayer: false, //是否是初时进入页面
      isChangeOrder: false, // 暖场视频顺序是否修改
      subscribeWarmList: [], // 初始化播放器组件个数
      warmVideo: 60,
      warmFullScreen: false, // 是否是全屏
      playIndex: 0,  //播放了第几个
      initIndex: 0 // 初始化播放器第几个
    };
    this.listenMsg();
    return this;
  }
  listenMsg() {
    const msgServer = useMsgServer();
    // 房间消息
    msgServer.$onMsg('ROOM_MSG', msg => {
      if (msg.data.type == 'live_start') {
        this.$emit('live_start', msg.data);
      }
      if (msg.data.type == 'live_over') {
        this.$emit('live_over', msg.data);
      }

      if (msg.data.type == 'pay_success') {
        console.log('woshi我是预约页')
        this.$emit('pay_success', msg.data);
      }
    });
  }
  // 鉴权
  watchAuth(params = {}) {
    return subscribeApi.watchAuth(params).then(res => {
      return res;
    });
  }

  // 支付
  payWay(params = {}) {
    return subscribeApi.payWay(params).then(res => {
      return res;
    });
  }

  // 添加暖场视频列表
  setWarmVideoList(item, flag = true) {
    flag ? this.state.subscribeWarmList.push(item) : this.state.subscribeWarmList.shift();

    console.log(this.state.subscribeWarmList, '12324snuancnuanc1暖场视频')
  }
}

export default function useSubscribeServer() {
  return new SubscribeServer();
}
