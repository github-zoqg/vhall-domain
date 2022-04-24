/**
 * Created by yangxy on 2022/04/21.
 * 项目编译脚本
 * 区分测试环境和正式环境，接入jenkins使用
 */
const chalk = require('chalk');
const { execSync } = require('child_process');
const pkg = require('../package.json');
require('./btool');
const cLog = console.log;

// 获取命令行参数并解析
const args = require('minimist')(process.argv.slice(2))
const env = args.env || 'unkown';
if (env === 'unkown') {
  cLog(chalk.redBright(`未设置编译环境，请检查命令后再试\n`));
  process.exit(0);
}
if (!['production', 'test'].includes(env)) {
  cLog(chalk.redBright(`不支持的编译环境，请检查命令后再试\n`));
  process.exit(0);
}

const currentVersion = pkg.version;
// 开启提示文字
const text1 = `the current ENV is ${env}`;
const text2 = `the current version is ${currentVersion}`;
const info = chalk.hex('#4169E1'); //蓝色
cLog(info('┌────────────────────────────────────┐'));
cLog(info(`│${text1.padBoth(36)}│`));
cLog(info(`│${text2.padBoth(36)}│`));
cLog(info('└────────────────────────────────────┘'));

// 版本限制，是否需要待讨论？暂时取消
// if (args.env === 'production') {
//   if (!/^\d+(\.\d+){2}$/.test(currentVersion)) {
//     cLog(chalk.redBright(`production 环境的版本号必须是 x.y.z 形式，请修改后再试\n`));
//     process.exit(0);
//   }
// } else if (args.env === 'test') {
//   if (!/^\d+(\.\d+){2}(\-)\w+$/.test(currentVersion)) {
//     cLog(chalk.redBright(`test 环境的版本号必须是 x.y.z-w 形式，请修改后再试\n`));
//     process.exit(0);
//   }
// }

// 开始构建
cLog(chalk.green.bold('\nstart build...'))

if (args.env === 'production') {
  // 生产环境 
  execSync(`rollup -c rollup.config.prod.js`)
} else if (args.env === 'test') {
  // 测试环境
  execSync(`rollup -c rollup.config.test.js`)
}
cLog(chalk.green.bold(`\nbuild domain version ${currentVersion} successfully\n`));