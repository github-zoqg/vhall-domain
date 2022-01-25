import request from '@/utils/http.js';
import { merge } from '../utils/index.js';
import contextServer from '../domain/common/context.server';

// 发起端-开始增加虚拟观众
const virtualClientStart = (params = {}) => {
  // const { state } = contextServer.get('roomInitGroupServer') || {}

  const retParmams = params;

  return request({
    url: '/v3/webinars/virtual/start',
    method: 'GET',
    data: retParmams
  });
};

// 发起端-增加虚拟观众
const virtualAccumulation = (params = {}) => {
  // const { state } = contextServer.get('roomInitGroupServer') || {}

  const retParmams = params;

  return request({
    url: '/v3/webinars/virtual/accumulation',
    method: 'GET',
    data: retParmams
  });
};

// 发起端-获取虚拟观众基数
const virtualClientGet = (params = {}) => {
  // const { state } = contextServer.get('roomInitGroupServer') || {}

  const retParmams = params;

  return request({
    url: '/v3/webinars/virtual/get-base',
    method: 'GET',
    data: retParmams
  });
};

const virtualClient = {
  virtualClientStart,
  virtualAccumulation,
  virtualClientGet
};

export default virtualClient;
