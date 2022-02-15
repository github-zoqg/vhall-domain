import { attentionApi } from '../../request/index';

export default function useAttentionServer() {
  // this.state = {
  //   isAttention: false
  // };
  // 关注状态
  function getAttentionStatus(params = {}) {
    return attentionApi.getAttentionStatus(params).then(res => {
      return res;
    });
  }

  // 关注
  function attention(params = {}) {
    return attentionApi.attention(params).then(res => {
      return res;
    });
  }

  // 取消关注
  function cancelAttention(params = {}) {
    return attentionApi.cancelAttention(params).then(res => {
      return res;
    });
  }

  return { getAttentionStatus, attention, cancelAttention };
}
