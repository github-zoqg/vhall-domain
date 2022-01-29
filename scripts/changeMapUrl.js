const fs = require('fs');
const chalk = require('chalk');
const sourceMappingURL = require('source-map-url');
const ProgressBar = require('progress');
var path = require('path');
const mapPath = 'https://t-alistatic01.e.vhall.com/common-static/source-map';

const join = path.join;

/**
 * 获取指定目录下的所有文件
 * @param {*} jsonPath
 * @returns
 */
function getJsonFiles(jsonPath) {
  let jsonFiles = [];
  function findJsonFile(path) {
    let files = fs.readdirSync(path);
    files.forEach(function(item, index) {
      let fPath = join(path, item);
      let stat = fs.statSync(fPath);
      if (stat.isDirectory() === true) {
        findJsonFile(fPath);
      }
      if (stat.isFile() === true) {
        jsonFiles.push(fPath);
      }
    });
  }
  findJsonFile(jsonPath);
  return jsonFiles.filter(item => {
    return path.extname(item) != ".map"
  });
}

/**
 * 修改sourceMappingURL地址
 * @param {*} url
 */
function changeMapUrl(url) {
  const result = fs.readFileSync(url);
  const code = result.toString();
  let sourceMapCode = sourceMappingURL.removeFrom(code);
  let urlsArr = url.split("/");
  let filename = urlsArr[urlsArr.length - 1];
  sourceMapCode += `//# sourceMappingURL=${mapPath}/${filename}.map`
  fs.writeFileSync(url, sourceMapCode)
}

// 批量修改sourcemapurl
// let promiseList = [];

; (() => {
  let jsonFiles = getJsonFiles('dist');
  // console.log("jsonFiles.length--->", jsonFiles.length)
  var bar = new ProgressBar(`${chalk.yellow('批量修改中')} [:bar] :percent`, { total: 100 });
  for (let i = 0; i < jsonFiles.length; i++) {
    changeMapUrl(jsonFiles[i]);
    bar.tick((i + 1) / jsonFiles.length * 100);
  }
  console.log(`\n${chalk.blue('批量修改完成sourceMapUrl修改!')}`);
})()

