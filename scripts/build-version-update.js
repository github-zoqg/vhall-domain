/**
 * 版本处理
 * */
const fs = require('fs');
const path = require('path');
const pkgPath = path.join(__dirname, '../package.json');
const version = require('../package.json').version;
const vers = version.split('.');
const len = vers.length;

// 新版本号递增函数
function addFn(index) {
    const v = parseInt(vers[index]) + 1;
    if (index > 0 && v > 99) {
        vers[index] = 0;
        addFn(index - 1);
    } else {
        vers[index] = v;
    }

    return vers.join('.');
}
// 更新.env版本号
function updateVersion(val) {
    const cont = fs.readFileSync(pkgPath, 'utf-8')
    const mathString = cont.match(/(?="version": ").*?(?=,)/)
    let result = cont.replace(mathString, `"version": "${val}"`);
    fs.writeFileSync(pkgPath, result, 'utf-8')
    console.log(`更新version成功${ val }`)
    // writeEnv(result);
}
// 写入.env文件
// function writeEnv(result, isRecove) {
//     fs.writeFileSync(pkgPath, result, function (error) {
//         if (error) {
//             console.log(`${isRecove ? '恢复' : '更新'}version失败`);
//         } else {
//             console.log(`${isRecove ? '恢复' : '更新'}version成功了`);
//         }
//     })
// }

const buildVersionUpdate = function () {
    let val = addFn(len - 1);
    // 新版本
    updateVersion(val);
    return val;
};

buildVersionUpdate()

module.exports = buildVersionUpdate
