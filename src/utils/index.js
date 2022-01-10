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
  let chromeReg = /Chrome\/(\d{2})[.\d]+\sSafari\/[.\d]+$/gi;
  let chromeResult = chromeReg.exec(navigator.userAgent);
  return chromeResult && chromeResult.length > 0 && chromeResult[1] > 87;
}

function randomNumGenerator() {
  return 'xxxxxxyxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
//防抖
function debounce(fn, time, immediate) {
  var timer;
  return function () {
    if (timer) clearTimeout(timer);
    immediate && !timer && fn(); // 首次进入，立即执行（立即执行开启，定时器没开启）
    timer = setTimeout(() => {
      timer = null;
    }, time);
  };
}

// throttling 节流
function throttling(fn, immediate) {
  var timer;
  return function () {
    if (timer) return false;
    !timer && immediate && fn();
    timer = setTimeout(() => {
      timer = null;
    }, 1000);
  };
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
export { merge, isPc, uploadFile, isChrome88, randomNumGenerator, debounce, throttling };
