/**
 * 观看端关注服务
 * @returns
 */
import { attentionApi } from '../../request/index';
import BaseServer from '@/domain/common/base.server.js';
class AttentionServer extends BaseServer {
  constructor() {
    super();
    if (typeof AttentionServer.instance === 'object') {
      return AttentionServer.instance;
    }
    this.state = {};
    AttentionServer.instance = this;
    return this;
  }

  // 关注状态
  getAttentionStatus(params = {}) {
    return attentionApi.getAttentionStatus(params).then(res => {
      return res;
    });
  }

  // 关注
  attention(params = {}) {
    return attentionApi.attention(params).then(res => {
      return res;
    });
  }

  // 取消关注
  cancelAttention(params = {}) {
    return attentionApi.cancelAttention(params).then(res => {
      return res;
    });
  }
}

export default function useAttentionServer() {
  return new AttentionServer();
}
