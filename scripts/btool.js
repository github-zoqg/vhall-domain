/**
 * Created by yangxy on 2022/04/21.
 * 编译项目辅助工具
 */
const axios = require('axios');

/**
 * 字符串平均分配两端补齐
 * @param {*} maxLength 补齐后的总长度
 * @param {*} fillString 填充的字符串，默认一个空格
 * @returns
 */
String.prototype.padBoth = function (maxLength, fillString = ' ') {
  const start = parseInt((maxLength - this.length) / 2);
  if (start < 0) return this;
  return this.padStart(this.length + start, fillString).padEnd(maxLength, fillString);
};


/**
 * 检测资源的可访问情况
 * @param {String} url 资源访问URL
 * @returns 
 */
async function checkRes(url) {
  try {
    const response = await axios.get(url, {
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });
    if (response.status === 200) {
      //资源存在
      return { status: 1 };
    } else if (response.status >= 400 || response.status <= 499) {
      // 资源不存在
      return { status: 0 };
    } else {
      // 资源访问错误 
      return { status: -2 };
    }
  } catch (error) {
    //访问资源异常
    return { status: -1, errMsg: error };
  }
}

module.exports = {
  checkRes
}