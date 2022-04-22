const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { execSync } = require('child_process');
const pkg = require('../package.json');
const pkgPath = path.join(__dirname, '../package.json');
require('./btool');
const cLog = console.log;
const currentVersion = pkg.version;

// 获取命令行参数并解析
const args = require('minimist')(process.argv.slice(2))
const env = args.mode || 'unkown';
// 开启提示文字
const text1 = `the current ENV is ${env}`;
const text2 = `the current version is ${currentVersion}`;
const info = chalk.hex('#4169E1'); //蓝色
cLog(info('┌────────────────────────────────────┐'));
cLog(info(`│${text1.padBoth(36)}│`));
cLog(info(`│${text2.padBoth(36)}│`));
cLog(info('└────────────────────────────────────┘'));


if (args.mode === 'prod') {
  if (!/^\d+(\.\d+){2}$/.test(currentVersion)) {
    cLog(chalk.redBright(`production 环境的版本号必须是 x.y.z 形式，请修改后再试\n`));
    process.exit(0);
  }
} else if (args.mode === 'test') {
  if (!/^\d+(\.\d+){2}(\-)\w+$/.test(currentVersion)) {
    cLog(chalk.redBright(`test 环境的版本号必须是 x.y.z-w 形式，请修改后再试\n`));
    process.exit(0);
  }
}

// 执行构建
cLog(chalk.green.bold('\nstart build...'))
// 测试、生产环境用的配置文件用是一样的
execSync('rollup -c rollup.config.prod.js')

cLog(chalk.green.bold(`\nbuild domain version ${currentVersion} successfully\n`));