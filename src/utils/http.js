import axios from 'axios/dist/axios';
import qs from 'qs';

let V3_BASE_URL = '';
let MIDDLE_BASE_URL = '';
let WX_BIND_BASE_URL = '';
let HEADERS = {};
let COMMON_BODY = {};

function setBaseUrl(options) {
  console.log('---V3_BASE_URL----', options);
  V3_BASE_URL = options.v3Url;
  MIDDLE_BASE_URL = options.middleUrl;
  WX_BIND_BASE_URL = options.wxBindBaseUrl;
}

function setRequestHeaders(options) {
  Object.assign(HEADERS, options);
}

// 返回当前请求头设置的platform 判断当前的使用的端
function getPlatform() {
  return HEADERS['platform']
}

function setRequestBody(options) {
  Object.assign(COMMON_BODY, options);
}

const service = axios.create({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

// request interceptor
service.interceptors.request.use(
  config => {
    // console.log('----axios----请求配置', JSON.stringify(config));
    if (config.url.indexOf("/v3/commons/auth/weixin-ajax") != -1) {
      //TODO: test4 由于微信只能在测试环境跑通, 所以授权暂时指定到test环境
      config.baseURL = WX_BIND_BASE_URL;
    } else {
      // set baseURL
      config.baseURL = config.url.startsWith('/v3') ? V3_BASE_URL : MIDDLE_BASE_URL;
    }

    config.headers = {
      'interact-token': sessionStorage.getItem('interact_token') || '',
      ...HEADERS,
      ...config.headers
    };

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

      if (typeof config.data === 'string') {
        config.data = (config.data && JSON.parse(config.data)) || {};
      }

      config.data = {
        ...COMMON_BODY,
        ...config.data
      };

      // 如果有 live_token 就不需要传 token
      if (config.data.live_token) {
        delete config.headers.token;
      }

      if (config.data && typeof config.data === 'object') {
        config.data = qs.stringify(config.data);
      }

      // get 请求处理通用请求体
      if (config.method == 'get') {
        config.params = {
          ...COMMON_BODY,
          ...config.params
        }
      }

    }

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
export { setBaseUrl, setRequestHeaders, setRequestBody, getPlatform };
