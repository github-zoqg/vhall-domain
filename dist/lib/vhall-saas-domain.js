(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["vhall-sass-domain"] = {}));
})(this, (function (exports) { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _readOnlyError(name) {
    throw new TypeError("\"" + name + "\" is read-only");
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function useContextServer() {
    var state = {
      serverPool: {}
    };

    var set = function set(key, server) {
      var serverPool = state.serverPool;
      serverPool[key] = server;
    };

    var get = function get(key) {
      var serverPool = state.serverPool;
      return serverPool[key];
    };

    var show = function show() {
      var serverPool = state.serverPool;
      return _objectSpread2({}, serverPool);
    };

    var clear = function clear() {
      _readOnlyError("serverPool");
    };

    return {
      set: set,
      get: get,
      show: show,
      clear: clear
    };
  }

  var contextServer = useContextServer();

  function useMsgServer() {
    var state = {
      msgInstance: null
    };

    var init = function init() {
      if (!contextServer.get('roomInitGroupServer')) return;

      var _contextServer$get = contextServer.get('roomInitGroupServer'),
          roomInitGroupServer = _contextServer$get.state;

      return roomInitGroupServer.vhallSaasInstance.createChat().then(function (res) {
        state.msgInstance = res;
        return res;
      });
    };

    var $on = function $on(eventType, fn) {
      if (!state.msgInstance) return;
      state.msgInstance.$on(eventType, fn);
    };

    var $emit = function $emit(eventType, params) {
      if (!state.msgInstance) return;
      state.msgInstance.$emit(eventType, params);
    };

    var destroy = function destroy() {
      if (!state.msgInstance) return;
      state.msgInstance.destroy;
      state.msgInstance = null;
    };

    return {
      state: state,
      init: init,
      destroy: destroy,
      $on: $on,
      $emit: $emit
    };
  }

  (function (factory) {
    typeof define === 'function' && define.amd ? define(factory) : factory();
  })(function () {

    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);

        if (enumerableOnly) {
          symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
        }

        keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};

        if (i % 2) {
          ownKeys(Object(source), true).forEach(function (key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }

      return target;
    }

    function _typeof$1(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof$1 = function _typeof(obj) {
          return typeof obj;
        };
      } else {
        _typeof$1 = function _typeof(obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof$1(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      });
      if (superClass) _setPrototypeOf(subClass, superClass);
    }

    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
      };

      return _setPrototypeOf(o, p);
    }

    function _isNativeReflectConstruct() {
      if (typeof Reflect === "undefined" || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if (typeof Proxy === "function") return true;

      try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
        return true;
      } catch (e) {
        return false;
      }
    }

    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return self;
    }

    function _possibleConstructorReturn(self, call) {
      if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
      } else if (call !== void 0) {
        throw new TypeError("Derived constructors may only return object or undefined");
      }

      return _assertThisInitialized(self);
    }

    function _createSuper(Derived) {
      var hasNativeReflectConstruct = _isNativeReflectConstruct();

      return function _createSuperInternal() {
        var Super = _getPrototypeOf(Derived),
            result;

        if (hasNativeReflectConstruct) {
          var NewTarget = _getPrototypeOf(this).constructor;

          result = Reflect.construct(Super, arguments, NewTarget);
        } else {
          result = Super.apply(this, arguments);
        }

        return _possibleConstructorReturn(this, result);
      };
    }

    var mountSDK = function mountSDK(src) {
      return new Promise(function (resolve) {
        var node = document.createElement('script');
        document.head.appendChild(node);
        node.src = src;

        node.onload = function () {
          resolve();
        };
      });
    };
    /**
     * ajax请求 jsonp处理
     * 1.jsonp 请求格式
     *   $fetch({
     *      url:'',
     *      type: 'GET',
     *      jsonp: 'callback',
     *      data: {
     *        name: 123
     *      }
     *   })
     */


    var BUSE_URL = '';
    var TOKEN = '';
    var LIVETOKEN = '';
    var HEADERS = null;

    function setBaseUrl(url) {
      BUSE_URL = url;
    }

    function setToken(token, livetoken) {
      console.log(token, livetoken, 888);
      TOKEN = token;
      LIVETOKEN = livetoken;
    }

    function setRequestHeaders(options) {
      HEADERS = _objectSpread2({}, options);
    }

    function $fetch(options) {
      // if ("development" != 'development') {
      //
      // }
      options.url = BUSE_URL + options.url;
      console.log('接口环境', options.url);
      return new Promise(function (resolve, reject) {
        options = options || {};

        if (options.data) {
          if (LIVETOKEN) {
            options.data.live_token = LIVETOKEN;
          }

          options.data = formatParams(options.data);
        }

        options.dataType ? jsonp(options, resolve, reject) : json(options, resolve, reject);
      });
    } // JSON请求


    function json(params, success, fail) {
      var xhr = null; // interactToken = sessionStorage.getItem('interact-token') || '',
      // grayId = sessionStorage.getItem('grayId') || '',
      // vhallJSSDKUserInfo = localStorage.getItem('vhallJSSDKUserInfo') ? JSON.parse(localStorage.getItem('vhallJSSDKUserInfo')) : {},

      params.type = (params.type || 'GET').toUpperCase();

      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          var status = xhr.status;

          if (status >= 200 && status < 300) {
            var response = '';
            var type = xhr.getResponseHeader('Content-type');

            if (type.indexOf('xml') !== -1 && xhr.responseXML) {
              response = xhr.responseXML;
            } else if (type === 'application/json' || type === 'application/json;charset=UTF-8') {
              response = JSON.parse(xhr.responseText);
            } else {
              response = xhr.responseText;
            }

            success && success(response);
          } else {
            fail && fail(status);
          }
        }
      };

      if (params.type == 'GET') {
        if (params.data) {
          xhr.open(params.type, params.url + '?' + params.data, true);
        } else {
          xhr.open(params.type, params.url, true);
        }
      } else if (params.type == 'POST') {
        xhr.open(params.type, params.url, true);
      }

      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      if (!LIVETOKEN) {
        TOKEN && xhr.setRequestHeader('token', TOKEN);
      }

      if (HEADERS) {
        Object.getOwnPropertyNames(HEADERS).forEach(function (item) {
          xhr.setRequestHeader(item, HEADERS[item]);
        });
      } // if (params.headers && params.headers.activeType == 'new') {
      //     xhr.setRequestHeader('platform', 18)
      //     xhr.setRequestHeader('request-id', uuid())
      //     grayId && xhr.setRequestHeader('gray-id', grayId)
      //     interactToken && xhr.setRequestHeader('interact-token', interactToken)
      //     token && xhr.setRequestHeader('token', token)
      // }


      if (params.type == 'GET') {
        xhr.send(null);
      } else {
        xhr.send(params.data);
      }
    } // JSONP请求


    function jsonp(params, success, fail) {
      var callbackName = params.dataType;
      params['callback'] = callbackName;
      var script = document.createElement('script');
      script.type = "text/javascript";
      script.charset = "utf-8";
      document.body.appendChild(script); // 创建回调函数

      window[callbackName] = function (val) {
        document.body.removeChild(script);
        clearTimeout(script.timer);
        window[callbackName] = null;
        success && success(val);
      };

      script.src = "".concat(params.url, "?").concat(params.data, "&_=", 1594014089800); // 超时处理

      if (params.time) {
        script.timer = setTimeout(function () {
          window[callbackName] = null;
          head.removeChild(script);
          fail && fail('请求超时');
        }, parmas.time * 1000);
      }
    } // 格式化数据


    function formatParams(data) {
      var arr = [];

      if (data) {
        for (var item in data) {
          arr.push(encodeURIComponent(item) + '=' + encodeURIComponent(data[item]));
        }
      }

      return arr.join('&');
    } // 随机数


    var Store = /*#__PURE__*/function () {
      function Store() {
        _classCallCheck(this, Store);

        this.state = {};
      }

      _createClass(Store, [{
        key: "set",
        value: function set(key, value) {
          this.state[key] = value;
        }
      }, {
        key: "get",
        value: function get(key) {
          return this.state[key];
        }
      }]);

      return Store;
    }();

    var store = new Store();

    var getRoomInfo = function getRoomInfo(res) {
      var _data = res.data;
      return {
        webinar: {
          type: _data.webinar.type,
          id: _data.webinar.id
        },
        paasInfo: {
          channel_id: _data.interact.channel_id,
          inav_id: _data.interact.inav_id,
          paas_access_token: _data.interact.paas_access_token,
          paas_app_id: _data.interact.paas_app_id,
          room_id: _data.interact.room_id
        },
        userInfo: {
          avatar: _data.join_info.avatar,
          is_gag: _data.join_info.is_gag,
          is_kick: _data.join_info.is_kick,
          join_id: _data.join_info.join_id,
          nickname: _data.join_info.nickname,
          role_name: _data.join_info.role_name,
          third_party_user_id: _data.join_info.third_party_user_id
        },
        reportData: {
          guid: _data.report_data.guid,
          aid: _data.interact.room_id,
          report_extra: _data.report_data.report_extra
        }
      };
    };

    function getDefaultExportFromCjs(x) {
      return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var src = {
      exports: {}
    };

    (function (module, exports) {
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.isPlainObject = exports.clone = exports.recursive = exports.merge = exports.main = void 0;
      module.exports = exports = main;
      exports["default"] = main;

      function main() {
        var items = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          items[_i] = arguments[_i];
        }

        return merge.apply(void 0, items);
      }

      exports.main = main;
      main.clone = clone;
      main.isPlainObject = isPlainObject;
      main.recursive = recursive;

      function merge() {
        var items = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          items[_i] = arguments[_i];
        }

        return _merge(items[0] === true, false, items);
      }

      exports.merge = merge;

      function recursive() {
        var items = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          items[_i] = arguments[_i];
        }

        return _merge(items[0] === true, true, items);
      }

      exports.recursive = recursive;

      function clone(input) {
        if (Array.isArray(input)) {
          var output = [];

          for (var index = 0; index < input.length; ++index) {
            output.push(clone(input[index]));
          }

          return output;
        } else if (isPlainObject(input)) {
          var output = {};

          for (var index in input) {
            output[index] = clone(input[index]);
          }

          return output;
        } else {
          return input;
        }
      }

      exports.clone = clone;

      function isPlainObject(input) {
        return input && _typeof$1(input) === 'object' && !Array.isArray(input);
      }

      exports.isPlainObject = isPlainObject;

      function _recursiveMerge(base, extend) {
        if (!isPlainObject(base)) return extend;

        for (var key in extend) {
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
          base[key] = isPlainObject(base[key]) && isPlainObject(extend[key]) ? _recursiveMerge(base[key], extend[key]) : extend[key];
        }

        return base;
      }

      function _merge(isClone, isRecursive, items) {
        var result;
        if (isClone || !isPlainObject(result = items.shift())) result = {};

        for (var index = 0; index < items.length; ++index) {
          var item = items[index];
          if (!isPlainObject(item)) continue;

          for (var key in item) {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
            var value = isClone ? clone(item[key]) : item[key];
            result[key] = isRecursive ? _recursiveMerge(result[key], value) : value;
          }
        }

        return result;
      }
    })(src, src.exports);

    var merge = /*@__PURE__*/getDefaultExportFromCjs(src.exports);
    /**
     * 判断终端类型
     *
     * @export
     * @param {*} target
     * @returns
     */

    function isPc(target) {
      var userAgentInfo = navigator.userAgent;
      var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
      var flag = true;

      for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }

      return flag;
    }

    var initSendLive = function initSendLive(params) {
      var retParmams = {
        webinar_id: params.webinarId,
        live_token: params.live_token || '',
        nickname: params.nickname || '',
        email: params.email || '',
        biz_id: params.biz_id || ''
      };
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/live/init',
          type: 'GET',
          data: retParmams
        }).then(function (res) {
          resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 观看端初始化（标品）


    var initStandardReceiveLive = function initStandardReceiveLive(params) {
      var retParmams = {
        webinar_id: params.webinarId,
        visitor_id: params.visitor_id || '',
        record_id: params.record_id || '',
        refer: params.refer || '',
        biz_id: params.biz_id || ''
      };
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/watch/init',
          type: 'GET',
          data: retParmams
        }).then(function (res) {
          resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 观看端初始化（嵌入页）


    var initEmbeddedReceiveLive = function initEmbeddedReceiveLive(params) {
      var retParmams = {
        webinar_id: params.webinarId,
        visitor_id: params.visitor_id || '',
        record_id: params.record_id || '',
        email: params.email || '',
        nickname: params.nickname || '',
        k: params.k || '',
        state: params.state || '',
        refer: params.refer || '',
        sign: params.sign || '',
        ts: params.ts || '',
        biz_id: params.biz_id || ''
      };
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/watch/inline-init',
          type: 'GET',
          data: retParmams
        }).then(function (res) {
          resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 观看端初始化（SDK）


    var initSdkReceiveLive = function initSdkReceiveLive(params) {
      var retParmams = {
        webinar_id: params.webinarId,
        record_id: params.record_id || '',
        email: params.email || '',
        nickname: params.nickname || '',
        pass: params.pass || '',
        k: params.k || '',
        refer: params.refer || '',
        qrcode: params.qrcode || '',
        share_id: params.share_id || '',
        visitor_id: params.visitor_id || '',
        biz_id: params.biz_id || ''
      };
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/watch/sdk-init',
          type: 'GET',
          data: retParmams
        }).then(function (res) {
          resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 开始直播


    var startLive = function startLive(params) {
      var _store$get = store.get('roomInitData'),
          _store$get$webinar = _store$get.webinar,
          webinar = _store$get$webinar === void 0 ? {} : _store$get$webinar;

      var defaultParams = {
        webinar_id: webinar.id
      };
      var retParmams = merge.recursive({}, defaultParams, params);
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/live/start',
          type: 'POST',
          data: retParmams
        }).then(function (res) {
          return resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 结束直播


    var endLive = function endLive(params) {
      var _store$get2 = store.get('roomInitData'),
          _store$get2$webinar = _store$get2.webinar,
          webinar = _store$get2$webinar === void 0 ? {} : _store$get2$webinar;

      var defaultParams = {
        webinar_id: webinar.id
      };
      var retParmams = merge.recursive({}, defaultParams, params);
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/live/end',
          type: 'POST',
          data: retParmams
        }).then(function (res) {
          return resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 进入直播前检测


    var checkLive = function checkLive(params) {
      var _store$get3 = store.get('roomInitData'),
          _store$get3$webinar = _store$get3.webinar,
          webinar = _store$get3$webinar === void 0 ? {} : _store$get3$webinar;

      var defaultParams = {
        webinar_id: webinar.id
      };
      var retParmams = merge.recursive({}, defaultParams, params);
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/live/check',
          type: 'GET',
          data: retParmams
        }).then(function (res) {
          return resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 获取聊天服务链接参数


    var getChatInitOptions = function getChatInitOptions(params) {
      var _store$get4 = store.get('roomInitData'),
          _store$get4$webinar = _store$get4.webinar,
          webinar = _store$get4$webinar === void 0 ? {} : _store$get4$webinar;

      var defaultParams = {
        webinar_id: webinar.id
      };
      var retParmams = merge.recursive({}, defaultParams, params);
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/live/get-connect',
          type: 'GET',
          data: retParmams
        }).then(function (res) {
          return resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 心跳检测


    var liveHeartBeat = function liveHeartBeat(params) {
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/live/heartbeat',
          type: 'GET',
          data: params
        }).then(function (res) {
          return resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 获取live_token


    var getLiveToken = function getLiveToken(params) {
      var _store$get5 = store.get('roomInitData'),
          _store$get5$webinar = _store$get5.webinar,
          webinar = _store$get5$webinar === void 0 ? {} : _store$get5$webinar;

      var defaultParams = {
        webinar_id: webinar.id
      };
      var retParmams = merge.recursive({}, defaultParams, params);
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/live/get-live-token',
          type: 'GET',
          data: retParmams
        }).then(function (res) {
          return resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    }; // 获取推流地址


    var getStreamPushAddress = function getStreamPushAddress(params) {
      var _store$get6 = store.get('roomInitData'),
          _store$get6$webinar = _store$get6.webinar,
          webinar = _store$get6$webinar === void 0 ? {} : _store$get6$webinar;

      var defaultParams = {
        webinar_id: webinar.id
      };
      var retParmams = merge.recursive({}, defaultParams, params);
      return new Promise(function (resolve, reject) {
        $fetch({
          url: '/v3/webinars/live/get-stream-push-address',
          type: 'GET',
          data: retParmams
        }).then(function (res) {
          return resolve(res);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    };

    var live = {
      initSendLive: initSendLive,
      initStandardReceiveLive: initStandardReceiveLive,
      initEmbeddedReceiveLive: initEmbeddedReceiveLive,
      initSdkReceiveLive: initSdkReceiveLive,
      startLive: startLive,
      endLive: endLive,
      checkLive: checkLive,
      getChatInitOptions: getChatInitOptions,
      liveHeartBeat: liveHeartBeat,
      getLiveToken: getLiveToken,
      getStreamPushAddress: getStreamPushAddress
    };

    var RequestApi = function RequestApi() {
      _classCallCheck(this, RequestApi);

      this.live = live;
    };

    var requestApi = new RequestApi();

    var BaseModule = /*#__PURE__*/function () {
      function BaseModule() {
        _classCallCheck(this, BaseModule);

        _defineProperty(this, "handlers", {});
      }

      _createClass(BaseModule, [{
        key: "$on",
        value: // 事件添加方法，参数有事件名和事件方法
        function $on(type, handler) {
          // 首先判断handlers内有没有type事件容器，没有则创建一个新数组容器
          if (!(type in this.handlers)) {
            this.handlers[type] = [];
          } // 将事件存入


          this.handlers[type].push(handler);
        } // 触发事件两个参数（事件名，参数）

      }, {
        key: "$emit",
        value: function $emit(type) {
          for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
          } // 若没有注册该事件则抛出错误


          if (!(type in this.handlers)) {
            return new Error('未注册该事件');
          } // 便利触发


          this.handlers[type].forEach(function (handler) {
            handler.apply(void 0, params);
          });
        } // 事件移除参数（事件名，删除的事件，若无第二个参数则删除该事件的订阅和发布）

      }, {
        key: "$off",
        value: function $off(type, handler) {
          // 无效事件抛出
          if (!(type in this.handlers)) {
            return new Error('无效事件');
          }

          if (!handler) {
            // 直接移除事件
            delete this.handlers[type];
          } else {
            var idx = this.handlers[type].findIndex(function (ele) {
              return ele === handler;
            }); // 抛出异常事件

            if (idx === undefined) {
              return new Error('无该绑定事件');
            } // 移除事件


            this.handlers[type].splice(idx, 1);

            if (this.handlers[type].length === 0) {
              delete this.handlers[type];
            }
          }
        }
      }]);

      return BaseModule;
    }();

    var ChatModule = /*#__PURE__*/function (_BaseModule) {
      _inherits(ChatModule, _BaseModule);

      var _super = _createSuper(ChatModule);

      function ChatModule() {
        _classCallCheck(this, ChatModule);

        return _super.call(this);
      }
      /**
       * 初始化聊天 SDK
       * @param {Object} customOptions 用户自定义参数
       */


      _createClass(ChatModule, [{
        key: "init",
        value: function init() {
          var _this = this;

          var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var defaultOptions = this.initDefaultOptions();
          var options = merge.recursive({}, defaultOptions, customOptions);
          return new Promise(function (resolve, reject) {
            VhallChat.createInstance(options, function (event) {
              _this.instance = event.message;

              _this.listenEvents();

              resolve(event);
            }, reject);
          });
        }
        /**
         * 销毁聊天实例
         */

      }, {
        key: "destroy",
        value: function destroy() {
          this.instance.destroy();
          this.instance = null;
        }
        /**
         * 获取实例化聊天的默认参数
         * @returns {Object} defaultOptions 默认参数
         */

      }, {
        key: "initDefaultOptions",
        value: function initDefaultOptions() {
          var isPcClient = isPc();

          var _store$get = store.get('roomInitData'),
              paasInfo = _store$get.paasInfo,
              userInfo = _store$get.userInfo;

          var defaultContext = {
            nick_name: userInfo.nickname,
            avatar: userInfo.avatar,
            role_name: userInfo.role_name,
            device_type: isPcClient ? '2' : '1',
            // 设备类型 1手机端 2PC 0未检测
            device_status: '0',
            // 设备状态  0未检测 1可以上麦 2不可以上麦
            is_banned: userInfo.is_gag,
            // 是否禁言 1是 0否
            watch_type: isPcClient ? '1' : '2',
            // 1 pc  2 h5  3 app  4 是客户端
            is_kick: userInfo.is_kick
          };
          var defaultOptions = {
            context: defaultContext,
            appId: paasInfo.paas_app_id,
            accountId: userInfo.third_party_user_id,
            channelId: paasInfo.channel_id,
            token: paasInfo.paas_access_token,
            hide: false // 是否隐身

          };
          return defaultOptions;
        }
        /**
         * 注册聊天事件
         */

      }, {
        key: "listenEvents",
        value: function listenEvents() {
          var _this2 = this;

          this.instance.onRoomMsg(function (msg) {
            // 房间消息（不对外）
            _this2.$emit('ROOM_MSG', msg);
          });
          this.instance.onChat(function (msg) {
            // 聊天消息
            _this2.$emit('CHAT', msg);
          });
          this.instance.onCustomMsg(function (msg) {
            // 自定义消息
            _this2.$emit('CUSTOM_MSG', msg);
          });
          this.instance.onOffLine(function () {
            // 连接断开
            _this2.$emit('OFFLINE');
          });
          this.instance.onOnLine(function () {
            // 连接连接上了
            _this2.$emit('ONLINE');
          });
          this.instance.onDocMsg(function (msg) {
            // 文档消息（不对外）
            _this2.$emit('DOC_MSG');
          });
          this.instance.join(function (msg) {
            // 用户加入
            _this2.$emit('JOIN', msg);
          });
          this.instance.leave(function (msg) {
            // 用户离开
            _this2.$emit('LEFT', msg);
          });
        }
        /**
         * 发送聊天消息
         * @param {String} data 消息体
         * @returns {Promise}
         */

      }, {
        key: "emitTextChat",
        value: function emitTextChat(data) {
          var _this3 = this;

          return new Promise(function (resolve, reject) {
            _this3.instance.emitChat(data, resolve, reject);
          });
        }
        /**
         * 发送自定义消息
         * @param {String} data 消息体
         * @returns {Promise}
         */

      }, {
        key: "emitCustomChat",
        value: function emitCustomChat(data) {
          return this.instance.emitCustomMsg(data);
        }
        /**
         * 发送文档消息（不对外）
         * @param {Object} data 消息体
         * @returns {Promise}
         */

      }, {
        key: "emitDocMsg",
        value: function emitDocMsg(data) {
          return this.instance.emitDocMsg(data);
        }
        /**
         * 发送房间消息（不对外）
         * @param {Object} data 消息体
         * @returns {Promise}
         */

      }, {
        key: "emitRoomMsg",
        value: function emitRoomMsg(data) {
          var retData = JSON.stringify(data);
          return this.instance.emitRoomMsg(retData);
        }
        /**
         * 获取用户列表信息
         * @param {Object} params 分页参数
         * @returns {Promise}
         */

      }, {
        key: "getUserListInfo",
        value: function getUserListInfo(params) {
          var _this4 = this;

          var defaultParams = {
            currPage: 1,
            pageSize: 10
          };
          var retParams = merge.recursive({}, defaultParams, params);
          return new Promise(function (resolve, reject) {
            _this4.instance.getUserListInfo(retParams, resolve, reject);
          });
        }
        /**
         * 禁言某个用户
         * @param {Object} accountId 用户 id 
         * @returns {Promise}
         */

      }, {
        key: "setUserDisable",
        value: function setUserDisable(accountId) {
          return new Peomise(function (resolve, reject) {
            var param = {
              type: VhallChat.TYPE_DISABLE,
              targetId: accountId
            };
            chat.setDisable(param, resolve, reject);
          });
        }
        /**
         * 取消禁言某个用户
         * @param {Object} accountId 用户 id 
         * @returns {Promise}
         */

      }, {
        key: "setUserPermit",
        value: function setUserPermit(accountId) {
          return new Peomise(function (resolve, reject) {
            var param = {
              type: VhallChat.TYPE_PERMIT,
              targetId: accountId
            };
            chat.setDisable(param, resolve, reject);
          });
        }
        /**
         * 禁言频道
         * @returns {Promise}
         */

      }, {
        key: "setChannelDisable",
        value: function setChannelDisable() {
          return new Peomise(function (resolve, reject) {
            var param = {
              type: VhallChat.TYPE_DISABLE_ALL
            };
            chat.setDisable(param, resolve, reject);
          });
        }
        /**
         * 取消禁言频道
         * @returns {Promise}
         */

      }, {
        key: "setChannelPermit",
        value: function setChannelPermit() {
          return new Peomise(function (resolve, reject) {
            var param = {
              type: VhallChat.TYPE_PERMIT_ALL
            };
            chat.setDisable(param, resolve, reject);
          });
        }
        /**
         * 获取历史聊天消息
         * @returns {Promise}
         */

      }, {
        key: "getHistoryList",
        value: function getHistoryList(params) {
          var _this5 = this;

          var defaultParams = {
            currPage: 1,
            pageSize: 200
          };
          var retParams = merge.recursive({}, defaultParams, params);
          return new Promise(function (resolve, reject) {
            _this5.instance.getHistoryList(retParams, resolve, reject);
          });
        }
        /**
         * 获取房间在线信息
         * @param {Object} params 分页参数
         * @returns {Promise}
         */

      }, {
        key: "getOnlineInfo",
        value: function getOnlineInfo(params) {
          var _this6 = this;

          var defaultParams = {
            currPage: 1,
            pageSize: 200
          };
          var retParams = merge.recursive({}, defaultParams, params);
          return new Promise(function (resolve, reject) {
            _this6.instance.getOnlineInfo(retParams, resolve, reject);
          });
        }
      }]);

      return ChatModule;
    }(BaseModule);

    var DocModule = /*#__PURE__*/function (_BaseModule) {
      _inherits(DocModule, _BaseModule);

      _createSuper(DocModule);

      function DocModule() {
        var _this;

        _classCallCheck(this, DocModule);

        _this.instance = null;
        _this.children = [];
        return _possibleConstructorReturn(_this);
      }

      _createClass(DocModule, [{
        key: "init",
        value: function init() {
          var _this2 = this;

          var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var defaultOptions = this.initDefaultOptions();
          var options = merge.recursive({}, defaultOptions, customOptions);

          var onSuccess = function onSuccess() {
            console.log('saasSDK文档初始化成功');

            _this2.$emit(CONST_VAL.DOC_SDK_READ, _this2.instance);
          };

          var onFail = function onFail() {
            console.error('saasSDK文档初始化失败', failed.msg);

            _this2.$emit(CONST_VAL.DOC_SDK_ERROR, failed.msg);
          };

          this.instance = VHDocSDK.createInstance(options, onSuccess, onFail);
          this.listenEvents();
        }
      }, {
        key: "initDefaultOptions",
        value: function initDefaultOptions() {
          isPc();

          var _store$get = store.get('roomInitData'),
              paasInfo = _store$get.paasInfo,
              userInfo = _store$get.userInfo;

          var defaultOptions = {
            accountId: userInfo.third_party_user_id,
            roomId: paasInfo.room_id,
            channelId: paasInfo.channel_id,
            // 频道id 必须
            appId: paasInfo.paas_app_id,
            // appId 必须
            role: userInfo.role_name,
            // 角色 必须
            isVod: false,
            // 是否是回放 必须
            client: window.VHDocSDK.Client.PC_WEB,
            // 客户端类型
            token: this.token
          };
          return defaultOptions;
        }
      }, {
        key: "listenEvents",
        value: function listenEvents() {
          var _this3 = this; // 创建容器事件


          this.instance.on(VHDocSDK.Event.CREATE_CONTAINER, function (data) {}); // 选择容器

          this.instance.on(VHDocSDK.Event.SELECT_CONTAINER, function (data) {}); // 当前文档加载完成

          this.instance.on(VHDocSDK.Event.DOCUMENT_LOAD_COMPLETE, function (data) {}); // 开关变换

          this.instance.on(VHDocSDK.Event.SWITCH_CHANGE, function (status) {
            _this3.$emit('SWITCH_CHANGE', status);
          }); // 删除容器时候触发的事件

          this.instance.on(VHDocSDK.Event.DELETE_CONTAINER, function (data) {
            _this3.$emit('DELETE_CONTAINER');
          }); // 所有的文档准备完成

          this.instance.on(VHDocSDK.Event.ALL_COMPLETE, function () {
            _this3.$emit('ALL_COMPLETE');
          }); // 正在演示的文档被删除(文档不存在)

          this.instance.on(VHDocSDK.Event.DOCUMENT_NOT_EXIT, function (_ref) {
            var cid = _ref.cid,
                docId = _ref.docId;

            _this3.$emit('DOCUMENT_NOT_EXIT', {
              cid: cid,
              docId: docId
            });
          }); // 翻页事件

          this.instance.on(VHDocSDK.Event.PAGE_CHANGE, function (event) {
            _this3.$emit('PAGE_CHANGE', event);
          }); // 回放文件加载完成

          this.instance.on(VHDocSDK.Event.VOD_CUEPOINT_LOAD_COMPLETE, function (event) {
            _this3.$emit('VOD_CUEPOINT_LOAD_COMPLETE', event);
          }); // ppt文档加载完毕

          this.instance.on(VHDocSDK.Event.PLAYBACKCOMPLETE, function (event) {
            _this3.$emit('PLAYBACKCOMPLETE', event);
          });
        }
      }, {
        key: "destroy",
        value: function destroy() {
          if (!this.instance) return;
          this.instance.destroy();
          this.instance = null;
        }
      }, {
        key: "createBoard",
        value: function createBoard(customOptions) {
          var elId = this.instance.createUUID('board');
          var defaultOptions = {
            elId: elId,
            // div 容器 必须
            width: 200,
            // div 宽度，像素单位，数值型不带px 必须
            height: 200,
            // div 高度，像素单位，数值型不带px 必须
            backgroundColor: 'RGBA',
            // 背景颜色， 支持RGB 与 RGBA， 如果全透明，舞台背景色与网页背景色相同，如 ‘#FF0000’或 ‘#FF000000’ 必须
            noDispatch: false,
            // 非必填，默认false，是否推送消息到远端，false为推送，true为不推送，加载远程文档时该字段应为true
            option: {
              // 非必填，画笔预设选项
              graphicType: VHDocSDK.GRAPHIC.PEN,
              // 选项请参考画笔预设值,
              stroke: '#000',
              // 颜色值
              strokeWidth: 4 // 正数 Number

            }
          };
          var options = merge.recursive({}, defaultOptions, customOptions);
          this.instance.createBoard(options);
        }
      }, {
        key: "creatDocument",
        value: function creatDocument(customOptions) {
          var _defaultOptions;

          var elId = sdk.createUUID('document'); // 容器id，必须用此方法创建，文档传入document，返回唯一id

          var defaultOptions = (_defaultOptions = {
            id: customOptions.id,
            docId: customOptions.docId,
            elId: elId,
            // div 容器 必须
            width: 200,
            // div 宽度，像素单位，数值型不带px 必须
            height: 200
          }, _defineProperty(_defaultOptions, "docId", 'yyy'), _defineProperty(_defaultOptions, "noDispatch", false), _defineProperty(_defaultOptions, "option", {
            // 非必填，画笔预设选项
            graphicType: VHDocSDK.GRAPHIC.PEN,
            // 选项请参考画笔预设值,
            stroke: '#000',
            // 颜色值
            strokeWidth: 4 // 正数 Number

          }), _defaultOptions);
          merge.recursive({}, defaultOptions, customOptions);
          sdk.createDocument(opts); // 返回promise
        }
      }, {
        key: "selectContainer",
        value: function selectContainer(id) {
          this.instance.selectContainer({
            id: id
          });
          this.currentCid = id;
        }
        /**
         * 
         * @param {*} child is cid-ret
         */

      }, {
        key: "addChild",
        value: function addChild(child) {
          this.children.push(child);
        }
      }, {
        key: "zoomIn",
        value: function zoomIn() {
          this.instance.zoomIn();
        }
      }, {
        key: "zoomOut",
        value: function zoomOut() {
          this.instance.zoomOut();
        }
      }, {
        key: "zoomReset",
        value: function zoomReset() {
          this.instance.zoomReset();
        }
      }, {
        key: "move",
        value: function move() {
          this.instance.move();
        }
      }, {
        key: "prevStep",
        value: function prevStep() {
          this.instance.prevStep();
        }
      }, {
        key: "nextStep",
        value: function nextStep() {
          this.instance.nextStep();
        }
      }]);

      return DocModule;
    }(BaseModule);

    var InteractiveModule = /*#__PURE__*/function (_BaseModule) {
      _inherits(InteractiveModule, _BaseModule);

      var _super = _createSuper(InteractiveModule);

      function InteractiveModule(customOptions) {
        _classCallCheck(this, InteractiveModule);

        return _super.call(this, customOptions);
      }
      /**
       * 初始化互动sdk
       * @param {Object} customOptions 
       * @param {*} successCb 
       * @param {*} failCb 
       * 
       */


      _createClass(InteractiveModule, [{
        key: "init",
        value: function init() {
          var _this = this;

          var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var successCb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
          var failCb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
          console.log('customoptions', customOptions);
          console.log('store', store);
          var defaultOptions = {
            appId: store.get('roomInitData').paasInfo.paas_app_id,
            // 互动应用ID，必填
            inavId: store.get('roomInitData').paasInfo.inav_id,
            // 互动房间ID，必填
            roomId: store.get('roomInitData').paasInfo.room_id,
            // 如需开启旁路，必填。
            accountId: store.get('roomInitData').userInfo.third_party_user_id,
            // 第三方用户ID，必填
            token: store.get('roomInitData').paasInfo.paas_access_token,
            // access_token，必填
            mode: VhallRTC.MODE_RTC,
            //应用场景模式，选填，可选值参考下文【应用场景类型】。支持版本：2.3.1及以上。
            role: VhallRTC.ROLE_HOST,
            //用户角色，选填，可选值参考下文【互动参会角色】。当mode为rtc模式时，不需要配置role。支持版本：2.3.1及以上。
            attributes: '',
            // String 类型
            autoStartBroadcast: store.get('roomInitData').userInfo.role_name == 1,
            // 是否开启自动旁路 Boolean 类型   主持人默认开启true v2.3.5版本以上可用
            broadcastConfig: store.get('roomInitData').userInfo.role_name == 1 ? {
              layout: customOptions.layout || VhallRTC.CANVAS_LAYOUT_PATTERN_FLOAT_6_5D,
              // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
              profile: customOptions.profile || VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1,
              // 旁路直播视频质量参数
              paneAspectRatio: VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9,
              //旁路混流窗格指定高宽比。  v2.3.2及以上
              border: customOptions.border || {
                // 旁路边框属性
                width: 2,
                color: '0x666666'
              }
            } : {} // 自动旁路   开启旁路直播方法所需参数

          };
          var options = merge.recursive({}, defaultOptions, customOptions);
          console.log("optionssssssssssssssssssssssssssss", options);
          return new Promise(function (resolve, reject) {
            var onSuccess = function onSuccess(event) {
              _this.instance = event.vhallrtc;

              _this.listenEvents();

              console.log('init interactive sdk success:', event);
              successCb(event);
              resolve(event);
            };

            var onFail = function onFail(event) {
              console.log('fail:', event);
              failCb(event);
              reject(event);
            };

            VhallRTC.createInstance(options, onSuccess, onFail);
          });
        }
      }, {
        key: "listenEvents",
        value: function listenEvents() {
          var _this2 = this;

          this.instance.on(VhallRTC.EVENT_REMOTESTREAM_ADD, function (e) {
            // 远端流加入事件
            _this2.$emit('interactive_REMOTESTREAM_ADD', e);
          });
          this.instance.on(VhallRTC.EVENT_REMOTESTREAM_REMOVED, function (e) {
            // 远端流离开事件
            _this2.$emit('interactive_REMOTESTREAM_REMOVED', e);
          });
          this.instance.on(VhallRTC.EVENT_ROOM_EXCDISCONNECTED, function (e) {
            // 房间信令异常断开事件
            _this2.$emit('interactive_ROOM_EXCDISCONNECTED', e);
          });
          this.instance.on(VhallRTC.EVENT_REMOTESTREAM_MUTE, function (e) {
            // 远端流音视频状态改变事件
            _this2.$emit('interactive_REMOTESTREAM_MUTE', e);
          });
          this.instance.on(VhallRTC.EVENT_REMOTESTREAM_FAILED, function (e) {
            // 本地推流或订阅远端流异常断开事件
            _this2.$emit('interactive_REMOTESTREAM_FAILED', e);
          });
          this.instance.on(VhallRTC.EVENT_STREAM_END, function (e) {
            // 本地流采集停止事件(处理拔出设备和桌面共享停止时)
            _this2.$emit('interactive_STREAM_END', e);
          });
          this.instance.on(VhallRTC.EVENT_STREAM_STUNK, function (e) {
            // 本地流视频发送帧率异常事件
            _this2.$emit('interactive_STREAM_STUNK', e);
          });
          this.instance.on(VhallRTC.EVENT_DEVICE_CHANGE, function (e) {
            // 新增设备或移除设备时触发
            _this2.$emit('interactive_DEVICE_CHANGE', e);
          });
        }
        /**
         * 销毁互动sdk
         * @returns -- 销毁互动sdk
         */

      }, {
        key: "destroyInit",
        value: function destroyInit() {
          var _this3 = this;

          return new Promise(function (resolve, reject) {
            _this3.instance.destroyInstance({}).then(function () {
              resolve();
              _this3.instance = null;
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 创建本地流
         * @param obt {Object} - sdk init stream base info config
         * @return {Promise} - 创建成功后的promise 回调
         *
         */

      }, {
        key: "createLocalStream",
        value: function createLocalStream() {
          var _this4 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            _this4.instance.createStream(options).then(function (data) {
              resolve(data.streamId);
            })["catch"](function (error) {
              if (store.get('roomInitData').userInfo.role_name != 1) {
                //上麦人员无法创建本地流上麦，向外抛出信息
                var toSpeakInfo = _objectSpread2({
                  roleName: store.get('roomInitData').userInfo.role_name,
                  accountId: store.get('roomInitData').userInfo.third_party_user_id,
                  nickName: store.get('roomInitData').userInfo.nickname
                }, error);

                reject(toSpeakInfo);
              } else {
                reject(error);
              }
            });
          });
        }
        /**
         * 创建摄像头视频流
         * @param obt {Object} - sdk init stream base info config  videoNode: 容器 audioDevice: 音频的Id videoDevice:视频的设备Id profile:视频推流的质量
         * @return {Promise} - 创建成功后的promise 回调
         *
         */

      }, {
        key: "createLocalVideoStream",
        value: function createLocalVideoStream() {
          var _this5 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return new Promise(function (resolve, reject) {
            var defaultOptions = {
              videoNode: options.videoNode,
              // 必填，传入本地视频显示容器ID
              audio: true,
              // 选填，是否采集音频设备，默认为true
              video: true,
              // 选填，是否采集视频设备，默认为true
              audioDevice: options.audioDevice,
              // 选填，指定的音频设备id，默认为系统缺省
              videoDevice: options.videoDevice,
              // 选填，指定的视频设备id，默认为系统缺省
              profile: VhallRTC[options.profile] || VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H,
              // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
              streamType: 2,
              //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。
              attributes: JSON.stringify({
                roleName: store.get('roomInitData').userInfo.role_name,
                accountId: store.get('roomInitData').userInfo.third_party_user_id,
                nickName: store.get('roomInitData').userInfo.nickname
              }) //选填，自定义信息，支持字符串类型

            };
            var params = merge.recursive({}, defaultOptions, addConfig);
            console.log('pass params::', params);

            _this5.instance.createStream(params).then(function (data) {
              resolve(data.streamId);
            })["catch"](function (error) {
              if (store.get('roomInitData').userInfo.role_name != 1) {
                //上麦人员无法创建本地流上麦，向外抛出信息
                var toSpeakInfo = _objectSpread2({
                  roleName: store.get('roomInfo').roleName,
                  accountId: store.get('roomInfo').accountId,
                  nickName: store.get('roomInfo').nickName
                }, error);

                reject(toSpeakInfo);
              } else {
                reject(error);
              }
            });
          });
        }
        /**
         * 创建桌面共享流
         * @param obt {Object} - sdk init stream base info config  videoNode: 容器 speaker: 是否采集扬声器 profile: 视频的质量 addConfig: 扩展配置项
         * @return {Promise} - 创建成功后的promise 回调
         *
         */

      }, {
        key: "createLocaldesktopStream",
        value: function createLocaldesktopStream() {
          var _this6 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return new Promise(function (resolve, reject) {
            var defaultOptions = {
              videoNode: options.videoNode,
              // 必填，传入本地视频显示容器ID
              screen: true,
              speaker: options.speaker || false,
              // 桌面共享时是否分享桌面音频(如为true，则chrome浏览器弹框左下角将显示“分享音频”选框)，默认为false
              profile: options.profile || VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H,
              // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
              streamType: 3,
              //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。
              attributes: JSON.stringify({
                roleName: store.get('roomInitData').userInfo.role_name,
                accountId: store.get('roomInitData').userInfo.third_party_user_id,
                nickName: store.get('roomInitData').userInfo.nickname
              }) //选填，自定义信息，支持字符串类型

            };
            var params = merge.recursive({}, defaultOptions, addConfig);

            _this6.instance.createStream(params).then(function (data) {
              resolve(data.streamId);
            })["catch"](function (error) {
              if (store.get('roomInitData').userInfo.role_name != 1) {
                //上麦人员无法创建本地流上麦，向外抛出信息
                var toSpeakInfo = _objectSpread2({
                  roleName: store.get('roomInitData').userInfo.role_name,
                  accountId: store.get('roomInitData').userInfo.third_party_user_id,
                  nickName: store.get('roomInitData').userInfo.nickname
                }, error);

                reject(toSpeakInfo);
              } else {
                reject(error);
              }
            });
          });
        }
        /**
         * 创建本地音频流
         * @param obt {Object} - sdk init stream base info config  videoNode: 容器 audioDevice: 音频Id addConfig: 扩展配置项
         * @return {Promise} - 创建成功后的promise 回调
         *
         */

      }, {
        key: "createLocalAudioStream",
        value: function createLocalAudioStream() {
          var _this7 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return new Promise(function (resolve, reject) {
            var defaultOptions = {
              videoNode: options.videoNode,
              // 必填，传入本地视频显示容器ID
              audio: true,
              // 选填，是否采集音频设备，默认为true
              video: false,
              // 选填，是否采集视频设备，默认为true
              audioDevice: options.audioDevice,
              // 选填，指定的音频设备id，默认为系统缺省
              showControls: false,
              // 选填，是否开启视频原生控制条，默认为false
              attributes: JSON.stringify({
                account_id: store.get('roomInfo').accountId,
                nick_name: store.get('roomInfo').nickName,
                role_name: store.get('roomInfo').roleName
              }),
              //选填，自定义信息，支持字符串类型
              streamType: 0 //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。

            };
            var params = merge.recursive({}, defaultOptions, addConfig);

            _this7.instance.createStream(params).then(function (data) {
              resolve(data.streamId);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 创建图片推流
         * @param obt {Object} - sdk init stream base info config  videoNode: 容器 videoTrack: MediaStreamTrack对象,采集图像 addConfig: 扩展配置项
         * @return {Promise} - 创建成功后的promise 回调
         *
         */

      }, {
        key: "createLocalPhotoStream",
        value: function createLocalPhotoStream() {
          var _this8 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return new Promise(function (resolve, reject) {
            var defaultOptions = {
              videoNode: options.videoNode,
              // 传入本地视频显示容器，必填
              audio: true,
              video: true,
              //如参会者没有摄像头，则传入false
              videoTrack: options.videoTrack //MediaStreamTrack对象

            };
            var params = merge.recursive({}, defaultOptions, addConfig);

            _this8.instance.createStream(params).then(function (data) {
              resolve(data.streamId);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 销毁本地流
         * @param {String} streamId -- 要销毁的流Id
         * @returns 
         */

      }, {
        key: "destroyStream",
        value: function destroyStream() {
          var _this9 = this;

          var streamId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          return new Promise(function (resolve, reject) {
            _this9.instance.destroyStream({
              streamId: streamId
            }).then(function () {
              resolve();
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 推送本地流到远端
         * @param {Object} options publish stream base info config  streamId：要推的流Id，accountId:用户Id
         * @return {Promise} - 推流成功后的promise 回调
         */

      }, {
        key: "publishStream",
        value: function publishStream() {
          var _this10 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            _this10.instance.publish({
              streamId: options.streamId,
              accountId: options.accountId
            }).then(function (data) {
              resolve(data);
            })["catch"](function (errInfo) {
              reject(errInfo);
            });
          });
        }
        /**
         * 取消推送到远端的流
         * @param {String} streamId 要取消推的流Id
         * @returns {Promise} - 取消推流成功后的promise 回调
        */

      }, {
        key: "unpublishStream",
        value: function unpublishStream() {
          var _this11 = this;

          var streamId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          return new Promise(function (resolve, reject) {
            _this11.instance.unpublish({
              streamId: streamId
            }).then(function () {
              resolve();
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 订阅远端流
         * @param {Object} options -- streamId:订阅的流id videoNode: 页面显示的容器 mute: 远端流的音视频 dual: 大小流 0小流 1大流
         * @returns {Promise} - 订阅成功后的promise 回调
         */

      }, {
        key: "subscribeStream",
        value: function subscribeStream() {
          var _this12 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            var defaultOptions = {
              videoNode: options.videoNode,
              // 传入本地视频显示容器，必填
              streamId: options.streamId,
              mute: {
                // 选填，订阅成功后立即mute远端流
                audio: options.mute.audio || false,
                // 是否关闭音频，默认false
                video: options.mute.audio || false // 是否关闭视频，默认false

              },
              dual: options.dual || 1 // 双流订阅选项， 0为小流， 1为大流(默认)

            };
            var params = merge.recursive({}, defaultOptions, addConfig);

            _this12.instance.subscribe(params).then(function (data) {
              resolve(data);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 取消订阅远端流
         * @param {String} streamId -- 要取消订阅的流Id 
         * @returns {Promise} - 取消订阅成功后的promise 回调
         */

      }, {
        key: "unSubscribeStream",
        value: function unSubscribeStream() {
          var _this13 = this;

          var streamId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          return new Promise(function (resolve, reject) {
            _this13.instance.unsubscribe({
              streamId: streamId
            }).then(function (data) {
              resolve(data);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 设置大小流
         * @param {Object} options streamId: 需要设置的流Id  dual: 0为小流 1为大流
         * @returns {Promise} - 设置订阅大小流成功后的promise回调
         */

      }, {
        key: "setDual",
        value: function setDual() {
          var _this14 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            var params = {
              streamId: options.streamId,
              dual: options.dual
            };

            _this14.instance.setDual(params).then(function (data) {
              resolve(data);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 改变视频的禁用和启用
         * @param {Object} options streamId: 对哪一路流进行操作的流Id  isMute: true为禁用，false为启用
         * @returns {Promise} - 改变视频的禁用与开启后的promise 回调
         */

      }, {
        key: "muteVideo",
        value: function muteVideo() {
          var _this15 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            var params = {
              streamId: options.streamId,
              isMute: options.isMute
            };

            _this15.instance.muteVideo(params).then(function (data) {
              resolve(data);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 改变音频的禁用和启用
         * @param {Object} options streamId: 对哪一路流进行操作的流Id isMute: true为禁用，false为启用
         * @returns {Promise} - 改变音频的禁用与开启后的promise 回调
         */

      }, {
        key: "muteAudio",
        value: function muteAudio() {
          var _this16 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            var params = {
              streamId: options.streamId,
              isMute: options.isMute
            };

            _this16.instance.muteAudio(params).then(function (data) {
              resolve(data);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 开启旁路
         * @param {Object} options --  layout: 旁路布局  profile: 旁路直播视频质量参数 paneAspectRatio:旁路混流窗格指定高宽比 border: 旁路边框属性
         * @returns {Promise} - 开启旁路后的promise回调
         */

      }, {
        key: "startBroadCast",
        value: function startBroadCast() {
          var _this17 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return new Promise(function (resolve, reject) {
            var defaultOptions = {
              layout: options.layout || VhallRTC.CANVAS_LAYOUT_PATTERN_FLOAT_6_5D,
              // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
              profile: options.profile || VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1,
              // 旁路直播视频质量参数
              paneAspectRatio: VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9,
              //旁路混流窗格指定高宽比。  v2.3.2及以上
              border: options.border || {
                // 旁路边框属性
                width: 2,
                color: '0x666666'
              }
            };
            var params = merge.recursive({}, defaultOptions, addConfig);

            _this17.instance.startBroadCast(params).then(function () {
              resolve();
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 停止旁路
         * @returns {Promise} - 停止旁路后的promise回调
         */

      }, {
        key: "stopBroadCast",
        value: function stopBroadCast() {
          var _this18 = this;

          return new Promise(function (resolve, reject) {
            _this18.instance.stopBroadCast().then(function () {
              resolve();
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 动态配置指定旁路布局模板
         * @param {Object} options --  layout: 指定旁路布局模板
         * @returns {Promise} - 动态配置指定旁路布局模板的promise回调
         */

      }, {
        key: "setBroadCastLayout",
        value: function setBroadCastLayout() {
          var _this19 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            _this19.instance.setBroadCastLayout({
              layout: options.layout || VhallRTC.CANVAS_LAYOUT_PATTERN_FLOAT_6_5D
            }).then(function () {
              resolve();
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 配置旁路布局自适应模式
         * @param {Object} options --  layout: 指定旁路布局模板
         * @returns {Promise} - 配置旁路布局自适应模式的promise回调
         */

      }, {
        key: "setBroadCastAdaptiveLayoutMode",
        value: function setBroadCastAdaptiveLayoutMode() {
          var _this20 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            _this20.instance.setBroadCastAdaptiveLayoutMode({
              adaptiveLayoutMode: options.adaptiveLayoutMode || VhallRTC.CANVAS_ADAPTIVE_LAYOUT_GRID_MODE
            }).then(function () {
              resolve();
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 动态配置旁路主屏
         * @param {String} mainScreenStreamId -- 将哪路流设置成主屏的流Id
         * @returns {Promise} - 动态配置旁路主屏的promise回调
         */

      }, {
        key: "setBroadCastScreen",
        value: function setBroadCastScreen() {
          var _this21 = this;

          var mainScreenStreamId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          return new Promise(function (resolve, reject) {
            _this21.instance.setBroadCastScreen({
              mainScreenStreamId: mainScreenStreamId
            }).then(function () {
              resolve();
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取全部音视频列表
         * @returns {Promise} - 获取全部音视频列表的promise回调
         */

      }, {
        key: "getDevices",
        value: function getDevices() {
          var _this22 = this;

          return new Promise(function (resolve, reject) {
            _this22.instance.getDevices().then(function (devices) {
              resolve(devices);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取摄像头列表
         * @returns {Promise} - 获取摄像头列表的promise回调
         */

      }, {
        key: "getCameras",
        value: function getCameras() {
          var _this23 = this;

          return new Promise(function (resolve, reject) {
            _this23.instance.getCameras().then(function (devices) {
              resolve(devices);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取麦克风列表
         * @returns {Promise} - 获取麦克风列表的promise回调
         */

      }, {
        key: "getMicrophones",
        value: function getMicrophones() {
          var _this24 = this;

          return new Promise(function (resolve, reject) {
            _this24.instance.getMicrophones().then(function (devices) {
              resolve(devices);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取扬声器列表
         * @returns {Promise} - 获取扬声器列表的promise回调
         */

      }, {
        key: "getSpeakers",
        value: function getSpeakers() {
          var _this25 = this;

          return new Promise(function (resolve, reject) {
            _this25.instance.getSpeakers().then(function (devices) {
              resolve(devices);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取设备的分辨率
         * @param {String} deviceId -- 摄像头设备的Id
         * @returns {Promise} - 分辨率获取之后的promise回调
         */

      }, {
        key: "getVideoConstraints",
        value: function getVideoConstraints(deviceId) {
          var _this26 = this;

          return new Promise(function (resolve, reject) {
            _this26.instance.getVideoConstraints({
              deviceId: deviceId
            }, function (data) {
              resolve(data);
            }, function (error) {
              reject(error);
            });
          });
        }
        /**
         * 配置本地流视频质量参数
         * @param {Object} options --  streamId: 切换本地流Id profile: 必填，互动视频质量参数
         * @returns {Promise} - 配置本地流视频质量参数的promise回调
         */

      }, {
        key: "setVideoProfile",
        value: function setVideoProfile() {
          var _this27 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            _this27.instance.setVideoProfile({
              streamId: options.streamId,
              profile: options.profile
            }, function (data) {
              resolve(data);
            }, function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取房间流信息
         * @param {Object} options --  streamId: 切换本地流Id profile: 必填，互动视频质量参数
         * @returns {Promise} - 配置本地流视频质量参数的promise回调
         */

      }, {
        key: "getRoomStreams",
        value: function getRoomStreams() {
          return this.instance.getRoomStreams();
        }
        /**
         * 获取房间总的信息
         * @param {Object} options --  streamId: 切换本地流Id profile: 必填，互动视频质量参数
         * @returns {Promise} - 配置本地流视频质量参数的promise回调
         */

      }, {
        key: "getRoomInfo",
        value: function getRoomInfo() {
          return this.instance.getRoomInfo();
        }
        /**
         * 是否支持桌面共享
         * @returns Boolean
         */

      }, {
        key: "isScreenShareSupported",
        value: function isScreenShareSupported() {
          return this.instance.isScreenShareSupported();
        }
        /**
         * 检查当前浏览器支持性
         * @returns Boolean
         */

      }, {
        key: "checkSystemRequirements",
        value: function checkSystemRequirements() {
          var _this28 = this;

          return new Promise(function (resolve, reject) {
            _this28.instance.checkSystemRequirements().then(function (data) {
              resolve(data.result);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取上下行丢包率
         * @returns  data中有 upLossRate 上行丢包率   downLossRate 下行丢包率
         */

      }, {
        key: "getPacketLossRate",
        value: function getPacketLossRate() {
          var _this29 = this;

          return new Promise(function (resolve, reject) {
            _this29.instance.getPacketLossRate().then(function (data) {
              resolve(data);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取流上下行丢包率
         * @returns  data中有 
         */

      }, {
        key: "getStreamPacketLoss",
        value: function getStreamPacketLoss() {
          var _this30 = this;

          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            _this30.instance.getStreamPacketLoss(options).then(function () {
              resolve();
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取流音频能量
         * @returns  
         */

      }, {
        key: "getAudioLevel",
        value: function getAudioLevel() {
          var _this31 = this;

          var streamId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          return new Promise(function (resolve, reject) {
            _this31.instance.getAudioLevel({
              streamId: streamId
            }).then(function (data) {
              resolve(data);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
        /**
         * 获取流的mute状态
         * @returns  
         */

      }, {
        key: "getStreamMute",
        value: function getStreamMute() {
          var _this32 = this;

          var streamId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          return new Promise(function (resolve, reject) {
            _this32.instance.getStreamMute({
              streamId: streamId
            }).then(function (data) {
              resolve(data);
            })["catch"](function (error) {
              reject(error);
            });
          });
        }
      }]);

      return InteractiveModule;
    }(BaseModule);

    var PlayerModule = /*#__PURE__*/function (_BaseModule) {
      _inherits(PlayerModule, _BaseModule);

      var _super = _createSuper(PlayerModule);

      function PlayerModule(customOptions) {
        var _this;

        _classCallCheck(this, PlayerModule);

        _this = _super.call(this, customOptions);

        _this.init(customOptions);

        _this.isPlaying = false;
        return _this;
      }

      _createClass(PlayerModule, [{
        key: "init",
        value: function init() {
          var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var successCb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
          var failCb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

          if (customOptions.type === 'live') {
            this.initLivePlayer(customOptions, successCb, failCb);
          }

          if (customOptions.type === 'vod') {
            this.initVodPlayer(customOptions, successCb, failCb);
          }
        }
      }, {
        key: "createInstance",
        value: function createInstance() {
          var _this2 = this;

          var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var successCb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
          var failCb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

          var _store$get = store.get('roomInitData'),
              paasInfo = _store$get.paasInfo,
              userInfo = _store$get.userInfo;

          var defaultOptions = {
            appId: paasInfo.paas_app_id,
            accountId: userInfo.third_party_user_id,
            token: paasInfo.paas_access_token,
            type: 'live'
          };
          var options = merge.recursive({}, defaultOptions, customOptions);
          console.log('options:', options);

          var onSuccess = function onSuccess(event) {
            _this2.instance = event.vhallplayer;

            _this2.listenEvents();

            successCb(event);
          };

          var onFail = function onFail(event) {
            console.log('fail:', event);
            failCb(event);
          };

          VhallPlayer.createInstance(options, onSuccess, onFail);
        }
      }, {
        key: "initLivePlayer",
        value: function initLivePlayer() {
          var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var successCb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
          var failCb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

          var _store$get2 = store.get('roomInitData'),
              paasInfo = _store$get2.paasInfo;

          _store$get2.userInfo;
          var defaultOptions = {
            type: 'live',
            language: 'zh',
            liveOption: {
              roomId: paasInfo.room_id,
              forceMSE: true,
              type: 'flv'
            }
          };
          var options = merge.recursive({}, defaultOptions, customOptions);
          this.createInstance(options, successCb, failCb);
        }
      }, {
        key: "initVodPlayer",
        value: function initVodPlayer() {
          var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var successCb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
          var failCb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
          var defaultOptions = {
            appId: '',
            accountId: '',
            token: '',
            type: 'live',
            vodOption: {
              forceMSE: true,
              recordId: ''
            }
          };
          var options = merge.recursive({}, defaultOptions, customOptions);
          this.createInstance(options, successCb, failCb);
        }
      }, {
        key: "listenEvents",
        value: function listenEvents() {
          var _this3 = this;

          this.instance.on(VhallPlayer.CURRENTTIME_CHANGE, function (e) {
            // 当前时间改变
            _this3.$emit('CURRENTTIME_CHANGE', e);
          });
          this.instance.on(VhallPlayer.TIMEUPDATE, function (e) {
            // 播放时间改变时触发
            _this3.$emit('TIMEUPDATE', e);
          });
          this.instance.on(VhallPlayer.ENDED, function (e) {
            // 播放完毕
            _this3.$emit('ENDED', e);
          });
          this.instance.on(VhallPlayer.ERROR, function (e) {
            // 播放器自身出现错误时触发
            _this3.$emit('ERROR', e);
          });
          this.instance.on(VhallPlayer.LOADED, function (e) {
            // 视频加载完成时触发
            _this3.$emit('LOADED', e);
          });
          this.instance.on(VhallPlayer.PLAY, function (e) {
            // 点播开始播放时触发
            _this3.$emit('PLAY', e);
          });
          this.instance.on(VhallPlayer.PAUSE, function (e) {
            // 点播暂停播放时触发
            _this3.$emit('PAUSE', e);
          });
          this.instance.on(VhallPlayer.LAG_REPORT, function (e) {
            // 视频卡顿时触发
            _this3.$emit('LAG_REPORT', e);
          });
          this.instance.on(VhallPlayer.LAG_RECOVER, function (e) {
            // 视频卡顿恢复时触发
            _this3.$emit('LAG_RECOVER', e);
          });
          this.instance.on(VhallPlayer.FULLSCREEN_CHANGE, function (e) {
            // 全屏状态改变时触发
            _this3.$emit('FULLSCREEN_CHANGE', e);
          });
          this.instance.on(VhallPlayer.MUTE_CHANGE, function (e) {
            // 静音状态被改变时触发
            _this3.$emit('MUTE_CHANGE', e);
          });
          this.instance.on(VhallPlayer.LOOP_CHANGE, function (e) {
            // 点播循环状态被改变时触发
            _this3.$emit('LOOP_CHANGE', e);
          });
          this.instance.on(VhallPlayer.DEFINITION_CHANGE, function (e) {
            // 当前清晰度改变时触发(卡顿时自动切清晰度触发，手动切换不触发)
            _this3.$emit('DEFINITION_CHANGE', e);
          });
        }
      }, {
        key: "destroy",
        value: function destroy() {
          this.instance.destroy();
          this.instance = null;
        }
      }, {
        key: "play",
        value: function play() {
          return this.instance.play();
        }
      }, {
        key: "pause",
        value: function pause() {
          return this.instance.pause();
        }
      }, {
        key: "isPause",
        value: function isPause() {
          return this.instance.getIsPause();
        }
      }, {
        key: "getQualitys",
        value: function getQualitys() {
          // 获取清晰度列表
          return this.instance.getQualitys();
        }
      }, {
        key: "getCurrentQuality",
        value: function getCurrentQuality() {
          // 获取当前视频清晰度
          return this.instance.getCurrentQuality();
        }
      }, {
        key: "setQuality",
        value: function setQuality(val, failure) {
          // 设置当前视频清晰度
          return this.instance.setQuality(val, failure);
        }
      }, {
        key: "enterFullScreen",
        value: function enterFullScreen(failure) {
          // 进入全屏
          return this.instance.enterFullScreen(failure);
        }
      }, {
        key: "exitFullScreen",
        value: function exitFullScreen(failure) {
          // 退出全屏
          return this.instance.exitFullScreen(failure);
        }
      }, {
        key: "setMute",
        value: function setMute(isMute, failure) {
          return this.instance.setMute(isMute, failure);
        }
      }, {
        key: "getVolume",
        value: function getVolume() {
          // 获取音量
          return this.instance.getVolume();
        }
      }, {
        key: "setVolume",
        value: function setVolume(volume, failure) {
          // 设置音量
          return this.instance.setVolume(volume, failure);
        }
      }, {
        key: "getDuration",
        value: function getDuration(failure) {
          // 获取当前视频总时长
          return this.instance.getDuration(failure);
        }
      }, {
        key: "getCurrentTime",
        value: function getCurrentTime(failure) {
          // 获取当前视频播放时间
          return this.instance.getCurrentTime(failure);
        }
      }, {
        key: "setCurrentTime",
        value: function setCurrentTime(time, failure) {
          // 设置当前播放时间
          return this.instance.setCurrentTime(time, failure);
        }
      }, {
        key: "getUsableSpeed",
        value: function getUsableSpeed(failure) {
          // 获取当前可选倍速
          return this.instance.getUsableSpeed(failure);
        }
      }, {
        key: "setPlaySpeed",
        value: function setPlaySpeed(val, failure) {
          // 设置倍速播放
          return this.instance.setPlaySpeed(val, failure);
        }
      }, {
        key: "openControls",
        value: function openControls(isOpen) {
          // 开关默认控制条
          return this.instance.openControls(isOpen);
        }
      }, {
        key: "openUI",
        value: function openUI(isOpen) {
          return this.instance.openUI(isOpen);
        }
      }, {
        key: "setResetVideo",
        value: function setResetVideo() {
          var videoDom = document.getElementById(this.params.videoNode);

          if (videoDom && this.instance) {
            this.instance.setSize({
              width: videoDom.offsetWidth,
              height: videoDom.offsetHeight
            });
          }
        }
      }, {
        key: "setBarrageInfo",
        value: function setBarrageInfo(option) {
          return this.instance.setBarrageInfo(option, function (err) {
            Vlog.error(err);
          });
        }
      }, {
        key: "addBarrage",
        value: function addBarrage(content) {
          return this.instance.addBarrage(content, function (err) {
            Vlog.error(err);
          });
        }
      }, {
        key: "toggleBarrage",
        value: function toggleBarrage(open) {
          if (!this.instance) return;

          if (open) {
            this.instance.openBarrage();
          } else {
            this.instance.closeBarrage();
          }
        }
      }, {
        key: "toggleSubtitle",
        value: function toggleSubtitle(open) {
          if (this.instance && this.params.recordId) {
            if (open) {
              // 开启点播字幕(仅点播可用)
              this.instance.openSubtitle();
            } else {
              // 关闭点播字幕(仅点播可用)
              this.instance.closeSubtitle();
            }
          }
        }
      }]);

      return PlayerModule;
    }(BaseModule);

    var initLoader = function initLoader() {
      Promise.all([mountSDK('https://static.vhallyun.com/jssdk/vhall-jssdk-player/latest/vhall-jssdk-player-2.3.8.js'), mountSDK('https://static.vhallyun.com/jssdk/vhall-jssdk-chat/latest/vhall-jssdk-chat-2.1.3.js'), mountSDK('https://static.vhallyun.com/jssdk/vhall-jssdk-interaction/latest/vhall-jssdk-interaction-2.3.3.js')]).then(function (res) {});
    };

    var VhallSaasSDK = /*#__PURE__*/function () {
      function VhallSaasSDK() {
        _classCallCheck(this, VhallSaasSDK);

        this.msgBus = null;
        this.request = requestApi;
        this.baseState = store;
      }

      _createClass(VhallSaasSDK, [{
        key: "init",
        value: function init() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
            clientType: 'send',
            receiveType: 'standard'
          };
          this.setRequestConfig(options);
          this.setClientType(options.clientType);

          if (options.clientType === 'send') {
            return this.initSendLive(options);
          } else {
            return this.initReceiveLive(options);
          }
        }
      }, {
        key: "initSendLive",
        value: function initSendLive(options) {
          var _this = this;

          return new Promise(function (resolve, reject) {
            _this.request.live.initSendLive(options).then(function (res) {
              if (res.code === 200) {
                store.set('roomInitData', getRoomInfo(res));
                resolve(res);
              } else {
                reject(res);
              }
            });
          });
        }
      }, {
        key: "initReceiveLive",
        value: function initReceiveLive(options) {
          var _this2 = this;

          var receiveApi = {
            standard: 'initStandardReceiveLive',
            embed: 'initEmbeddedReceiveLive',
            sdk: 'initSdkReceiveLive'
          };
          return new Promise(function (resolve, reject) {
            _this2.request.live[receiveApi[options.receiveType]](options).then(function (res) {
              if (res.code === 200) {
                store.set('roomInitData', getRoomInfo(res));
                resolve(res);
              } else {
                reject(res);
              }
            });
          });
        }
      }, {
        key: "setClientType",
        value: function setClientType(clientType) {
          if (clientType !== 'send' && clientType !== 'receive') {
            throw new TypeError('clientType is invalid');
          }

          store.set('clientType', clientType);
        }
      }, {
        key: "setRequestConfig",
        value: function setRequestConfig(options) {
          if (options.development) {
            setBaseUrl('https://t-saas-dispatch.vhall.com');
          } else {
            setBaseUrl('https://saas-api.vhall.com');
          }

          setToken(options.token, options.liveToken);

          if (options.requestHeaders) {
            setRequestHeaders(options.requestHeaders);
          }
        }
      }, {
        key: "isReady",
        value: function isReady() {
          return loadSuccess === true;
        }
      }, {
        key: "createPlayer",
        value: function createPlayer() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            var instance = new PlayerModule(options);
            resolve(instance);
          });
        }
      }, {
        key: "createInteractive",
        value: function createInteractive() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            var instance = new InteractiveModule(options);
            instance.init(options).then(function (res) {
              resolve(instance);
            });
          });
        }
      }, {
        key: "createChat",
        value: function createChat() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            var instance = new ChatModule();
            instance.init(options).then(function (res) {
              resolve(instance);
            });
          });
        }
      }, {
        key: "createDoc",
        value: function createDoc() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return new Promise(function (resolve, reject) {
            var instance = new DocModule(options);
            resolve(instance);
          });
        }
      }]);

      return VhallSaasSDK;
    }();

    VhallSaasSDK.requestApi = requestApi;
    initLoader();
    window.VhallSaasSDK = VhallSaasSDK;
  });

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var src = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.isPlainObject = exports.clone = exports.recursive = exports.merge = exports.main = void 0;
  module.exports = exports = main;
  exports.default = main;
  function main() {
      var items = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          items[_i] = arguments[_i];
      }
      return merge.apply(void 0, items);
  }
  exports.main = main;
  main.clone = clone;
  main.isPlainObject = isPlainObject;
  main.recursive = recursive;
  function merge() {
      var items = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          items[_i] = arguments[_i];
      }
      return _merge(items[0] === true, false, items);
  }
  exports.merge = merge;
  function recursive() {
      var items = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          items[_i] = arguments[_i];
      }
      return _merge(items[0] === true, true, items);
  }
  exports.recursive = recursive;
  function clone(input) {
      if (Array.isArray(input)) {
          var output = [];
          for (var index = 0; index < input.length; ++index)
              output.push(clone(input[index]));
          return output;
      }
      else if (isPlainObject(input)) {
          var output = {};
          for (var index in input)
              output[index] = clone(input[index]);
          return output;
      }
      else {
          return input;
      }
  }
  exports.clone = clone;
  function isPlainObject(input) {
      return input && typeof input === 'object' && !Array.isArray(input);
  }
  exports.isPlainObject = isPlainObject;
  function _recursiveMerge(base, extend) {
      if (!isPlainObject(base))
          return extend;
      for (var key in extend) {
          if (key === '__proto__' || key === 'constructor' || key === 'prototype')
              continue;
          base[key] = (isPlainObject(base[key]) && isPlainObject(extend[key])) ?
              _recursiveMerge(base[key], extend[key]) :
              extend[key];
      }
      return base;
  }
  function _merge(isClone, isRecursive, items) {
      var result;
      if (isClone || !isPlainObject(result = items.shift()))
          result = {};
      for (var index = 0; index < items.length; ++index) {
          var item = items[index];
          if (!isPlainObject(item))
              continue;
          for (var key in item) {
              if (key === '__proto__' || key === 'constructor' || key === 'prototype')
                  continue;
              var value = isClone ? clone(item[key]) : item[key];
              result[key] = isRecursive ? _recursiveMerge(result[key], value) : value;
          }
      }
      return result;
  }
  });

  unwrapExports(src);
  src.isPlainObject;
  src.clone;
  src.recursive;
  src.merge;
  src.main;

  function uploadFile(options, onChange) {
    var inputObj = document.createElement('input');
    inputObj.setAttribute('id', 'file');
    inputObj.setAttribute('type', 'file');
    inputObj.setAttribute('name', 'file');
    inputObj.setAttribute("style", 'height:0px; position: absolute;');
    inputObj.setAttribute("accept", options.accept);
    document.body.appendChild(inputObj);
    inputObj.value;
    inputObj.click();
    inputObj.addEventListener('change', function (e) {
      onChange && onChange(e);
      document.body.removeChild(this);
    });
  } // 判断浏览器是否是 chrome88 以上版本


  function isChrome88() {
    var chromeReg = /Chrome\/(\d{2})[.\d]+\sSafari\/[.\d]+$/gi;
    var chromeResult = chromeReg.exec(navigator.userAgent);
    return chromeResult && chromeResult.length > 0 && chromeResult[1] > 87;
  }

  /**
   * ajax请求 jsonp处理
   * 1.jsonp 请求格式
   *   $fetch({
   *      url:'',
   *      type: 'GET',
   *      jsonp: 'callback',
   *      data: {
   *        name: 123
   *      }
   *   })
   */
  var BUSE_URL = 'https://t-saas-dispatch.vhall.com';
  var TOKEN = '';
  var LIVETOKEN = '';
  var HEADERS = {};

  function setBaseUrl(url) {
    BUSE_URL = url;
  }

  function setToken(token, livetoken) {
    console.log(token, livetoken, 888);
    TOKEN = token;
    LIVETOKEN = livetoken;
  }

  function setRequestHeaders(options) {
    Object.assign(HEADERS, options);
  }

  function $fetch(options) {
    // if (process.env.NODE_ENV != 'development') {
    //
    // }
    options.url = BUSE_URL + options.url;
    console.log('接口环境', options.url);
    return new Promise(function (resolve, reject) {
      options = options || {};

      if (options.data) {
        if (LIVETOKEN) {
          options.data.live_token = LIVETOKEN;
        }

        options.data = formatParams(options.data);
      }

      options.dataType ? jsonp(options, resolve, reject) : json(options, resolve, reject);
    });
  } // JSON请求


  function json(params, success, fail) {
    var xhr = null; // interactToken = sessionStorage.getItem('interact-token') || '',
    // grayId = sessionStorage.getItem('grayId') || '',
    // vhallJSSDKUserInfo = localStorage.getItem('vhallJSSDKUserInfo') ? JSON.parse(localStorage.getItem('vhallJSSDKUserInfo')) : {},

    params.type = (params.type || 'GET').toUpperCase();

    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var status = xhr.status;

        if (status >= 200 && status < 300) {
          var response = '';
          var type = xhr.getResponseHeader('Content-type');

          if (type.indexOf('xml') !== -1 && xhr.responseXML) {
            response = xhr.responseXML;
          } else if (type === 'application/json' || type === 'application/json;charset=UTF-8') {
            response = JSON.parse(xhr.responseText);
          } else {
            response = xhr.responseText;
          }

          success && success(response);
        } else {
          fail && fail(status);
        }
      }
    };

    if (params.type == 'GET') {
      if (params.data) {
        xhr.open(params.type, params.url + '?' + params.data, true);
      } else {
        xhr.open(params.type, params.url, true);
      }
    } else if (params.type == 'POST') {
      xhr.open(params.type, params.url, true);
    }

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var interact_token = sessionStorage.getItem('interact_token') || null;
    interact_token && xhr.setRequestHeader('interact-token', interact_token);

    if (!LIVETOKEN) {
      TOKEN && xhr.setRequestHeader('token', TOKEN);
    }

    console.log('HEADERS', HEADERS, TOKEN);

    if (HEADERS) {
      Object.getOwnPropertyNames(HEADERS).forEach(function (item) {
        xhr.setRequestHeader(item, HEADERS[item]);
      });
    } // if (params.headers && params.headers.activeType == 'new') {
    //     xhr.setRequestHeader('platform', 18)
    //     xhr.setRequestHeader('request-id', uuid())
    //     grayId && xhr.setRequestHeader('gray-id', grayId)
    //     interactToken && xhr.setRequestHeader('interact-token', interactToken)
    //     token && xhr.setRequestHeader('token', token)
    // }


    if (params.type == 'GET') {
      xhr.send(null);
    } else {
      xhr.send(params.data);
    }
  } // JSONP请求


  function jsonp(params, success, fail) {
    var callbackName = params.dataType;
    params['callback'] = callbackName;
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.charset = "utf-8";
    document.body.appendChild(script); // 创建回调函数

    window[callbackName] = function (val) {
      document.body.removeChild(script);
      clearTimeout(script.timer);
      window[callbackName] = null;
      success && success(val);
    };
    script.src = "".concat(params.url, "?").concat(params.data, "&_=", 1594014089800); // 超时处理

    if (params.time) {
      script.timer = setTimeout(function () {
        window[callbackName] = null;
        head.removeChild(script);
        fail && fail('请求超时');
      }, parmas.time * 1000);
    }
  } // 格式化数据


  function formatParams(data) {
    var arr = [];

    if (data) {
      for (var item in data) {
        arr.push(encodeURIComponent(item) + '=' + encodeURIComponent(data[item]));
      }
    }

    return arr.join('&');
  } // 随机数

  var getWebinarInfo = function getWebinarInfo() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get = contextServer.get('roomBaseServer'),
        state = _contextServer$get.state;

    var retParmams = {
      webinar_id: params.webinarId || state.watchInitData.webinar.id,
      is_no_check: 1 
    };
    return $fetch({
      url: '/v3/webinars/webinar/info',
      type: 'POST',
      data: retParmams
    });
  }; // 查询活动配置信息


  var getConfigList = function getConfigList() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get2 = contextServer.get('roomBaseServer'),
        state = _contextServer$get2.state;

    var retParmams = {
      webinar_id: params.webinar_id || state.watchInitData.webinar.id,
      webinar_user_id: params.webinar_user_id || state.watchInitData.webinar.userinfo.user_id,
      scene_id: params.scene_id || 1
    };
    return $fetch({
      url: '/v3/users/permission/get-config-list',
      type: 'POST',
      data: retParmams
    });
  }; // 设置设备检测状态


  var setDevice = function setDevice() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get3 = contextServer.get('roomBaseServer'),
        state = _contextServer$get3.state;

    var retParmams = {
      room_id: params.room_id || state.watchInitData.interact.room_id,
      status: params.status || 1,
      type: params.type || 0
    };
    return $fetch({
      url: '/v3/interacts/room/set-device',
      type: 'POST',
      data: retParmams
    });
  }; // 开始暂停结束录制api


  var recordApi = function recordApi() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get4 = contextServer.get('roomBaseServer'),
        state = _contextServer$get4.state;

    var _contextServer$get5 = contextServer.get('roomInitGroupServer'),
        roomInitGroupServerState = _contextServer$get5.state;

    var retParmams = {
      webinar_id: params.webinarId || state.watchInitData.webinar.id,
      status: params.status || 1
    };

    if (params.live_token || roomInitGroupServerState.live_token) {
      retParmams.live_token = params.live_token || roomInitGroupServerState.live_token;
    }

    return $fetch({
      url: '/v3/webinars/record/ticker',
      type: 'POST',
      data: retParmams
    });
  };

  var roomBase = {
    getWebinarInfo: getWebinarInfo,
    getConfigList: getConfigList,
    setDevice: setDevice,
    recordApi: recordApi
  };

  var loginInfo = function loginInfo() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // const { state } = contextServer.get('roomInitGroupServer') || {}
    var retParmams = params;
    retParmams.biz_id = 2;
    return $fetch({
      url: '/v3/users/user-consumer/login',
      type: 'POST',
      data: retParmams
    });
  }; // 第三方授权


  var callbackUserInfo = function callbackUserInfo() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // const { state } = contextServer.get('roomBaseServer')
    var retParmams = params;
    return $fetch({
      url: '/v3/users/oauth/callback',
      type: 'POST',
      data: retParmams
    });
  }; // 注册


  var register = function register() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // const { state } = contextServer.get('roomBaseServer')
    var retParmams = _objectSpread2({}, params);

    return $fetch({
      url: '/v3/users/user-consumer/register',
      type: 'POST',
      data: retParmams
    });
  }; // 手机||邮箱验证码


  var codeCheck = function codeCheck() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get = contextServer.get('roomBaseServer');
        _contextServer$get.state;

    var retParmams = _objectSpread2({}, params);

    return $fetch({
      url: '/v3/users/code-consumer/check',
      type: 'POST',
      data: retParmams
    });
  }; // 密码重置


  var resetPassword = function resetPassword() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get2 = contextServer.get('roomInitGroupServer'),
        state = _contextServer$get2.state;

    var retParmams = Object.assign({}, params, {
      biz_id: state.biz_id || 2
    });
    return $fetch({
      url: '/v3/users/user-consumer/reset-password',
      type: 'POST',
      data: retParmams
    });
  };

  var userBase = {
    loginInfo: loginInfo,
    callbackUserInfo: callbackUserInfo,
    register: register,
    codeCheck: codeCheck,
    resetPassword: resetPassword
  };

  var getInsertFileList = function getInsertFileList() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get = contextServer.get('roomBaseServer'),
        state = _contextServer$get.state;

    var retParmams = {
      webinar_id: params.webinarId || state.watchInitData.webinar.id,
      is_no_check: params.is_no_check || 1,
      pos: params.pos || 0,
      limit: params.limit || 10,
      get_no_trans: params.get_no_trans || 1
    };

    if (params.name) {
      retParmams.name = params.name;
    }

    return $fetch({
      url: '/v3/webinars/waiting-file/get-list',
      type: 'POST',
      data: retParmams
    });
  }; // 删除插播文件


  var deleteInsertFile = function deleteInsertFile() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return $fetch({
      url: '/v3/webinars/waiting-file/deletes',
      type: 'POST',
      data: params
    });
  };

  var insertFile = {
    getInsertFileList: getInsertFileList,
    deleteInsertFile: deleteInsertFile
  };

  var virtualClientStart = function virtualClientStart() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // const { state } = contextServer.get('roomInitGroupServer') || {}
    var retParmams = params;
    return $fetch({
      url: '/v3/webinars/virtual/start',
      type: 'GET',
      data: retParmams
    });
  }; // 发起端-增加虚拟观众


  var virtualAccumulation = function virtualAccumulation() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // const { state } = contextServer.get('roomInitGroupServer') || {}
    var retParmams = params;
    return $fetch({
      url: '/v3/webinars/virtual/accumulation',
      type: 'GET',
      data: retParmams
    });
  }; // 发起端-获取虚拟观众基数


  var virtualClientGet = function virtualClientGet() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // const { state } = contextServer.get('roomInitGroupServer') || {}
    var retParmams = params;
    return $fetch({
      url: '/v3/webinars/virtual/get-base',
      type: 'GET',
      data: retParmams
    });
  };

  var virtualClient = {
    virtualClientStart: virtualClientStart,
    virtualAccumulation: virtualAccumulation,
    virtualClientGet: virtualClientGet
  };

  var setMainScreen = function setMainScreen() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get = contextServer.get('roomBaseServer'),
        state = _contextServer$get.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/room/set-main-screen',
      type: 'POST',
      data: retParams
    });
  }; // 设置主讲人


  var setSpeaker = function setSpeaker() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get2 = contextServer.get('roomBaseServer'),
        state = _contextServer$get2.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/room/set-doc-permission',
      type: 'POST',
      data: retParams
    });
  }; // 设置音视频设备开关


  var setRoomDevice = function setRoomDevice() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get3 = contextServer.get('roomBaseServer'),
        state = _contextServer$get3.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id,
      device: params.device,
      status: params.status,
      receive_account_id: params.receive_account_id
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/room/set-device-status',
      type: 'POST',
      data: retParams
    });
  };

  var interactive = {
    setMainScreen: setMainScreen,
    // 设置主屏
    setSpeaker: setSpeaker,
    // 设置主讲人
    setRoomDevice: setRoomDevice // 设置音视频设备开关

  };

  var allowSpeak = function allowSpeak() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get = contextServer.get('roomBaseServer'),
        state = _contextServer$get.state;

    var retParams = {
      roomId: params.roomId || state.watchInitData.interact.room_id,
      receive_account_id: ''
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/inav/agree-apply',
      type: 'POST',
      data: retParams
    });
  }; // 用户上麦


  var speakOn = function speakOn() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get2 = contextServer.get('roomBaseServer'),
        state = _contextServer$get2.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/inav-user/speak',
      type: 'POST',
      data: retParams
    });
  }; // 用户自己下麦


  var speakOff = function speakOff() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get3 = contextServer.get('roomBaseServer'),
        state = _contextServer$get3.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/inav-user/nospeak',
      type: 'POST',
      data: retParams
    });
  }; // 设置其他人下麦


  var speakUserOff = function speakUserOff() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get4 = contextServer.get('roomBaseServer'),
        state = _contextServer$get4.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/inav/nospeak',
      type: 'POST',
      data: retParams
    });
  }; // 允许举手


  var setHandsup = function setHandsup() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get5 = contextServer.get('roomBaseServer'),
        state = _contextServer$get5.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id,
      status: 0 // 1-允许 0-不允许

    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/inav-user/nospeak',
      type: 'POST',
      data: retParams
    });
  }; // 邀请上麦


  var inviteMic = function inviteMic() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get6 = contextServer.get('roomBaseServer'),
        state = _contextServer$get6.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/inav/invite',
      type: 'POST',
      data: retParams
    });
  }; // 取消申请


  var cancelApply = function cancelApply() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get7 = contextServer.get('roomBaseServer'),
        state = _contextServer$get7.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/inav-user/cancel-apply',
      type: 'POST',
      data: retParams
    });
  }; // 拒绝邀请上麦


  var refuseInvite = function refuseInvite() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _contextServer$get8 = contextServer.get('roomBaseServer'),
        state = _contextServer$get8.state;

    var retParams = {
      room_id: params.room_id || state.watchInitData.interact.room_id
    };
    retParams = Object.assign(retParams, params);
    return $fetch({
      url: '/v3/interacts/inav-user/reject-invite',
      type: 'POST',
      data: retParams
    });
  };

  var mic = {
    allowSpeak: allowSpeak,
    // 允许上麦
    speakOn: speakOn,
    // 用户上麦
    speakOff: speakOff,
    // 用户下麦
    speakUserOff: speakUserOff,
    // 设置其他人下麦
    inviteMic: inviteMic,
    // 邀请上麦
    setHandsup: setHandsup,
    // 允许举手
    cancelApply: cancelApply,
    // 取消申请
    refuseInvite: refuseInvite // 拒绝邀请上麦

  };

  // 获取文档列表(资料库所有文档)

  var getAllDocList = function getAllDocList() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return $fetch({
      url: '/v3/interacts/document/get-shared-document-list',
      type: 'GET',
      data: params
    });
  }; // 获取文档列表(当前活动下)


  var getWebinarDocList = function getWebinarDocList() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return $fetch({
      url: '/v3/interacts/document/get-webinar-document-list',
      type: 'POST',
      data: params
    });
  }; // 获取文档详情


  var getDocDetail = function getDocDetail() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return $fetch({
      url: '/v3/interacts/document/get-shared-document-list',
      type: 'GET',
      data: params
    });
  }; // 同步文档


  var syncDoc = function syncDoc() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return $fetch({
      url: '/v3/interacts/document/clone-from-shared-document',
      type: 'GET',
      data: params
    });
  }; // 删除文档(多选)


  var delDocList = function delDocList() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return $fetch({
      url: '/v3/interacts/document/batch-remove-reference',
      type: 'POST',
      data: params
    });
  };

  var doc = {
    getAllDocList: getAllDocList,
    getWebinarDocList: getWebinarDocList,
    getDocDetail: getDocDetail,
    syncDoc: syncDoc,
    delDocList: delDocList
  };

  var RequestApi = function RequestApi() {
    _classCallCheck(this, RequestApi);

    this.live = window.VhallSaasSDK.requestApi.live;
    this.roomBase = roomBase;
    this.user = userBase;
    this.insertFile = insertFile;
    this.virtualClient = virtualClient;
    this.interactive = interactive;
    this.mic = mic;
    this.doc = doc;
  };

  var requestApi = new RequestApi();

  function useInteractiveServer() {
    var _ref2;

    var state = {
      vhallSaasInstance: null,
      // vhallsdk的实例
      interactiveInstance: null,
      // 互动实例
      streamId: null,
      remoteStreams: [] // 远端流数组

    };

    var init = function init(option) {
      var roomInitGroupServer = contextServer.get('roomInitGroupServer');
      state.vhallSaasInstance = roomInitGroupServer.state.vhallSaasInstance;
      return state.vhallSaasInstance.createInteractive().then(function (interactives) {
        console.log('5555555555555createInteractive');
        state.interactiveInstance = interactives; // setTimeout(()=>{
        //     console.log('555888888createInteractive');
        //     state.interactiveInstance.listenEvents()
        // },2000)

        console.log('5555state.interactiveInstance', interactives, interactives.getRoomInfo());
        return true;
      });
    }; // 监听事件


    var on = function on(type, callback) {
      console.log('ON INTERACTIVE REGSITER SUCCESS', type);
      return state.interactiveInstance.$on(type, callback);
    }; // 销毁实例


    var destroyInit = function destroyInit() {
      return state.interactiveInstance.destroyInit();
    }; // 基础api
    // 常见本地流


    var createLocalStream = function createLocalStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.createLocalStream(options);
    }; // 创建摄像头视频流


    var createLocalVideoStream = function createLocalVideoStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return state.interactiveInstance.createLocalVideoStream(options, addConfig);
    }; // 创建桌面共享流


    var createLocaldesktopStream = function createLocaldesktopStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return state.interactiveInstance.createLocaldesktopStream(options, addConfig);
    }; // 创建本地音频流


    var createLocalAudioStream = function createLocalAudioStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return state.interactiveInstance.createLocalAudioStream(options, addConfig);
    }; // 创建图片推流


    var createLocalPhotoStream = function createLocalPhotoStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return state.interactiveInstance.createLocalPhotoStream(options, addConfig);
    }; // 销毁额本地流


    var destroyStream = function destroyStream(streamId) {
      return state.interactiveInstance.destroyStream(streamId || state.streamId);
    }; // 推送本地流到远端


    var publishStream = function publishStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.publishStream({
        streamId: options.streamId || state.streamId
      });
    }; // 取消推送到远端的流


    var unpublishStream = function unpublishStream(streamId) {
      return state.interactiveInstance.unpublishStream(streamId || state.streamId);
    }; // 订阅远端流


    var subscribeStream = function subscribeStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.subscribeStream(options);
    }; // 取消订阅远端流


    var unSubscribeStream = function unSubscribeStream(streamId) {
      return state.interactiveInstance.unSubscribeStream(streamId);
    }; // 设置大小流


    var setDual = function setDual() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.setDual(options);
    }; // 改变视频的禁用和启用


    var muteVideo = function muteVideo() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.muteVideo(options);
    }; // 改变音频的禁用和启用


    var muteAudio = function muteAudio() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.muteAudio(options);
    }; // 开启旁路


    var startBroadCast = function startBroadCast() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var addConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return state.interactiveInstance.startBroadCast(options, addConfig);
    }; // 停止旁路


    var stopBroadCast = function stopBroadCast() {
      return state.interactiveInstance.stopBroadCast();
    }; // 动态配置指定旁路布局模板


    var setBroadCastLayout = function setBroadCastLayout() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.setBroadCastLayout(options);
    }; // 配置旁路布局自适应模式


    var setBroadCastAdaptiveLayoutMode = function setBroadCastAdaptiveLayoutMode() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.setBroadCastAdaptiveLayoutMode(options);
    }; // 动态配置旁路主屏


    var setBroadCastScreen = function setBroadCastScreen() {
      var mainScreenStreamId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      return state.interactiveInstance.setBroadCastScreen(mainScreenStreamId);
    }; // 获取全部音视频列表


    var getDevices = function getDevices() {
      return state.interactiveInstance.getDevices();
    }; // 获取摄像头列表


    var getCameras = function getCameras() {
      return state.interactiveInstance.getCameras();
    }; // 获取麦克风列表


    var getMicrophones = function getMicrophones() {
      return state.interactiveInstance.getMicrophones();
    }; // 获取扬声器列表


    var getSpeakers = function getSpeakers() {
      return state.interactiveInstance.getSpeakers();
    }; // 获取设备的分辨率


    var getVideoConstraints = function getVideoConstraints() {
      var deviceId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      return state.interactiveInstance.getSpeakers(deviceId);
    }; // 配置本地流视频质量参数


    var setVideoProfile = function setVideoProfile() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.setVideoProfile(options);
    }; // 是否支持桌面共享


    var isScreenShareSupported = function isScreenShareSupported() {
      return state.interactiveInstance.isScreenShareSupported();
    }; // 检查当前浏览器支持性


    var checkSystemRequirements = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (state.interactiveInstance) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                return _context.abrupt("return", state.interactiveInstance.checkSystemRequirements());

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function checkSystemRequirements() {
        return _ref.apply(this, arguments);
      };
    }(); // 获取上下行丢包率


    var getPacketLossRate = function getPacketLossRate() {
      return state.interactiveInstance.getPacketLossRate();
    }; // 获取流上下行丢包率


    var getStreamPacketLoss = function getStreamPacketLoss() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return state.interactiveInstance.getStreamPacketLoss(options);
    }; // 获取房间流信息


    var getRoomStreams = function getRoomStreams() {
      return state.interactiveInstance.getRoomStreams();
    }; // 获取房间总的流信息(本地流加远端流)


    var getRoomInfo = function getRoomInfo() {
      return state.interactiveInstance.getRoomInfo();
    }; // 获取流音频能量


    var getAudioLevel = function getAudioLevel(streamId) {
      return state.interactiveInstance.getAudioLevel(streamId);
    }; // 获取流的mute状态


    var getStreamMute = function getStreamMute(streamId) {
      return state.interactiveInstance.getStreamMute(streamId);
    }; // 获取当前流的信息,返回一个数组


    var currentStreams = function currentStreams() {
      return state.interactiveInstance.currentStreams;
    }; // 上麦


    var speakOn = function speakOn() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.speakOn(data);
    }; // 下麦


    var speakOff = function speakOff() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.speakOff(data);
    };

    var speakUserOff = function speakUserOff() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.interactive.speakUserOff(data);
    }; // 设置主屏


    var setMainScreen = function setMainScreen() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.interactive.setMainScreen(data);
    }; // 设置主讲人


    var setSpeaker = function setSpeaker() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.interactive.setSpeaker(data);
    }; // 设置（麦克风-1 摄像头-2）


    var setRoomDevice = function setRoomDevice() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.interactive.setRoomDevice(data);
    }; // 允许举手


    var setHandsup = function setHandsup() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.setHandsUp(data);
    }; // 邀请上麦


    var inviteMic = function inviteMic() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.inviteMic(data);
    }; // 取消申请


    var cancelApply = function cancelApply() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.cancelApply(data);
    }; // 拒绝邀请


    var refuseInvite = function refuseInvite() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.refuseInvite(data);
    }; // 组合api


    var startPushStream = function startPushStream() {
      console.log('state:', state);
      createLocalAndStream(state.interactiveInstance);
    }; // 创建本地的推流和推流


    var createLocalAndStream = function createLocalAndStream(interactive) {
      var camerasList = null,
          micropsList = null,
          videoConstraintsList = null;
      return interactive.getDevices().then(function (data) {
        console.log('devices list::', data);
        camerasList = data.videoInputDevices.filter(function (d) {
          return d.label && d.deviceId != 'desktopScreen';
        });
        micropsList = data.audioInputDevices.filter(function (d) {
          return d.deviceId != 'default' && d.deviceId != 'communications' && d.label;
        });
      }).then(function () {
        var RESOLUTION_REG = /((^VIDEO_PROFILE_(720P|540P|480P|360P)_1$)|(^RTC_VIDEO_PROFILE_(720P|540P|480P|360P)_16x9_M$))/;
        interactive.getVideoConstraints(camerasList[0].deviceId).then(function (data) {
          console.log('constrainList', data);
          videoConstraintsList = data.filter(function (item) {
            return RESOLUTION_REG.test(item.label);
          });
        }).then(function () {
          var params = {
            videoNode: 'vhall-video',
            videoDevice: camerasList[0].deviceId,
            audioDevice: micropsList[0].deviceId,
            profile: videoConstraintsList[0]
          };
          interactive.createLocalVideoStream(params).then(function (res) {
            console.log('create local stream success::', res);
            state.streamId = res;
            return res;
          })["catch"](function (err) {
            console.log('local stream failed::', err);
          });
        })["catch"](function (err) {
          console.log('constrainlist is failed::', err);
        });
      })["catch"](function (err) {
        console.log('getDevies is failed::', err);
      });
    };


    var remoteStreamList = function remoteStreamList() {
      state.remoteStreams = state.interactiveInstance.getRemoteStreams();

      for (var remoteStream in state.interactiveInstance.getRemoteStreams()) {
        state.remoteStreams.push(remoteStream);
      }

      return state.remoteStreams;
    }; // sdk的监听事件


    var listenerSdk = function listenerSdk() {
      state.interactiveInstance.on(VhallRTC.EVENT_REMOTESTREAM_ADD, function (e) {
        // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
        console.log('55555remote stream add info::', e); // state.remoteStreams.push(e)
      });
      state.interactiveInstance.on(VhallRTC.EVENT_REMOTESTREAM_REMOVED, function (e) {
        // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
        console.log('55555remote stream remove info::', e); // state.remoteStreams.filter(item => item.streamId == e.streamId)
      });
    };

    return _ref2 = {
      state: state,
      startPushStream: startPushStream,
      init: init,
      destroyInit: destroyInit,
      createLocalStream: createLocalStream,
      createLocalVideoStream: createLocalVideoStream,
      createLocaldesktopStream: createLocaldesktopStream,
      createLocalAudioStream: createLocalAudioStream,
      createLocalPhotoStream: createLocalPhotoStream,
      destroyStream: destroyStream,
      publishStream: publishStream,
      unpublishStream: unpublishStream,
      subscribeStream: subscribeStream,
      unSubscribeStream: unSubscribeStream,
      setDual: setDual,
      muteVideo: muteVideo,
      muteAudio: muteAudio,
      startBroadCast: startBroadCast,
      stopBroadCast: stopBroadCast,
      setBroadCastLayout: setBroadCastLayout,
      setBroadCastScreen: setBroadCastScreen,
      getDevices: getDevices,
      getCameras: getCameras,
      getMicrophones: getMicrophones,
      getSpeakers: getSpeakers,
      getVideoConstraints: getVideoConstraints,
      isScreenShareSupported: isScreenShareSupported,
      checkSystemRequirements: checkSystemRequirements,
      getPacketLossRate: getPacketLossRate,
      getRoomStreams: getRoomStreams,
      remoteStreamList: remoteStreamList,
      listenerSdk: listenerSdk,
      setVideoProfile: setVideoProfile,
      getStreamPacketLoss: getStreamPacketLoss,
      getAudioLevel: getAudioLevel,
      on: on,
      getRoomInfo: getRoomInfo,
      getStreamMute: getStreamMute,
      setBroadCastAdaptiveLayoutMode: setBroadCastAdaptiveLayoutMode,
      speakOn: speakOn,
      speakOff: speakOff,
      speakUserOff: speakUserOff,
      setMainScreen: setMainScreen,
      setSpeaker: setSpeaker
    }, _defineProperty(_ref2, "setSpeaker", setSpeaker), _defineProperty(_ref2, "setRoomDevice", setRoomDevice), _defineProperty(_ref2, "setHandsup", setHandsup), _defineProperty(_ref2, "inviteMic", inviteMic), _defineProperty(_ref2, "cancelApply", cancelApply), _defineProperty(_ref2, "refuseInvite", refuseInvite), _defineProperty(_ref2, "currentStreams", currentStreams), _ref2;
  }

  function useMediaCheckServer() {
    var interactiveServer = null;
    var state = {
      videoNode: "vh-device-check-video",
      // 视频容器
      selectedVideoDeviceId: "",
      // 当前选取的设备id
      localStreamId: "" // 本地流id

    };

    var init = function init() {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      state.videoNode = opt.videoNode || "vh-device-check-video";
      state.selectedVideoDeviceId = opt.selectedVideoDeviceId === undefined ? opt.selectedVideoDeviceId : "";
      state.localStreamId = opt.localStreamId === undefined ? opt.localStreamId : "";
      interactiveServer = contextServer.get("interactiveServer");
    };

    var setVideoNode = function setVideoNode(videoNode) {
      state.videoNode = videoNode;
    };

    var setSelectedVideoDeviceId = function setSelectedVideoDeviceId(selectedVideoDeviceId) {
      state.selectedVideoDeviceId = selectedVideoDeviceId;
    }; // 开始视频预览


    var startPreviewVideo = function startPreviewVideo() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var originalOpts = {
        videoNode: state.videoNode,
        // 传入本地视频显示容器，必填
        audio: false,
        // 是否获取音频，选填，默认为true
        videoDevice: state.selectedVideoDeviceId,
        profile: VhallRTC.RTC_VIDEO_PROFILE_240P_16x9_M
      };
      var options = Object.assign.apply(Object, _toConsumableArray(originalOpts).concat(_toConsumableArray(opts)));
      return interactiveServer.createLocalVideoStream(options).then(function (streamId) {
        state.localStreamId = streamId;
        return streamId;
      });
    }; // 结束视频预览


    var stopPreviewVideo = function stopPreviewVideo(streamId) {
      var id = streamId || state.localStreamId;
      return interactiveServer.stopStream(id).then(function () {
        setVideoNode("");
        return state.localStreamId;
      });
    };

    init();
    return {
      state: state,
      init: init,
      setVideoNode: setVideoNode,
      setSelectedVideoDeviceId: setSelectedVideoDeviceId,
      startPreviewVideo: startPreviewVideo,
      stopPreviewVideo: stopPreviewVideo,
      getDevices: interactiveServer.getDevices,
      getVideoConstraints: interactiveServer.getVideoConstraints
    };
  }

  function usePlayerServer() {
    var state = {
      playerInstance: null,
      isPlaying: false,
      markPoints: [],
      type: 'live',
      // live or vod
      voice: 60
    };
    var vhallSaasInstance = null;

    var init = function init(options) {
      var roomInitGroupServer = contextServer.get('roomInitGroupServer');
      vhallSaasInstance = roomInitGroupServer.state.vhallSaasInstance;
      return vhallSaasInstance.createPlayer(options).then(function (instance) {
        state.playerInstance = instance;
        state.markPoints = state.playerInstance.markPoints;
        return true;
      });
    };

    var setType = function setType() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'live';
      state.type = type;
    };

    var play = function play() {
      return state.playerInstance.play();
    };

    var pause = function pause() {
      return state.playerInstance.pause();
    };

    var isPause = function isPause() {
      return state.playerInstance.isPause();
    };

    var getQualitys = function getQualitys() {
      return state.playerInstance.getQualitys();
    };

    var getCurrentQuality = function getCurrentQuality() {
      return state.playerInstance.getCurrentQuality();
    };

    var setQuality = function setQuality() {
      return state.playerInstance.setQuality();
    };

    var enterFullScreen = function enterFullScreen() {
      return state.playerInstance.enterFullScreen();
    };

    var exitFullScreen = function exitFullScreen() {
      return state.playerInstance.exitFullScreen();
    };

    var setMute = function setMute() {
      return state.playerInstance.setMute();
    };

    var getVolume = function getVolume() {
      return state.playerInstance.getVolume();
    };

    var setVolume = function setVolume(val) {
      state.voice = val;
      return state.playerInstance.setVolume(val);
    };

    var getDuration = function getDuration() {
      var onFail = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      return state.playerInstance.getDuration(onFail);
    };

    var getCurrentTime = function getCurrentTime() {
      return state.playerInstance.getCurrentTime();
    };

    var setCurrentTime = function setCurrentTime(val) {
      return state.playerInstance.setCurrentTime(val);
    };

    var getUsableSpeed = function getUsableSpeed() {
      return state.playerInstance.getUsableSpeed();
    };

    var setPlaySpeed = function setPlaySpeed(val) {
      return state.playerInstance.setPlaySpeed(val);
    };

    var openControls = function openControls(status) {
      return state.playerInstance.openControls(status);
    };

    var openUI = function openUI(status) {
      return state.playerInstance.openUI(status);
    };

    var setResetVideo = function setResetVideo(val) {
      return state.playerInstance.setResetVideo(val);
    };

    var setBarrageInfo = function setBarrageInfo(val) {
      return state.playerInstance.setBarrageInfo(val);
    };

    var addBarrage = function addBarrage() {
      return state.playerInstance.addBarrage();
    };

    var toggleBarrage = function toggleBarrage() {
      return state.playerInstance.toggleBarrage();
    };

    var toggleSubtitle = function toggleSubtitle() {
      return state.playerInstance.toggleSubtitle();
    };

    var on = function on(type, cb) {
      state.playerInstance.$on(type, cb);
    };

    var emit = function emit(type, params) {
      state.playerInstance.$emit(type, params);
    };

    var destroy = function destroy() {};

    return {
      state: state,
      setType: setType,
      init: init,
      on: on,
      emit: emit,
      destroy: destroy,
      play: play,
      pause: pause,
      isPause: isPause,
      getQualitys: getQualitys,
      getCurrentQuality: getCurrentQuality,
      setQuality: setQuality,
      enterFullScreen: enterFullScreen,
      exitFullScreen: exitFullScreen,
      setMute: setMute,
      getVolume: getVolume,
      setVolume: setVolume,
      getDuration: getDuration,
      getCurrentTime: getCurrentTime,
      setCurrentTime: setCurrentTime,
      getUsableSpeed: getUsableSpeed,
      setPlaySpeed: setPlaySpeed,
      openControls: openControls,
      openUI: openUI,
      setResetVideo: setResetVideo,
      setBarrageInfo: setBarrageInfo,
      addBarrage: addBarrage,
      toggleBarrage: toggleBarrage,
      toggleSubtitle: toggleSubtitle
    };
  }

  requestApi.doc;
  function useDocServer() {
    var _ref2;

    var state = {
      docInstance: null
    };

    var on = function on(type, cb) {
      if (!state.docInstance) return;
      state.docInstance.$on(type, cb);
    };

    var destroy = function destroy() {
      return state.docInstance.destroy();
    };

    var init = function init(options) {
      var _contextServer$get = contextServer.get('roomInitGroupServer'),
          roomInitGroupServer = _contextServer$get.state;

      console.log('create doc', roomInitGroupServer.vhallSaasInstance.createDoc);
      return roomInitGroupServer.vhallSaasInstance.createDoc(options).then(function (instance) {
        state.docInstance = instance;
        return instance;
      })["catch"](function (e) {
        return e;
      });
    };

    var createBoard = function createBoard(options) {
      return state.docInstance.createBoard(options);
    };

    var createDocument = function createDocument(options) {
      return state.docInstance.createDocument(options);
    };

    var selectContainer = function selectContainer(option) {
      console.log('select container:', option);
      return state.docInstance.selectContainer(option);
    };

    var switchOnContainer = function switchOnContainer(val) {
      return state.docInstance.switchOnContainer(val);
    };

    var switchOffContainer = function switchOffContainer(val) {
      return state.docInstance.switchOffContainer(val);
    };

    var resetContainer = function resetContainer() {
      return state.docInstance.resetContainer();
    };

    var getContainerInfo = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", state.docInstance.getContainerInfo(options));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function getContainerInfo(_x) {
        return _ref.apply(this, arguments);
      };
    }();

    var destroyContainer = function destroyContainer(val) {
      return state.docInstance.destroyContainer(val);
    };

    var getVodAllCids = function getVodAllCids(val) {
      return state.docInstance.getVodAllCids(val);
    };

    var setRemoteData = function setRemoteData(item) {
      return state.docInstance.setRemoteData(item);
    };

    var zoomIn = function zoomIn() {
      return state.docInstance.zoomIn();
    };

    var zoomOut = function zoomOut() {
      return state.docInstance.zoomOut();
    };

    var zoomReset = function zoomReset() {
      return state.docInstance.zoomReset();
    };

    var cancelZoom = function cancelZoom() {
      return state.docInstance.cancelZoom();
    };

    var move = function move() {
      return state.docInstance.move();
    };

    var prevStep = function prevStep() {
      return state.docInstance.prevStep();
    };

    var nextStep = function nextStep() {
      return state.docInstance.nextStep();
    };

    var setPlayMode = function setPlayMode(mode) {
      return state.docInstance.setPlayMode(mode);
    };

    var setSize = function setSize(width, height, options) {
      return state.docInstance.setSize(width, height, options);
    };

    var createUUID = function createUUID(type) {
      return state.docInstance.createUUID(type);
    };

    var setControlStyle = function setControlStyle(style) {
      return state.docInstance.setControlStyle(style);
    };

    var gotoPage = function gotoPage(options) {
      return state.docInstance.gotoPage(options);
    };

    var setPen = function setPen(val) {
      return state.docInstance.setPen(val);
    };

    var setEraser = function setEraser(val) {
      return state.docInstance.setEraser(val);
    };

    var setStroke = function setStroke(options) {
      return state.docInstance.setStroke(options);
    };

    var setStrokeWidth = function setStrokeWidth(options) {
      return state.docInstance.setStrokeWidth(options);
    };

    var clear = function clear() {
      return state.docInstance.clear();
    };

    var cancelDrawable = function cancelDrawable() {
      return state.docInstance.cancelDrawable();
    };

    var setHighlighters = function setHighlighters() {
      return state.docInstance.setHighlighters();
    };

    var setText = function setText(val) {
      return state.docInstance.setText(val);
    };

    var loadDoc = function loadDoc(options) {
      return state.docInstance.loadDoc(options);
    };

    var start = function start(val, type) {
      return state.docInstance.start(val, type);
    };

    var republish = function republish() {
      return state.docInstance.republish();
    };

    var setRole = function setRole(role) {
      return state.docInstance.setRole(role);
    };

    var setAccountId = function setAccountId(role) {
      return state.docInstance.setAccountId(role);
    };

    var setEditable = function setEditable(editable) {
      return state.docInstance.setEditable(editable);
    };

    var getThumbnailList = function getThumbnailList(options) {
      return state.docInstance.getThumbnailList(options);
    }; // 获取文档列表(资料库所有文档)

    return _ref2 = {
      state: state,
      init: init,
      on: on,
      destroy: destroy,
      getVodAllCids: getVodAllCids,
      createBoard: createBoard,
      createDocument: createDocument,
      selectContainer: selectContainer,
      getContainerInfo: getContainerInfo,
      destroyContainer: destroyContainer
    }, _defineProperty(_ref2, "getVodAllCids", getVodAllCids), _defineProperty(_ref2, "setRemoteData", setRemoteData), _defineProperty(_ref2, "zoomIn", zoomIn), _defineProperty(_ref2, "zoomOut", zoomOut), _defineProperty(_ref2, "zoomReset", zoomReset), _defineProperty(_ref2, "move", move), _defineProperty(_ref2, "prevStep", prevStep), _defineProperty(_ref2, "nextStep", nextStep), _defineProperty(_ref2, "setPlayMode", setPlayMode), _defineProperty(_ref2, "setSize", setSize), _defineProperty(_ref2, "createUUID", createUUID), _defineProperty(_ref2, "setControlStyle", setControlStyle), _defineProperty(_ref2, "gotoPage", gotoPage), _defineProperty(_ref2, "cancelZoom", cancelZoom), _defineProperty(_ref2, "switchOnContainer", switchOnContainer), _defineProperty(_ref2, "switchOffContainer", switchOffContainer), _defineProperty(_ref2, "resetContainer", resetContainer), _defineProperty(_ref2, "setPen", setPen), _defineProperty(_ref2, "setEraser", setEraser), _defineProperty(_ref2, "setStroke", setStroke), _defineProperty(_ref2, "setStrokeWidth", setStrokeWidth), _defineProperty(_ref2, "clear", clear), _defineProperty(_ref2, "cancelDrawable", cancelDrawable), _defineProperty(_ref2, "setHighlighters", setHighlighters), _defineProperty(_ref2, "setText", setText), _defineProperty(_ref2, "loadDoc", loadDoc), _defineProperty(_ref2, "start", start), _defineProperty(_ref2, "republish", republish), _defineProperty(_ref2, "setRole", setRole), _defineProperty(_ref2, "setAccountId", setAccountId), _defineProperty(_ref2, "setEditable", setEditable), _defineProperty(_ref2, "getThumbnailList", getThumbnailList), _ref2;
  }

  function useEventEmitter() {
    var state = {
      eventMap: {}
    };

    var $on = function $on(eventName, callback) {
      var eventMap = state.eventMap;
      if (eventMap[eventName] === undefined) eventMap[eventName] = [];
      eventMap[eventName].push(callback);
    };

    var $emit = function $emit(eventName) {
      var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var eventMap = state.eventMap;
      if (!eventMap[eventName] || eventMap[eventName].length === 0) return;
      eventMap[eventName].forEach(function (eventCallback) {
        eventCallback(payload);
      });
    };

    var $off = function $off(eventName) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var eventMap = state.eventMap;

      if (callback === null) {
        eventMap[eventName] = [];
        return;
      }

      var index = eventMap[eventName].findIndex(function (cb) {
        return cb === callback;
      });
      index && eventMap[eventName].splice(index, 1);
    };

    var $destroy = function $destroy() {
      _readOnlyError("eventMap");
    };

    return {
      $on: $on,
      $emit: $emit,
      $off: $off,
      $destroy: $destroy
    };
  }

  function useRoomBaseServer() {
    var state = {
      inited: false,
      isLiveOver: false,
      webinarVo: {},
      watchInitData: {},
      watchInitErrorData: undefined,
      // 默认undefined，如果为其他值将触发特殊逻辑
      configList: {}
    };
    var eventEmitter = useEventEmitter(); // 初始化房间信息,包含发起/观看(嵌入/标品)

    var getWatchInitData = function getWatchInitData(options) {
      console.log(contextServer.get('useRoomInitGroupServer'));

      var _contextServer$get = contextServer.get('roomInitGroupServer'),
          roomInitGroupServer = _contextServer$get.state;

      console.log('init options:', roomInitGroupServer);
      return roomInitGroupServer.vhallSaasInstance.init(options).then(function (res) {
        if (res.code === 200) {
          state.inited = true;
          state.watchInitData = res.data;
          setRequestHeaders({
            'interact-token': res.data.interact.interact_token
          });
        } else {
          state.watchInitErrorData = res;
        }

        return res;
      });
    };

    var on = function on(type, cb) {
      eventEmitter.$on(type, cb);
    };

    var destroy = function destroy() {
      eventEmitter.$destroy();
    }; // 获取活动信息


    var getWebinarInfo = function getWebinarInfo(data) {
      return requestApi.roomBase.getWebinarInfo(data).then(function (res) {
        state.webinarVo = res.data;
        return res;
      });
    }; // 获取房间权限配置列表


    var getConfigList = function getConfigList(data) {
      return requestApi.roomBase.getConfigList(data).then(function (res) {
        state.configList = JSON.parse(res.data.permissions);
        return res;
      });
    }; // 设置设备检测状态


    var setDevice = function setDevice(data) {
      return requestApi.roomBase.setDevice(data).then(function (res) {
        return res;
      });
    }; // 开播startLive


    var startLive = function startLive() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      setDevice(data);
      return requestApi.live.startLive(data);
    }; // 结束直播


    var endLive = function endLive(data) {
      return requestApi.live.endLive(data);
    }; // 开始/恢复录制


    var startRecord = function startRecord() {
      return requestApi.roomBase.recordApi({
        status: 1
      });
    }; // 暂停录制


    var pauseRecord = function pauseRecord() {
      return requestApi.roomBase.recordApi({
        status: 2
      });
    }; // 结束录制


    var endRecord = function endRecord() {
      return requestApi.roomBase.recordApi({
        status: 3
      });
    };

    var init = function init(option) {
      return getWatchInitData(option);
    };

    return {
      state: state,
      init: init,
      on: on,
      destroy: destroy,
      getWatchInitData: getWatchInitData,
      getWebinarInfo: getWebinarInfo,
      getConfigList: getConfigList,
      startLive: startLive,
      endLive: endLive,
      setDevice: setDevice,
      startRecord: startRecord,
      pauseRecord: pauseRecord,
      endRecord: endRecord
    };
  }

  function useUserServer() {
    var state = {}; // 验证码登录&&账号登录

    var loginInfo = function loginInfo(data) {
      return requestApi.user.loginInfo(data);
    }; // 第三方授权


    var callbackUserInfo = function callbackUserInfo(data) {
      return requestApi.user.callbackUserInfo(data);
    }; // 注册


    var register = function register(data) {
      return requestApi.user.register(data);
    }; // 手机||邮箱验证码


    var codeCheck = function codeCheck(data) {
      return requestApi.user.codeCheck(data);
    }; // 密码重置


    var resetPassword = function resetPassword(data) {
      return requestApi.user.resetPassword(data);
    };

    return {
      state: state,
      loginInfo: loginInfo,
      callbackUserInfo: callbackUserInfo,
      register: register,
      codeCheck: codeCheck,
      resetPassword: resetPassword
    };
  }

  function useVirtualClientStartServe() {
    var state = {
      preson: {
        pv: '',
        basePv: '',
        baseTime: '',
        onlineNum: '',
        baseOnlineNum: ''
      },
      addCount: ''
    };

    var virtualClientStart = function virtualClientStart(data) {
      return requestApi.virtualClient.virtualClientStart(data);
    };

    var virtualAccumulation = function virtualAccumulation(data) {
      return requestApi.virtualClient.virtualAccumulation(data);
    };

    var virtualClientGet = function virtualClientGet(data) {
      var http = requestApi.virtualClient.virtualClientGet(data);
      http.then(function (res) {
        console.log('请求成功！！！！！');
        state.preson.pv = res.data.pv;
        state.preson.basePv = res.data.base_pv;
        state.preson.baseTime = res.data.base_time;
        state.addCount = res.data.base_time;
        state.preson.onlineNum = res.data.online;
        state.preson.baseOnlineNum = res.data.base_online;
      });
      return http;
    };

    return {
      state: state,
      virtualClientStart: virtualClientStart,
      virtualAccumulation: virtualAccumulation,
      virtualClientGet: virtualClientGet
    };
  }

  function useInsertFileServer() {
    var _this = this;

    var state = {
      localInsertStream: null,
      isChrome88: isChrome88()
    };
    var interactiveServer = contextServer.get('interactiveServer'); // 注册插播流加入事件

    var onInsertFileStreamAdd = function onInsertFileStreamAdd(cb) {
      interactiveServer.on('interactive_REMOTESTREAM_ADD', function (e) {
        e.data.attributes = JSON.parse(e.data.attributes);

        if (e.data.attributes.stream_type == 4 || e.data.streamType == 4) {
          cb(e);
        }
      });
    }; // 注册插播流删除事件


    var onInsertFileStreamDelete = function onInsertFileStreamDelete(cb) {
      interactiveServer.on('interactive_REMOTESTREAM_REMOVED', function (e) {
        cb(e);
      });
    }; // 插播流订阅失败


    var onInsertFileStreamFaild = function onInsertFileStreamFaild(cb) {
      interactiveServer.on('interactive_REMOTESTREAM_FAILED', function (e) {
        cb(e);
      });
    }; // 获取插播列表


    var getInsertFileList = function getInsertFileList() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.insertFile.getInsertFileList(params);
    }; // 删除插播文件


    var deleteInsertFile = function deleteInsertFile() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.insertFile.deleteInsertFile(params);
    }; // 检查captureStream是否能用


    var isCanUseCaptureStream = function isCanUseCaptureStream() {
      var v = document.createElement('video');

      if (typeof v.captureStream !== 'function') {
        return false;
      }

      return true;
    }; // 选择音视频文件


    var selectLocalFile = function selectLocalFile() {
      var onChange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (e) {};

      var _contextServer$get = contextServer.get('roomBaseServer'),
          roomBaseState = _contextServer$get.state;

      var accept = 'video/mp4,video/webm,audio/ogg';

      if (roomBaseState.watchInitData.webinar.mode == 1) {
        // 直播模式：1-音频、2-视频、3-互动
        accept = 'audio/ogg';
      }

      var retParams = {
        accept: accept
      };
      uploadFile(retParams, onChange);
    }; // 创建video标签播放本地音视频文件


    var createLocalVideoElement = function createLocalVideoElement(file) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return new Promise(function (resolve, reject) {
        state._isAudio = file.type.includes('ogg');
        var videoElement = document.createElement('video');
        state._videoElement = videoElement;
        videoElement.setAttribute("width", "100%");
        videoElement.setAttribute("height", "100%");
        var windowURL = window.URL || window.webkitURL;
        var fileUrl = windowURL.createObjectURL(file);
        videoElement.src = fileUrl;

        videoElement.onload = function () {
          windowURL.revokeObjectURL(fileUrl);
        };

        var videoContainerElement = document.getElementById(options.el);
        videoContainerElement.innerHTML = '';
        videoContainerElement.appendChild(videoElement);
        videoElement.addEventListener('canplay', function (e) {
          setTimeout(function () {
            console.log(videoElement.videoHeight, videoElement.videoWidth, '分辨率', videoElement.videoHeight > 720 || videoElement.videoWidth > 1280);

            if (videoElement.videoHeight > 720 || videoElement.videoWidth > 1281) {
              reject({
                msg: '视频分辨率过高，请打开分辨率为1280*720以下的视频'
              });
            } else {
              resolve(videoElement);
            }
          }, 100);
        });
      });
    }; // 使用canvas抓流


    var captureStreamByCanvas = function captureStreamByCanvas() {
      var videoElement = state._videoElement;
      var chrome88Canvas = document.createElement('canvas');
      var chrome88canvasContext = chrome88Canvas.getContext('2d'); // 将video播放器的画面绘制至canvas上

      clearInterval(state._canvasInterval);

      function drawVideoCanvas() {
        chrome88canvasContext.drawImage(videoElement, 0, 0, chrome88Canvas.width, chrome88Canvas.height);
      }

      chrome88Canvas.width = videoElement.videoWidth;
      chrome88Canvas.height = videoElement.videoHeight;
      drawVideoCanvas();
      state._canvasInterval = setInterval(drawVideoCanvas, 40); // 从canvas中抓取MediaStream

      var canvasStream = chrome88Canvas.captureStream(); // 从video播放器中抓取MediaStream

      var vodCpatureStream = videoElement.captureStream(); // audio track 从[video播放器抓取MediaStream对象]中获取

      var audioTrack = vodCpatureStream.getAudioTracks()[0]; // video track 从[canvas抓取MediaStream对象]中获取

      var videoTrack = canvasStream.getVideoTracks()[0];
      return {
        audioTrack: audioTrack,
        videoTrack: videoTrack
      };
    }; // 使用videoElement抓流


    var captureStreamByVideo = function captureStreamByVideo() {
      var videoStream;
      var videoElement = state._videoElement;

      if (videoElement.captureStream) {
        videoStream = videoElement.captureStream();

        if (!videoStream) {
          return false;
        }

        if (videoStream.getTracks().length < 1) {
          return false;
        }

        return videoStream;
      }
    }; // 抓取本地音视频轨道


    var captureLocalStream = function captureLocalStream() {
      if (state.isChrome88 && !state._isAudio) {
        return captureStreamByCanvas();
      } else {
        return captureStreamByVideo();
      }
    }; // 创建本地插播流


    var createLocalInsertStream = function createLocalInsertStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var retSteram = captureLocalStream();

      var _contextServer$get2 = contextServer.get('roomBaseServer'),
          roomBaseServerState = _contextServer$get2.state;

      var retOptions = {
        videoNode: options.videoNode,
        // 传入本地互动流的显示容器，必填
        audio: false,
        video: false,
        profile: VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H,
        // 默认1080p，后续sdk会做优化，自动识别视频清晰度
        attributes: JSON.stringify({
          role: roomBaseServerState.watchInitData.join_info.role_name,
          nickname: roomBaseServerState.watchInitData.join_info.nickname,
          stream_type: 4,
          has_video: state._isAudio ? 0 : 1
        }),
        streamType: 4
      };

      if (state.isChrome88 && !state._isAudio) {
        retOptions = _objectSpread2(_objectSpread2({}, retOptions), {}, {
          audioTrack: retSteram.audioTrack,
          // 音频轨道
          videoTrack: retSteram.videoTrack // 视频轨道

        });
      } else {
        retOptions = _objectSpread2(_objectSpread2({}, retOptions), {}, {
          mixOption: {
            // 选填，指定此本地流的音频和视频是否加入旁路混流。支持版本：2.3.2及以上。
            mixVideo: state._isAudio ? false : true,
            // 视频是否加入旁路混流
            mixAudio: true // 音频是否加入旁路混流

          },
          hasInsertedStream: true,
          // 使用外部插入的MediaStream流对象
          insertedStream: retSteram // 在上一步已抓取的MediaStream流对象

        });
      }

      var interactiveServer = contextServer.get('interactiveServer');
      console.log('interactiveServer', interactiveServer);
      return interactiveServer.createLocalStream(retOptions);
    }; // 推插播流


    var publishInsertStream = function publishInsertStream(stream) {
      var interactiveServer = contextServer.get('interactiveServer');
      return new Promise(function (resolve, reject) {
        interactiveServer.publishStream({
          streamId: stream.streamId
        }).then(function (res) {
          state._LoclaStreamId = res.streamId;
          resolve(res);
        })["catch"](reject);
      });
    }; // 停止推流


    var stopPublishInsertStream = function stopPublishInsertStream(streamId) {
      return new Promise(function (resolve, reject) {
        var interactiveServer = contextServer.get('interactiveServer');
        console.log('stopPublishInsertStream', streamId);
        interactiveServer.unpublishStream(streamId || _this._LoclaStreamId).then(function (res) {
          state._LoclaStreamId = null;
          resolve(res);
        })["catch"](reject);
      });
    }; // 订阅插播流


    var subscribeInsertStream = function subscribeInsertStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var interactiveServer = contextServer.get('interactiveServer');
      return interactiveServer.subscribeStream(options);
    }; // 取消订阅流


    var unsubscribeInsertStream = function unsubscribeInsertStream() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var interactiveServer = contextServer.get('interactiveServer');
      return interactiveServer.unSubscribeStream(options);
    };

    return {
      state: state,
      getInsertFileList: getInsertFileList,
      deleteInsertFile: deleteInsertFile,
      isCanUseCaptureStream: isCanUseCaptureStream,
      selectLocalFile: selectLocalFile,
      createLocalVideoElement: createLocalVideoElement,
      createLocalInsertStream: createLocalInsertStream,
      publishInsertStream: publishInsertStream,
      stopPublishInsertStream: stopPublishInsertStream,
      subscribeInsertStream: subscribeInsertStream,
      unsubscribeInsertStream: unsubscribeInsertStream,
      onInsertFileStreamAdd: onInsertFileStreamAdd,
      onInsertFileStreamDelete: onInsertFileStreamDelete,
      onInsertFileStreamFaild: onInsertFileStreamFaild
    };
  }

  function useMicServer() {
    var state = {}; // 上麦

    var speakOn = function speakOn() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.speakOn(data);
    }; // 下麦


    var speakOff = function speakOff() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.speakOff(data);
    };

    var speakUserOff = function speakUserOff() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.interactive.speakUserOff(data);
    }; // 允许举手


    var setHandsup = function setHandsup() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.setHandsUp(data);
    }; // 允许上麦


    var allowSpeak = function allowSpeak() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.allowSpeak(data);
    }; // 邀请上麦


    var inviteMic = function inviteMic() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.inviteMic(data);
    }; // 取消申请


    var cancelApply = function cancelApply() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.cancelApply(data);
    }; // 拒绝邀请


    var refuseInvite = function refuseInvite() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestApi.mic.refuseInvite(data);
    };

    return {
      state: state,
      speakOn: speakOn,
      speakOff: speakOff,
      speakUserOff: speakUserOff,
      allowSpeak: allowSpeak,
      setHandsup: setHandsup,
      inviteMic: inviteMic,
      cancelApply: cancelApply,
      refuseInvite: refuseInvite
    };
  }

  function useRoomInitGroupServer() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var state = {
      bizId: options.biz_id || 2,
      // 区分 端（知客/直播） 2-直播 4-知客
      vhallSaasInstance: null,
      live_token: null
    };
    var roomBaseServer = useRoomBaseServer();
    var msgServer = useMsgServer();
    var interactiveServer = useInteractiveServer();
    var micServer = useMicServer();
    setTimeout(function () {
      contextServer.set('roomBaseServer', roomBaseServer);
      contextServer.set('msgServer', msgServer);
      contextServer.set('interactiveServer', interactiveServer);
      contextServer.set('micServer', micServer);
    }, 100);

    var reload = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                msgServer.destroy();
                _context.next = 3;
                return msgServer.init();

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function reload() {
        return _ref.apply(this, arguments);
      };
    }();

    var setRequestConfig = function setRequestConfig(options) {
      setToken(options.token, options.liveToken);

      if (options.requestHeaders) {
        setRequestHeaders(options.requestHeaders);
      }
    };

    var initSdk = function initSdk() {
      return new Promise(function (resolve, reject) {
        state.vhallSaasInstance = new window.VhallSaasSDK();
        addToContext();
        resolve();
      });
    };

    var initSendLive = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var customOptions,
            defaultOptions,
            options,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                customOptions = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};
                _context2.next = 3;
                return initSdk();

              case 3:
                defaultOptions = {
                  clientType: 'send',
                  development: true,
                  requestHeaders: {
                    platform: 7
                  }
                };

                if (customOptions.liveToken) {
                  state.live_token = customOptions.liveToken;
                }

                options = Object.assign({}, defaultOptions, customOptions);
                setRequestConfig(options);
                _context2.next = 9;
                return roomBaseServer.init(options);

              case 9:
                _context2.next = 11;
                return roomBaseServer.getWebinarInfo();

              case 11:
                _context2.next = 13;
                return roomBaseServer.getConfigList();

              case 13:
                _context2.next = 15;
                return msgServer.init();

              case 15:
                _context2.next = 17;
                return interactiveServer.init();

              case 17:
                return _context2.abrupt("return", true);

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function initSendLive() {
        return _ref2.apply(this, arguments);
      };
    }();

    var initReceiveLive = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var customOptions,
            defaultOptions,
            options,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                customOptions = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {};
                initSdk();
                defaultOptions = {
                  clientType: 'receive',
                  development: true,
                  requestHeaders: {
                    platform: 7
                  },
                  receiveType: 'standard'
                };
                options = Object.assign({}, defaultOptions, customOptions);
                setRequestConfig(options);
                _context3.next = 7;
                return roomBaseServer.init(options);

              case 7:
                _context3.next = 9;
                return roomBaseServer.getWebinarInfo();

              case 9:
                _context3.next = 11;
                return roomBaseServer.getConfigList();

              case 11:
                _context3.next = 13;
                return msgServer.init();

              case 13:
                _context3.next = 15;
                return interactiveServer.init();

              case 15:
                return _context3.abrupt("return", true);

              case 16:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function initReceiveLive() {
        return _ref3.apply(this, arguments);
      };
    }();

    var result = {
      state: state,
      roomBaseServer: roomBaseServer,
      msgServer: msgServer,
      interactiveServer: interactiveServer,
      reload: reload,
      initSendLive: initSendLive,
      initReceiveLive: initReceiveLive
    };

    function addToContext() {
      contextServer.set('roomInitGroupServer', result);
    }

    return result;
  }

  function useDesktopShareServer() {
    var state = {
      localDesktopStreamId: ''
    };
    var interactiveServer = contextServer.get('interactiveServer'); //检测浏览器是否支持桌面共享

    var browserDetection = function browserDetection() {
      var ua = navigator.userAgent;
      var chromeTest = ua.match(/chrome\/([\d\.]+)/i);
      var chromeVersion = chromeTest ? chromeTest[1] : 0;
      var safariTest = ua.match(/Version\/([\d.]+).*Safari/);
      var safariVersion = safariTest ? safariTest[1].replace(/\./g, '') : 0; //浏览器是否支持桌面共享

      var isNotSupport = !chromeVersion && (!safariVersion || Number(safariVersion) < 1304); //浏览器是否版本过低，需要安装插件支持

      var needInstallPlugin = Number(chromeVersion) < 74;
      return {
        isNotSupport: isNotSupport,
        needInstallPlugin: needInstallPlugin,
        chromeTest: chromeTest,
        chromeVersion: chromeVersion,
        safariTest: safariTest,
        safariVersion: safariVersion
      };
    }; //分享屏幕检测


    var shareScreenCheck = function shareScreenCheck() {
      return new Promise(function (resolve, reject) {
        interactiveServer.checkSystemRequirements().then(function (checkResult) {
          console.log('result', checkResult, checkResult.result, 'detail', checkResult.detail);

          if (checkResult.result || checkResult.detail.isScreenShareSupported) {
            resolve(true);
          } else {
            reject(false);
          }
        });
      });
    }; // 开始桌面共享


    var startShareScreen = function startShareScreen(options) {
      var _contextServer$get = contextServer.get('roomBaseServer'),
          roomBaseServerState = _contextServer$get.state;

      var retOptions = {
        videoNode: options.videoNode,
        profile: options.profile,
        audio: false,
        // 桌面共享不采集麦克风防止回声
        speaker: true // 桌面共享开启采集扬声器声音的入口

      };
      var addConfig = {
        videoDevice: 'desktopScreen',
        attributes: JSON.stringify({
          nickName: roomBaseServerState.watchInitData.join_info.nickname,
          role: roomBaseServerState.watchInitData.join_info.role_name
        })
      };
      return interactiveServer.createLocaldesktopStream(retOptions, addConfig);
    }; // 推桌面共享流


    var publishDesktopShareStream = function publishDesktopShareStream(streamId) {
      return new Promise(function (resolve, reject) {
        interactiveServer.publishStream({
          streamId: streamId
        }).then(function (res) {
          state.localDesktopStreamId = streamId;
          resolve(res);
        })["catch"](reject);
      });
    };
    /**
     * 停止桌面共享
     * */


    var stopShareScreen = function stopShareScreen(streamId) {
      return interactiveServer.unpublishStream(streamId || state.localDesktopStreamId);
    };

    return {
      state: state,
      browserDetection: browserDetection,
      shareScreenCheck: shareScreenCheck,
      startShareScreen: startShareScreen,
      publishDesktopShareStream: publishDesktopShareStream,
      stopShareScreen: stopShareScreen
    };
  }

  // import { emojiUrl } from './config.js'
  var emojiUrl = 'https://cnstatic01.e.vhall.com/static/img/arclist';

  var faceArr = {
    '[微笑]': '1',
    '[撇嘴]': '2',
    '[色]': '3',
    '[发呆]': '4',
    '[得意]': '5',
    '[流泪]': '6',
    '[害羞]': '7',
    '[闭嘴]': '8',
    '[睡]': '9',
    '[哭]': '10',
    '[尴尬]': '11',
    '[发怒]': '12',
    '[调皮]': '13',
    '[呲牙]': '14',
    '[惊讶]': '15',
    '[难过]': '16',
    '[酷]': '17',
    '[汗]': '18',
    '[抓狂]': '19',
    '[吐]': '20',
    '[偷笑]': '21',
    '[愉快]': '22',
    '[白眼]': '23',
    '[傲慢]': '24',
    '[饥饿]': '25',
    '[困]': '26',
    '[惊恐]': '27',
    '[流汗]': '28',
    '[憨笑]': '29',
    '[悠闲]': '30',
    '[奋斗]': '31',
    '[咒骂]': '32',
    '[疑问]': '33',
    '[嘘]': '34',
    '[晕]': '35',
    '[疯了]': '36',
    '[衰]': '37',
    '[骷髅]': '38',
    '[敲打]': '39',
    '[再见]': '40',
    '[擦汗]': '41',
    '[抠鼻]': '42',
    '[鼓掌]': '43',
    '[糗大了]': '44',
    '[坏笑]': '45',
    '[左哼哼]': '46',
    '[右哼哼]': '47',
    '[哈欠]': '48',
    '[鄙视]': '49',
    '[委屈]': '50',
    '[快哭了]': '51',
    '[阴险]': '52',
    '[亲亲]': '53',
    '[吓]': '54',
    '[可怜]': '55',
    '[菜刀]': '56',
    '[西瓜]': '57',
    '[啤酒]': '58',
    '[篮球]': '59',
    '[乒乓]': '60',
    '[咖啡]': '61',
    '[饭]': '62',
    '[猪头]': '63',
    '[玫瑰]': '64',
    '[凋谢]': '65',
    '[嘴唇]': '66',
    '[爱心]': '67',
    '[心碎]': '68',
    '[蛋糕]': '69',
    '[闪电]': '70',
    '[炸弹]': '71',
    '[刀]': '72',
    '[足球]': '73',
    '[瓢虫]': '74',
    '[便便]': '75',
    '[月亮]': '76',
    '[太阳]': '77',
    '[礼物]': '78',
    '[拥抱]': '79',
    '[强]': '80',
    '[弱]': '81',
    '[握手]': '82',
    '[胜利]': '83',
    '[抱拳]': '84',
    '[勾引]': '85',
    '[拳头]': '86',
    '[差劲]': '87',
    '[爱你]': '88',
    '[NO]': '89',
    '[OK]': '90'
  };

  var textToEmoji = function textToEmoji(s) {
    s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>'); // eslint-disable-next-line no-useless-escape

    var reg = /\[[^\[\]]+?\]/g;
    var ret = [];
    var textArr = s.split(reg); // 字符串分割，返回一个数组

    var emojiArr = s.match(reg); // 返回一个数组，成员是所有匹配的子字符串
    // 文字与表情 轮流添加到a
    // textArr 的长度 永远比 emojiArr 大 1
    // 当然 emojiArr 可能为 null，此时 textArr 长度为 1，成员即为原始字符串

    textArr.forEach(function (cont, i) {
      // 当文字内容不为空 添加到a
      cont && ret.push({
        msgType: 'text',
        msgCont: cont
      }); // 最后一次循环，肯定没有表情与之对应，所以忽略
      // 如果不是最后一次，添加表情到a
      // 当然此处还需判断是否有此表情的图片定义

      if (i !== textArr.length - 1) {
        if (faceArr[emojiArr[i]]) {
          ret.push({
            msgType: 'emoji',
            msgCont: emojiArr[i],
            msgImage: emojiToPath(emojiArr[i])
          });
        } else {
          ret.push({
            msgType: 'text',
            msgCont: emojiArr[i]
          });
        }
      } // i !== textArr.length - 1 &&
      //   ret.push(
      //     faceArr[emojiArr[i]]
      //       ? {
      //           msgType: 'emoji',
      //           msgCont: emojiArr[i],
      //           msgImage: emojiToPath(emojiArr[i])
      //         }
      //       : {
      //           msgType: 'text',
      //           msgCont: emojiArr[i]
      //         }
      //   )

    });
    return ret;
  };


  function combinationStr(arr) {
    var result = '';
    arr.forEach(function (item) {
      var str = item.msgType === 'text' ? item.msgCont : "<img width=\"24\" height=\"24\" style=\"vertical-align:text-bottom;\" src=\"".concat(item.msgImage, "\"/>");
      result += str;
    });
    return result;
  }

  function textToEmojiText(str) {
    var arr = textToEmoji(str);
    var result = combinationStr(arr);
    return result;
  }

  var emojiToPath = function emojiToPath(key) {
    return key.includes('[删除]') ? "".concat(emojiUrl, "/").concat(faceArr[key], "@2x.png") : "".concat(emojiUrl, "/Expression_").concat(faceArr[key], "@2x.png");
  };

  var count = 0;

  var Msg = function Msg(_ref) {
    var _ref$avatar = _ref.avatar,
        avatar = _ref$avatar === void 0 ? '' : _ref$avatar,
        _ref$sendId = _ref.sendId,
        sendId = _ref$sendId === void 0 ? '' : _ref$sendId,
        _ref$nickName = _ref.nickName,
        nickName = _ref$nickName === void 0 ? '' : _ref$nickName,
        _ref$type = _ref.type,
        type = _ref$type === void 0 ? 'text' : _ref$type,
        _ref$showTime = _ref.showTime,
        showTime = _ref$showTime === void 0 ? '' : _ref$showTime,
        _ref$roleName = _ref.roleName,
        roleName = _ref$roleName === void 0 ? '' : _ref$roleName,
        _ref$content = _ref.content,
        content = _ref$content === void 0 ? {} : _ref$content,
        _ref$sendTime = _ref.sendTime,
        sendTime = _ref$sendTime === void 0 ? '' : _ref$sendTime,
        _ref$client = _ref.client,
        client = _ref$client === void 0 ? '' : _ref$client,
        _ref$self = _ref.self,
        self = _ref$self === void 0 ? false : _ref$self,
        _ref$replyMsg = _ref.replyMsg,
        replyMsg = _ref$replyMsg === void 0 ? {} : _ref$replyMsg,
        _ref$atList = _ref.atList,
        atList = _ref$atList === void 0 ? [] : _ref$atList,
        _ref$context = _ref.context,
        context = _ref$context === void 0 ? {} : _ref$context,
        _ref$source = _ref.source,
        source = _ref$source === void 0 ? 'mobile' : _ref$source;

    _classCallCheck(this, Msg);

    // 用户id
    this.type = type;
    this.avatar = avatar;
    this.sendId = sendId;
    this.nickName = nickName;
    this.roleName = roleName;
    this.content = content;
    this.showTime = showTime;
    this.sendTime = sendTime;
    this.client = client;
    this.count = count++;
    this.self = self;
    this.replyMsg = replyMsg;
    this.atList = atList;
    this.context = context;
    this.source = source;
  };

  function useChatServer() {
    var state = {
      //聊天记录
      chatList: [],
      //过滤的敏感词列表
      keywordList: [],
      //预览图片地址
      imgUrls: [],
      page: 0,
      limit: 10,
      roomId: '',
      avatar: '',
      roleName: ''
    }; //消息服务

    var msgServer = contextServer.get('msgServer'); //消息sdk

    var msgInstance = msgServer.state.msgInstance; //基础服务

    var roomServer = contextServer.get('roomBaseServer');
    var _roomServer$state$wat = roomServer.state.watchInitData,
        _roomServer$state$wat2 = _roomServer$state$wat.roomId,
        roomId = _roomServer$state$wat2 === void 0 ? '' : _roomServer$state$wat2;
        _roomServer$state$wat.roleName;
        _roomServer$state$wat.avatar;
   //接收聊天消息

    var getHistoryMsg = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _state$chatList;

        var params,
            from,
            backData,
            list,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                params = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
                from = _args.length > 1 && _args[1] !== undefined ? _args[1] : '观看端';
                _context.next = 4;
                return fetchHistoryData(params);

              case 4:
                backData = _context.sent;
                list = (backData.data.list || []).map(function (item) {
                  //处理普通内容
                  item.data.text_content && (item.data.text_content = textToEmojiText(item.data.text_content)); //处理图片预览

                  item.data.image_urls && _handleImgUrl(item.data.image_urls); //处理私聊列表

                  if (item.context && Array.isArray(item.context.at_list) && item.context.at_list.length && item.data.text_content) {
                    item.context.at_list = _handlePrivateChatList(item, item.context.at_list); //发起端的特殊处理，可以考虑统一

                    item.context.atList = item.context.at_list;
                  } //格式化消息


                  return _handleGenerateMsg(item, from);
                }).reduce(function (acc, curr) {
                  var showTime = curr.showTime;
                  acc.some(function (s) {
                    return s.showTime === showTime;
                  }) ? acc.push(_objectSpread2(_objectSpread2({}, curr), {}, {
                    showTime: ''
                  })) : acc.push(curr);
                  return acc;
                }, []).reverse().filter(function (item) {
                  return !['customPraise'].includes(item.type);
                });

                if (['观看端'].includes(from)) {
                  list.forEach(function (msg, index) {
                    if (index !== 0) {
                      var preMsgTime = list[index - 1].sendTime;

                      if (preMsgTime.slice(0, 13) === msg.sendTime.slice(0, 13)) {
                        msg.showTime = '';
                      }
                    }
                  });
                }

                (_state$chatList = state.chatList).unshift.apply(_state$chatList, _toConsumableArray(list)); //返回原始数据等以方便使用


                return _context.abrupt("return", {
                  backData: backData,
                  list: list,
                  chatList: state.chatList,
                  imgUrls: state.imgUrls || []
                });

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function getHistoryMsg() {
        return _ref.apply(this, arguments);
      };
    }(); //发送聊天消息


    var sendMsg = function sendMsg() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      params.inputValue;
          params.needFilter;
          var _params$data = params.data,
          data = _params$data === void 0 ? {} : _params$data,
          _params$context = params.context,
          context = _params$context === void 0 ? {} : _params$context; // let filterStatus = checkHasKeyword(needFilter, inputValue);
      // return new Promise((resolve, reject) => {
      //     if (roleName != 2 || (roleName == 2 && filterStatus)) {
      //         msgServer.$emit(data, context);
      //         resolve();
      //     } else {
      //         reject();
      //     }
      // });

      return new Promise(function (resolve, reject) {
        msgInstance.emitTextChat(data, context);
        resolve();
      });
    }; //发起请求，或者聊天记录数据


    var fetchHistoryData = function fetchHistoryData(params) {
      var defaultParams = {
        room_id: roomId,
        pos: state.page * state.limit,
        limit: state.limit
      };
      var mixedParams = Object.assign({}, defaultParams, params);
      return $fetch({
        url: '/v3/interacts/chat/get-list',
        type: 'POST',
        data: mixedParams
      });
    }; //获取keywordList


    var setKeywordList = function setKeywordList() {
      var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      state.keywordList = list;
    }; //检测是否包含敏感词


    var checkHasKeyword = function checkHasKeyword() {
      var needFilter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var inputValue = arguments.length > 1 ? arguments[1] : undefined;
      var filterStatus = true;

      if (needFilter && state.keywordList.length) {
        //只要找到一个敏感词，消息就不让发
        filterStatus = !state.keywordList.some(function (item) {
          return inputValue.includes(item.name);
        });
      }

      return filterStatus;
    }; //私有方法，处理图片链接


    var _handleImgUrl = function _handleImgUrl(rawData) {
      var _state$imgUrls;

      (_state$imgUrls = state.imgUrls).push.apply(_state$imgUrls, _toConsumableArray(rawData));
    }; //私有方法，处理私聊列表


    var _handlePrivateChatList = function _handlePrivateChatList(item) {
      var list = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var from = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '观看端';

      if (['观看端'].includes(from)) {
        return list.map(function (a) {
          item.data.text_content = item.data.text_content.replace("***".concat(a.nick_name), "@".concat(a.nick_name));
          return a;
        });
      }

      if (['h5'].includes(from)) {
        return list.map(function (a) {
          // 向前兼容fix 14968  历史消息有得是@
          if (item.data.text_content.indexOf('***') >= 0) {
            item.data.text_content = item.data.text_content.replace("***".concat(a.nick_name), "<span style='color:#4da1ff;float:left'>@".concat(a.nick_name, " &nbsp;</span> "));
          } else {
            item.data.text_content = item.data.text_content.replace("@".concat(a.nick_name), "<span style='color:#4da1ff;float:left'>@".concat(a.nick_name, " &nbsp;</span> "));
          }

          return a;
        });
      }
    }; //私有方法，组装消息（暂时按照的h5版本的,大致数据一致，具体业务逻辑操作有差异，后续返回一个promise，并返回未处理的原始数据，由视图自己决定如何处理）


    var _handleGenerateMsg = function _handleGenerateMsg() {
      var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var params = {};

      if (['观看端', '发起端'].includes(from)) {
        params = {
          type: item.data.type,
          avatar: item.avatar ? item.avatar : '',
          sendId: item.sender_id,
          showTime: item.showTime,
          nickName: item.nickname,
          roleName: item.role_name,
          sendTime: item.date_time,
          content: item.data,
          replyMsg: item.context.reply_msg,
          atList: item.context.atList,
          msgId: item.msg_id,
          channel: item.channel_id,
          isHistoryMsg: true
        };

        if (['发起端'].includes(from) && params.avatar === '') {
          params.avatar = 'https://cnstatic01.e.vhall.com/3rdlibs/vhall-static/img/default_avatar.png';
        }
      }

      if (['h5'].includes(from)) {
        params = {
          type: item.data.type,
          avatar: item.avatar ? item.avatar : defaultAvatar,
          sendId: item.sender_id,
          showTime: item.show_time,
          nickName: item.nickname,
          roleName: item.role_name,
          sendTime: item.date_time,
          content: item.data,
          context: item.context,
          replyMsg: item.context.reply_msg,
          atList: item.context.at_list
        };
      }

      var resultMsg = new Msg(params);

      if (item.data.event_type) {
        resultMsg = _objectSpread2(_objectSpread2({}, resultMsg), {}, {
          type: item.data.event_type,
          event_type: item.data.event_type,
          content: {
            source_status: item.data.source_status,
            gift_name: item.data.gift_name,
            gift_url: item.data.gift_url
          }
        });

        if (['观看端'].includes(from)) {
          resultMsg.nickName = item.nickname.length > 8 ? item.nickname.substr(0, 8) + '...' : item.nickname;
          resultMsg.interactToolsStatus = true;
        }
      }

      return resultMsg;
    };

    return {
      state: state,
      getHistoryMsg: getHistoryMsg,
      sendMsg: sendMsg,
      fetchHistoryData: fetchHistoryData,
      setKeywordList: setKeywordList,
      checkHasKeyword: checkHasKeyword
    };
  }

  function useNoticeServer() {
    var state = {
      //公告列表
      noticeList: [],
      //请求的分页参数
      pageInfo: {
        pos: 0,
        limit: 10,
        pageNum: 1
      },
      //总页数
      totalPages: 1,
      //总条数
      total: 0
    };
    var roomServer = contextServer.get('roomBaseServer');
    var _roomServer$state$wat = roomServer.state.watchInitData;
        _roomServer$state$wat.roomId;
        _roomServer$state$wat.channelId;
   //从服务器获取消息记录

    var fetchNoticeList = function fetchNoticeList(params) {
      return $fetch({
        url: '/v3/interacts/chat/get-announcement-list',
        type: 'POST',
        data: params
      });
    }; //获取消息记录


    var getNoticeList = function getNoticeList(_ref) {
      var _ref$flag = _ref.flag,
          flag = _ref$flag === void 0 ? false : _ref$flag,
          _ref$params = _ref.params,
          params = _ref$params === void 0 ? {} : _ref$params;

      if (!flag) {
        state.noticeList = [];
        state.pageInfo = {
          pos: 0,
          limit: 10,
          pageNum: 1
        };
        state.totalPages = 1;
        state.total = 0;
      } else {
        state.pageInfo.limit = params.limit;
        state.pageInfo.pos = params.pos;
        state.pageInfo.pageNum = params.pageNum;
      }

      return fetchNoticeList(params).then(function (res) {
        if (res.code == 200 && res.data) {
          state.total = res.data.total;

          if (flag) {
            var _state$noticeList;

            (_state$noticeList = state.noticeList).push.apply(_state$noticeList, _toConsumableArray(res.data.list));
          } else {
            state.noticeList = res.data.list;
          }

          state.totalPages = Math.ceil(res.data.total / state.pageInfo.limit);
        }

        return {
          backData: res,
          state: state
        };
      });
    }; //发送消息


    var sendNotice = function sendNotice() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return $fetch({
        url: '/v3/interacts/chat/send-notice-message',
        type: 'POST',
        data: params
      });
    };

    return {
      state: state,
      sendNotice: sendNotice,
      getNoticeList: getNoticeList,
      fetchNoticeList: fetchNoticeList
    };
  }

  function userMemberServer() {
    var state = {
      //在线的成员
      onlineUsers: [],
      //申请上麦的人员
      applyUsers: [],
      //是否刷新了
      isRefresh: false,
      //总数
      totalNum: 0,
      //当前页数
      page: 1,
      //举手状态
      raiseHandTip: false
    }; //设置state的值

    var setState = function setState(key, value) {
      state[key] = value;
    }; //请求在线成员列表然后处理


    var getOnlineUserList = function getOnlineUserList() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _getOnlineUser(params).then(function (res) {
        console.warn('当前在线人员列表', res);

        if (res && [200, '200'].includes(res.code)) {
          if (state.isRefesh) {
            state.onlineUsers = _sortUsers(res.data.list);
            state.isRefesh = false;
            console.log('>>>>>>aaaa2', state.applyUsers);
            state.applyUsers.forEach(function (element) {
              state.onlineUsers.forEach(function (item) {
                if (element.accountId == item.accountId) {
                  item.isApply = true;
                }
              });
            });
          }

          if (!state.isRefesh && res.data.list.length === 0) {
            state.page--;
          }

          state.totalNum = res.data.total;
        }

        if (![200, '200'].includes(res.code)) {
          state.page--;
        }

        return res;
      });
    };
    /**
     * 将在线人员列表分为五个部分排序 主持人 / 上麦嘉宾 / 下麦嘉宾 / 助理 / 上麦观众 / 普通观众
     */


    var _sortUsers = function _sortUsers() {
      var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var host = []; // 主持人

      var onMicGuest = []; // 上麦嘉宾

      var downMicGuest = []; // 下麦嘉宾

      var assistant = []; // 助理

      var onMicAudience = []; // 上麦观众

      var downMicAudience = []; // 普通观众

      list.forEach(function (item) {
        switch (Number(item.role_name)) {
          // 主持人
          case 1:
            host.push(item);
            break;
          // 观众

          case 2:
            item.is_speak ? onMicAudience.push(item) : downMicAudience.push(item);
            break;
          // 助理

          case 3:
            assistant.push(item);
            break;
          // 嘉宾

          case 4:
            item.is_speak ? onMicGuest.push(item) : downMicGuest.push(item);
            break;

          default:
            console.error('角色未定义');
        }
      }); // 加载更多的时候，如果普通观众超过200，只显示后200

      if (downMicAudience.length > 200) {
        downMicAudience = downMicAudience.slice(-200);
      }

      return host.concat(onMicGuest, downMicGuest, assistant, onMicAudience, downMicAudience);
    }; //请求在线成员列表


    var _getOnlineUser = function _getOnlineUser() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return $fetch({
        url: '/v3/interacts/chat-user/get-online-list',
        type: 'POST',
        data: params
      });
    }; //踢出成员


    var kickedUser = function kickedUser() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _kickedUser(params).then(function (res) {
        return res;
      });
    }; //禁言成员


    var mutedUser = function mutedUser() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _mutedUser(params).then(function (res) {
        return res;
      });
    }; //请求踢出成员


    var _kickedUser = function _kickedUser() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return $fetch({
        url: '/v3/interacts/chat-user/set-kicked',
        type: 'POST',
        data: params
      });
    }; //请求禁言


    var _mutedUser = function _mutedUser() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return $fetch({
        url: '/v3/interacts/chat-user/set-banned',
        type: 'POST',
        data: params
      });
    }; //请求禁言的成员列表


    var getMutedUserList = function getMutedUserList() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return $fetch({
        url: '/v3/interacts/chat-user/get-banned-list',
        type: 'POST',
        data: params
      });
    }; //请求踢出的成员列表


    var getKickedUserList = function getKickedUserList() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return $fetch({
        url: '/v3/interacts/chat-user/get-kicked-list',
        type: 'POST',
        data: params
      });
    };

    return {
      state: state,
      setState: setState,
      getOnlineUserList: getOnlineUserList,
      getMutedUserList: getMutedUserList,
      getKickedUserList: getKickedUserList,
      mutedUser: mutedUser,
      kickedUser: kickedUser
    };
  }

  exports.contextServer = contextServer;
  exports.requestApi = requestApi;
  exports.setBaseUrl = setBaseUrl;
  exports.setRequestHeaders = setRequestHeaders;
  exports.setToken = setToken;
  exports.useChatServer = useChatServer;
  exports.useDesktopShareServer = useDesktopShareServer;
  exports.useDocServer = useDocServer;
  exports.useInsertFileServer = useInsertFileServer;
  exports.useInteractiveServer = useInteractiveServer;
  exports.useMediaCheckServer = useMediaCheckServer;
  exports.useMicServer = useMicServer;
  exports.useMsgServer = useMsgServer;
  exports.useNoticeServer = useNoticeServer;
  exports.usePlayerServer = usePlayerServer;
  exports.useRoomBaseServer = useRoomBaseServer;
  exports.useRoomInitGroupServer = useRoomInitGroupServer;
  exports.useUserServer = useUserServer;
  exports.useVirtualAudienceServer = useVirtualClientStartServe;
  exports.userMemberServer = userMemberServer;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=vhall-saas-domain.js.map
