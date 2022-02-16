import request from '@/utils/http.js';

// 发起端-开始增加虚拟观众
const virtualClientStart = (params = {}) => {
  const retParmams = params;

  return request({
    url: '/v3/webinars/virtual/start',
    method: 'GET',
    params: retParmams
  });
};

// 发起端-增加虚拟观众
const virtualAccumulation = (params = {}) => {
  const retParmams = params;

  return request({
    url: '/v3/webinars/virtual/accumulation',
    method: 'GET',
    params: retParmams
  });
};

// 发起端-获取虚拟观众基数
const virtualClientGet = (params = {}) => {
  const retParmams = params;

  return request({
    url: '/v3/webinars/virtual/get-base',
    method: 'GET',
    params: retParmams
  });
};

const virtualClient = {
  virtualClientStart,
  virtualAccumulation,
  virtualClientGet
};

export default virtualClient;
