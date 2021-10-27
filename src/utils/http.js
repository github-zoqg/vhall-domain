
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
import { isPc } from './index.js'


let BUSE_URL = 'https://t-saas-dispatch.vhall.com'
let TOKEN = ''
let LIVETOKEN = ''
let HEADERS = {}


function setBaseUrl(url) {
    BUSE_URL = url
}
function setToken(token, livetoken) {
    console.log(token, livetoken, 888)
    TOKEN = token
    LIVETOKEN = livetoken
}
function setRequestHeaders(options) {
    Object.assign(HEADERS,options)
}

function $fetch(options) {
    // if (process.env.NODE_ENV != 'development') {
    //
    // }
    options.url = BUSE_URL + options.url
    console.log('接口环境', options.url)

    return new Promise((resolve, reject) => {
        options = options || {}
        if (options.data) {
            if (LIVETOKEN) {
                options.data.live_token = LIVETOKEN
            }
            options.data = formatParams(options.data)
        }
        options.dataType ? jsonp(options, resolve, reject) : json(options, resolve, reject)
    })
}

// JSON请求
function json(params, success, fail) {
    let xhr = null
    // interactToken = sessionStorage.getItem('interact-token') || '',
    // grayId = sessionStorage.getItem('grayId') || '',
    // vhallJSSDKUserInfo = localStorage.getItem('vhallJSSDKUserInfo') ? JSON.parse(localStorage.getItem('vhallJSSDKUserInfo')) : {},
    params.type = (params.type || 'GET').toUpperCase()

    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest()
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP')
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            let status = xhr.status
            if (status >= 200 && status < 300) {
                let response = ''
                let type = xhr.getResponseHeader('Content-type')

                if (type.indexOf('xml') !== -1 && xhr.responseXML) {
                    response = xhr.responseXML
                } else if (type === 'application/json' || type === 'application/json;charset=UTF-8') {
                    response = JSON.parse(xhr.responseText)

                } else {
                    response = xhr.responseText
                }
                success && success(response)
            } else {
                fail && fail(status)
            }
        }
    }

    if (params.type == 'GET') {
        if (params.data) {
            xhr.open(params.type, params.url + '?' + params.data, true)
        } else {
            xhr.open(params.type, params.url, true)
        }
    } else if (params.type == 'POST') {
        xhr.open(params.type, params.url, true)
    }

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    const interact_token = sessionStorage.getItem('interact_token') || null;
    interact_token && xhr.setRequestHeader('interact-token', interact_token)
    if (!LIVETOKEN) {
        TOKEN && xhr.setRequestHeader('token', TOKEN)
    }
    console.log('HEADERS', HEADERS)
    if (HEADERS) {
        Object.getOwnPropertyNames(HEADERS).forEach(item => {
            xhr.setRequestHeader(item, HEADERS[item])
        })
    }
    // if (params.headers && params.headers.activeType == 'new') {
    //     xhr.setRequestHeader('platform', 18)
    //     xhr.setRequestHeader('request-id', uuid())
    //     grayId && xhr.setRequestHeader('gray-id', grayId)
    //     interactToken && xhr.setRequestHeader('interact-token', interactToken)
    //     token && xhr.setRequestHeader('token', token)
    // }
    if (params.type == 'GET') {
        xhr.send(null)
    } else {
        xhr.send(params.data)
    }
}

// JSONP请求
function jsonp(params, success, fail) {
    let callbackName = params.dataType
    params['callback'] = callbackName

    let script = document.createElement('script')
    script.type = "text/javascript"
    script.charset = "utf-8"
    document.body.appendChild(script)

    // 创建回调函数
    window[callbackName] = function (val) {
        document.body.removeChild(script)
        clearTimeout(script.timer)
        window[callbackName] = null
        success && success(val)
    }
    let stemp = random()
    script.src = `${params.url}?${params.data}&_=${1594014089800}`

    // 超时处理
    if (params.time) {
        script.timer = setTimeout(function () {
            window[callbackName] = null;
            head.removeChild(script);
            fail && fail('请求超时')
        }, parmas.time * 1000);
    }
}

// 格式化数据
function formatParams(data) {
    var arr = []
    if (data) {
        for (let item in data) {
            arr.push(encodeURIComponent(item) + '=' + encodeURIComponent(data[item]))
        }
    }
    return arr.join('&')
}

// 随机数
function random() {
    return Math.floor(Math.random() * 10000 + 500);
}


export default $fetch
export { setBaseUrl, setToken, setRequestHeaders }
