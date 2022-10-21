import request from '@/utils/http.js';
import env from '@/request/env';
// import contextServer from '@/domain/common/context.server.js';

/**
 * @function attention 获取在线商品列表
 * @param {*} data
 */
const queryGoodsList = params => {
  const url = env.qa === 'v3' ? '/v3/interacts/goods/get-on-sale-goods-list' : '';
  return request({
    url: url,
    method: 'GET',
    params: params
  });
};
const queryGoodsListJson = params => {
  return request({
    url: params.url,
    method: 'GET',
    params: params
  });
};

export default {
  queryGoodsList,
  queryGoodsListJson
};
