import axios from 'axios/dist/axios';

let TOKEN = '';
let BASE_URL = '';
let LIVETOKEN = '';
let HEADERS = {};

function setBaseUrl(url) {
  console.log('---BASE_URL----', url);
  BASE_URL = url;
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
    // console.log('----axios----请求配置', config);
    // set baseURL
    config.baseURL = BASE_URL;

    // 如果有 live_token 就不需要传 token
    if (TOKEN && !LIVETOKEN) {
      config.headers['token'] = TOKEN;
    }

    // live_token 放在 body 中传
    if (LIVETOKEN) {
      config.data = (config.data && JSON.parse(config.data)) || {};
      config.data = {
        live_token: LIVETOKEN,
        ...config.data
      };
      config.data = JSON.stringify(config.data);
    }

    config.headers = {
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
