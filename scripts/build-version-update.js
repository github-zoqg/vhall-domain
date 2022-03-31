const fs = require('fs');
const path = require('path');
const inquirer = require("inquirer")
const chalk = require("chalk");
const semver = require('semver')
const version = require('../package.json').version;
const pkgPath = path.join(__dirname, '../package.json');
const log = console.log

/**
 * 更新 package.json 的 version
 * @param {*} val 版本号
 */
function updateVersion(val) {
  const content = fs.readFileSync(pkgPath, 'utf-8')
  const mathString = content.match(/(?="version": ").*?(?=,)/)
  let result = content.replace(mathString, `"version": "${val}"`);
  fs.writeFileSync(pkgPath, result, 'utf-8')
  log(chalk.green('Version update succeeded!'))
}

/**
 * 版本更新交互流程
 */
async function versionUpdate() {
  let patchVersion = semver.inc(version, 'patch');
  let minorVersion = semver.inc(version, 'minor');
  let majorVersion = semver.inc(version, 'major');

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

  let resultVersion = choices[answer.VERSION]

  if (resultVersion === 'Custom Version') {
    resultVersion = await requestCustomVersion()
  }

  const isConfirm = await requestVersionConfirm()
  if (!isConfirm) {
    process.exit()
  }

  // 更新版本
  updateVersion(resultVersion);
  return resultVersion;
};

/**
 * 用户输入自定义版本号
 * @returns inputCustomVersion 自定义版本号
 */
async function requestCustomVersion() {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'CUSTOM_VERSION',
      message: 'Enter a custom version'
    }
  ])

  const inputCustomVersion = answer.CUSTOM_VERSION

  if (!semver.valid(inputCustomVersion)) {
    log(chalk.redBright('custom version is invalid! please input again...'))
    inputCustomVersion = await requestCustomVersion()
  } else if (semver.gt(version, inputCustomVersion)) {
    log(chalk.redBright('custom version is invalid! please input a version that geater than old ...'))
    inputCustomVersion = await requestCustomVersion()
  }

  return inputCustomVersion
}

/**
 * 用户确认更新的版本号
 * @returns isConfirm
 */
async function requestVersionConfirm() {
  const answer = await inquirer.prompt({
    type: 'confirm',
    name: 'CONFIRM_VERSION',
    message: 'Are you confirmed you want to build this version?',
    default: true
  })

  return answer.CONFIRM_VERSION
}

/**
 * 确认是否自动更新版本号
 * @returns CONFIRM_AUTO_UPDATE_VERSION
 */
async function requestAutoUpdateVersion() {
  const answer = await inquirer.prompt({
    type: 'confirm',
    name: 'CONFIRM_AUTO_UPDATE_VERSION',
    message: 'Do you need to update the version number automatically?',
    default: true
  })

  return answer.CONFIRM_AUTO_UPDATE_VERSION
}

async function start() {
  const isAutoUpdate = await requestAutoUpdateVersion()
  if (!isAutoUpdate) {
    return false
  }
  versionUpdate()
}

start()
