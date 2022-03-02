import axios from 'axios/dist/axios';
import qs from 'qs';

let TOKEN = '';
let V3_BASE_URL = '';
let MIDDLE_BASE_URL = '';
let LIVETOKEN = '';
let HEADERS = {};

function setBaseUrl(options) {
  console.log('---V3_BASE_URL----', options);
  V3_BASE_URL = options.v3Url;
  MIDDLE_BASE_URL = options.middleUrl;
}
function setToken(token, livetoken) {
  TOKEN = token;
  LIVETOKEN = livetoken;
}
function setRequestHeaders(options) {
  Object.assign(HEADERS, options);
}

console.dir(axios);
const service = axios.create({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

// request interceptor
service.interceptors.request.use(
  config => {
    // console.log('----axios----请求配置', JSON.stringify(config));
    // set baseURL
    config.baseURL = config.url.startsWith('/v3') ? V3_BASE_URL : MIDDLE_BASE_URL;
    // 调试
    config.baseURL = config.url.includes('weixin') ? 'https://t-saas-dispatch.vhall.com' : V3_BASE_URL;

    // 如果有 live_token 就不需要传 token
    if (TOKEN && !LIVETOKEN) {
      config.headers['token'] = TOKEN;
    }

    // live_token 放在 body 中传
    if (LIVETOKEN) {
      if (typeof config.data === 'string') {
        config.data = (config.data && JSON.parse(config.data)) || {};
      }
      config.data = {
        live_token: LIVETOKEN,
        ...config.data
      };
      // config.data = JSON.stringify(config.data);
    }
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
        const params = config.data;
        const formData = new FormData();
        Object.keys(params).forEach(key => {
          formData.append(key, params[key]);
        });
        config.data = formData;
      }
    } else {
      if (config.data && typeof config.data === 'object') {
        config.data = qs.stringify(config.data);
      }
    }

    config.headers = {
      'interact-token': sessionStorage.getItem('interact_token') || '',
      ...HEADERS,
      ...config.headers
    };

    // console.log('---请求拦截----', config);
    return config;
  },
  error => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(response => {
  return response.data;
});

export default service;
export { setBaseUrl, setToken, setRequestHeaders };
