import request from '@/utils/http.js';
import qs from 'qs';

const biz_id = 2;

// 获取提现信息
const getCashInfo = (data = {}) => {
  return request({
    url: '/v3/fin/income',
    method: 'GET',
    data: { biz_id, ...data }
  });
};

// 获取提现列表
const getCashList = (data = {}) => {
  return request({
    url: '/v3/fin/income/withdraw-rp/list',
    method: 'GET',
    data: { biz_id, ...data }
  });
};

// 获取微信绑定信息 是否绑定 头像 昵称
const checkWithDrawal = (data = {}) => {
  return request({
    url: '/v3/users/oauth/check-withdrawal-to-cpc',
    method: 'POST',
    data: { biz_id, ...data }
  });
};

// 获取微信扫码的key值
const getBindKey = (data = {}) => {
  return request({
    url: '/v3/users/user/mark',
    method: 'POST',
    data: { biz_id, ...data }
  });
};

// 微信扫码绑定情况
const withdrawIsBind = (data = {}) => {
  return request({
    url: '/v3/users/oauth/check-is-bind-to-cpc',
    method: 'POST',
    data: { biz_id, ...data }
  });
};

// 账户收益-提现
const withdraw = (data = {}) => {
  return request({
    url: '/v3/fin/withdraw',
    method: 'POST',
    data: qs.stringify({ biz_id, ...data })
  });
};

// 账户收益-提现-发送手机验证码
const withdrawSendCode = (data = {}) => {
  return request({
    url: '/v3/fin/withdraw/phone-code',
    method: 'POST',
    data: qs.stringify({ biz_id, ...data })
  });
};

// 绑定手机号 发送验证码
const sendCode = (data = {}) => {
  return request({
    url: '/v3/users/code-consumer/send',
    method: 'POST',
    data: { biz_id, ...data }
  });
};

export default {
  getCashInfo,
  getCashList,
  checkWithDrawal,
  getBindKey,
  withdrawIsBind,
  withdraw,
  withdrawSendCode,
  sendCode
};
