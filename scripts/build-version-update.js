/**
 * 版本处理
 * */
const fs = require('fs');
const path = require('path');
const inquirer = require("inquirer")
const chalk = require("chalk");
// const { VERSION } = require('rollup');
// const { type } = require('os');
const semver = require('semver')
const version = require('../package.json').version;
const pkgPath = path.join(__dirname, '../package.json');
const versionArray = version.split('.');
const versionLen = versionArray.length;
const log = console.log

let isFirstRecursion = true

// 版本号更新
function generateNewVersion(index) {
  // 如果是第一次递归，处理低版本号
  if (isFirstRecursion) {
    let indexBak = index;
    while (indexBak < versionLen - 1 && indexBak >= 0) {
      versionArray[++indexBak] = 0;
      indexBak++;
    }
    isFirstRecursion = false
  }

  const v = parseInt(versionArray[index]) + 1;
  if (index > 0 && v > 99) {
    versionArray[index] = 0;
    generateNewVersion(index - 1);
  } else {
    versionArray[index] = v;
  }

  // 还原递归标识
  isFirstRecursion = true;
  return versionArray.join('.');
}

// 更新package.json版本号
function updateVersion(val) {
  const content = fs.readFileSync(pkgPath, 'utf-8')
  const mathString = content.match(/(?="version": ").*?(?=,)/)
  let result = content.replace(mathString, `"version": "${val}"`);
  fs.writeFileSync(pkgPath, result, 'utf-8')
  log(`更新version成功${val}`)
}

async function versionUpdate() {
  // 最小级别版本更新
  let patchVersion = generateNewVersion(versionLen - 1);
  // 第二级别版本更新
  let minorVersion = generateNewVersion(versionLen - 2);
  // 最高级别版本更新
  let majorVersion = generateNewVersion(versionLen - 3);

  log(`${chalk.white('build')} ${chalk.green('info')} ${chalk.blue('current version')} ${version}`);

  const choices = {}
  choices[`Patch (${patchVersion})`] = patchVersion
  choices[`Minor (${minorVersion})`] = minorVersion
  choices[`Major (${majorVersion})`] = majorVersion
  choices['Custom Version'] = 'Custom Version'

  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'VERSION',
    message: `Select a new version (currently ${version})`,
    choices: Object.keys(choices),
    default: 0,
  }])

  if (answer.VERSION === 'Custom Version') {
    const inputCustomVersion = await inquirer.prompt([
      {
        type: 'input',
        name: 'CUSTOM_VERSION',
        message: 'Enter a custom version'
      }
    ])
  }
  console.log('答案答案', answer)
  // 新版本
  updateVersion(val);
  return val;
};

versionUpdate()

module.exports = versionUpdate
