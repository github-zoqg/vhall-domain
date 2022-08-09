import merge from 'merge';

// 判断终端类型
function isPc() {
  let userAgentInfo = navigator.userAgent;
  let Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
  let flag = true;
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

// 上传文件
function uploadFile(options, onChange) {
  var inputObj = document.createElement('input');
  inputObj.setAttribute('id', 'file');
  inputObj.setAttribute('type', 'file');
  inputObj.setAttribute('name', 'file');
  inputObj.setAttribute('style', 'height:0px; position: absolute;');
  inputObj.setAttribute('accept', options.accept);
  document.body.appendChild(inputObj);
  inputObj.value;
  inputObj.click();
  inputObj.addEventListener('change', function (e) {
    onChange && onChange(e);
    document.body.removeChild(this);
  });
}

// 判断浏览器是否是 chrome88 以上版本
function isChrome88() {
  let chromeReg = /Chrome\/(\d{2,3})[.\d]+\sSafari\/[.\d]+$/gi;
  let chromeResult = chromeReg.exec(navigator.userAgent);
  return chromeResult && chromeResult.length > 0 && chromeResult[1] > 87;
}

// 获取地址栏参数
function getQueryString(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

function randomNumGenerator() {
  let kickMark = '';
  if (!sessionStorage.getItem('kickMark')) {
    kickMark = randomNumKickmark()
    sessionStorage.setItem('kickMark', kickMark);
  } else {
    kickMark = sessionStorage.getItem('kickMark');
  }
  return kickMark;
}

function randomNumKickmark() {
  return 'xxxxxxyxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
//防抖
function debounce(fn, time, immediate) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    immediate && !timer && fn(...args); // 首次进入，立即执行（立即执行开启，定时器没开启）
    timer = setTimeout(() => {
      timer = null;
    }, time);
  };
}

// throttling 节流
function throttling(fn, time, immediate) {
  let timer;
  return function (...args) {
    if (timer) return false;
    !timer && immediate && fn(args);
    timer = setTimeout(() => {
      timer = null;
    }, time);
  };
}

// sleep
function sleep(sleepTime) {
  return new Promise(resolve => {
    setTimeout(resolve, sleepTime);
  });
}

function logPrint(dec, tem) {
  if (globalCommon.showLog) {
    let date = new Date();
    let headDes = date.toLocaleTimeString() + ' ' + date.getMilliseconds() + 'ms';
    console.log('%s========controller=======start==================>%s:', headDes, dec);
    if (tem) {
      if (tem instanceof Array) {
        for (let v in tem) {
          console.log(v);
        }
      } else {
        console.log(tem);
      }
    }
    console.log('%s========controller=======end==================>', headDes);
  }
}

function logOnlinePrint(content, type) {
  let head = '=========window pc log=========> ';
  if (Object.prototype.toString.call(content) == '[object Object]') {
    content = JSON.stringify(content);
  }
  let tem = head + content;
  switch (type) {
    case 'warn':
      console.warn(tem);
      break;
    case 'error':
      console.error(tem);
      break;
    default:
      console.log(tem);
      break;
  }
}

// 抽离成公共方法
function awaitWrap(promise) {
  return promise.then(data => [null, data]).catch(err => [err, null]);
}
//日期格式化
Date.prototype.format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
  return fmt;
};
/**
* 渲染元素
* @param {*} domCtn: dom容器 
* @param {*} data: {tag: 'div', text: 'hello', props: {id: 'test'}, children: []}
* @returns 无
*/
const renderHTML = (domCtn = null, data = []) => {
	// dom节点是否有效
	if (!domCtn) {
		console.error('renderHTML params domCtn is required');
		return;
	}
	// data参数是否是对象类型
	if (!(data instanceof Array)) {
		console.error('renderHTML params data必须是数组类型');
		return;
	}
	// data为空则清除dom元素值
	if (data.length === 0) {
		// 子节点
		const childNodes = domCtn.childNodes;
		(childNodes || []).forEach(node => {
			domCtn.removeChild(node);
		});
		return;
	}

	// deep循环
	const deepDomData = (dDom = null, dData = {}) => {
		const {
			tag = '',
			props = {},
			children = [],
			text = ''
		} = dData;
		// 是否元素类型
		const isElementType = tag === '';
		// 是否文本类型
		const isTextType = text === '';
		// 非节点 && 非文本
		if (!isElementType && !isTextType) {
			return;
		}
		// 节点类型
		if (!isTextType) {
			// 若文本中有标签时需要转化
			const textNode = document.createTextNode(text);
			dDom.append(textNode);
		} else {
			// 元素类型
			// 创建节点, 针对script标签元素直接通过code包装
			const tagLower = tag.toLowerCase();
			const currNode = document.createElement(tagLower);
			// 属性
			const propKeys = Object.keys(props);
			// 若有属性
			if (propKeys.length !== 0) {
				propKeys.forEach(key => {
					currNode.setAttribute(key, props[key]);
				});
			}
			// 子节点
			(children || []).forEach(node => {
				deepDomData(currNode, node);
			});
			// script标签的话则用code包裹
			if (tagLower === 'script') {
				const codeNode = document.createElement('code');
				codeNode.textContent = '<script>' + currNode.textContent + '<\/script>';
				dDom.append(codeNode);
			} else {
				// 直接插入
				dDom.append(currNode);
			}
		}
	};
	// 调用
	data.forEach(dataVal => {
		deepDomData(domCtn, dataVal);
	});
};
export {
  merge,
  isPc,
  uploadFile,
  isChrome88,
  randomNumGenerator,
  debounce,
  throttling,
  sleep,
  awaitWrap,
  getQueryString,
  renderHTML
};
