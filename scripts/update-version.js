const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const semver = require('semver');
const pkg = require('../package.json');
const pkgPath = path.join(__dirname, '../package.json');
const cLog = console.log;

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

// 获取命令行参数
const argv = process.argv;
// 解析参数成数组形式：['serve']
const cmdArgs = Array.prototype.slice.call(argv, 2);
// cLog(chalk.bold.bgBlue(` cmdArgs `), cmdArgs);
if (cmdArgs[0] === 'serve') {
  run();
}

/**
 * 选择版本号命令行交互
 */
async function promptChooseVersion(version) {
  const patchVersion = semver.inc(version, 'patch'); //补丁版本号递增
  const minorVersion = semver.inc(version, 'minor'); //次版本号递增
  const majorVersion = semver.inc(version, 'major'); //主版本号递增
  // 组织选项
  const choices = {};
  choices[`Patch (${patchVersion})`] = patchVersion;
  choices[`Minor (${minorVersion})`] = minorVersion;
  choices[`Major (${majorVersion})`] = majorVersion;
  choices['Custom Version'] = 'Custom Version';
  // 交互提示
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'VERSION',
      message: `Please pick a version:`,
      choices: Object.keys(choices),
      default: ''
    }
  ]);
  // 选择结果
  let resultVersion = choices[answer.VERSION];
  if (resultVersion === 'Custom Version') {
    // 自定义版本号
    resultVersion = await promptCustomVersion(version);
  }
  return resultVersion;
}

/**
 * 用户输入自定义版本号交互
 * @returns inputVersion 自定义版本号
 */
async function promptCustomVersion(version) {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'CUSTOM_VERSION',
      message: 'Enter a custom version:'
    }
  ]);
  // 得到自定义的版本号
  let inputVersion = answer.CUSTOM_VERSION;
  // 各种验证
  if (!semver.valid(inputVersion)) {
    // 验证自定义版本号是否合法
    cLog(chalk.redBright('custom version is invalid! please input again...'));
    inputVersion = await promptCustomVersion(version);
  } else if (!semver.gt(inputVersion, version)) {
    // 验证自定义版本号是否大于当前版本号
    cLog(chalk.redBright('please input a version that geater than old ...'));
    inputVersion = await promptCustomVersion(version);
  }
  return semver.clean(inputVersion);
}

/**
 * 更新 package.json 的 version
 * @param {*} val 版本号
 */
function updateVersion(val) {
  const content = fs.readFileSync(pkgPath, 'utf-8');
  const mathString = content.match(/(?="version": ").*?(?=,)/);
  let result = content.replace(mathString, `"version": "${val}"`);
  fs.writeFileSync(pkgPath, result, 'utf-8');
  cLog(chalk.green.bold(`\n   Upgrade the current version to ${val} successfully\n`));
}

async function run() {
  const currentVersion = pkg.version;
  const text = `the current version is ${currentVersion}`;
  const info = chalk.hex('#4169E1'); //蓝色
  cLog(info('┌────────────────────────────────┐'));
  cLog(info(`│${text.padBoth(32)}│`));
  cLog(info('└────────────────────────────────┘'));
  cLog(info.bold(' Ready to update the current version\n'));

  // 获得新版本号
  const newVersion = await promptChooseVersion(currentVersion);

  // 更新版本
  updateVersion(newVersion);
}

module.exports = run;
