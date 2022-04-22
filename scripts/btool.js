
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