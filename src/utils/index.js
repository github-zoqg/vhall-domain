import merge from "merge";

// 判断终端类型
function isPc() {
    let userAgentInfo = navigator.userAgent;
    let Agents = [
        "Android",
        "iPhone",
        "SymbianOS",
        "Windows Phone",
        "iPad",
        "iPod",
    ];
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
    var inputObj=document.createElement('input')
    inputObj.setAttribute('id','file');
    inputObj.setAttribute('type','file');
    inputObj.setAttribute('name','file');
    inputObj.setAttribute("style",'height:0px; position: absolute;');
    inputObj.setAttribute("accept",options.accept);
    document.body.appendChild(inputObj);
    inputObj.value;
    inputObj.click();
    inputObj.addEventListener('change', function (e) {
        onChange && onChange(e)
        document.body.removeChild(this)
    })
}

// 判断浏览器是否是 chrome88 以上版本
function isChrome88() {
    let chromeReg = /Chrome\/(\d{2})[.\d]+\sSafari\/[.\d]+$/gi;
    let chromeResult = chromeReg.exec(navigator.userAgent);
    return chromeResult && chromeResult.length > 0 && chromeResult[1] > 87
}


function randomNumGenerator() {
    return 'xxxxxxyxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

export { merge, isPc, uploadFile, isChrome88, randomNumGenerator };
