/**
 * Created by yangxy on 2022/04/21.
 * 项目编译脚本
 * 区分测试环境和正式环境，接入jenkins使用
 */
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const pkg = require('../package.json');
const { checkRes } = require('./btool.js');
const cLog = console.log;

// 获取命令行参数并解析
const args = require('minimist')(process.argv.slice(2))
const env = args.env || 'unkown';
const cover = args.cover || 'false';
if (env === 'unkown') {
  cLog(chalk.redBright(`未设置编译环境，请检查命令后再试\n`));
  process.exit(1);
}
if (!['production', 'test'].includes(env)) {
  cLog(chalk.redBright(`不支持的编译环境，请检查命令后再试\n`));
  process.exit(1);
}

// 当前版本
const currentVersion = pkg.version;

// 开启提示文字
const text1 = `the current ENV is ${env}`;
const text2 = `the current version is ${currentVersion}`;
const info = chalk.hex('#4169E1'); //蓝色
cLog(info('┌────────────────────────────────────┐'));
cLog(info(`│${text1.padBoth(36)}│`));
cLog(info(`│${text2.padBoth(36)}│`));
cLog(info('└────────────────────────────────────┘'));

(async function () {
  // 检查该版本是否已经存在
  let url = getUrl(env);
  const { status, errMsg } = await checkRes(`${url}?t=${Date.now()}`);
  if (status < 0) {
    if (status === -1) {
      cLog(chalk.redBright(`资源访问存在异常:${url}`))
      cLog(chalk.redBright(errMsg));
      cLog();
    } else {
      cLog(chalk.redBright('访问资源出现错误,请检查'))
      cLog(chalk.redBright(`→ ${url}\n`))
    }
    process.exit(1);
  }
  if (cover !== 'true' && status === 1) {
    // 资源不覆盖，且当前版本存在，则停止构建
    cLog(chalk.hex('#F4A460')(`\n资源地址：${url}`));
    cLog(chalk.redBright('资源已存在，你可能需要的选择：'));
    cLog(chalk.redBright('1）更新版本号后重新构建.'));
    cLog(chalk.redBright('2）采用覆盖模式构建.\n'));
    process.exit(1);
  }

  // 版本限制，是否需要待讨论？暂时取消
  // if (args.env === 'production') {
  //   if (!/^\d+(\.\d+){2}$/.test(currentVersion)) {
  //     cLog(chalk.redBright(`production 环境的版本号必须是 x.y.z 形式，请修改后再试\n`));
  //     process.exit(1);
  //   }
  // } else if (args.env === 'test') {
  //   if (!/^\d+(\.\d+){2}(\-)\w+$/.test(currentVersion)) {
  //     cLog(chalk.redBright(`test 环境的版本号必须是 x.y.z-w 形式，请修改后再试\n`));
  //     process.exit(1);
  //   }
  // }

  // 开始构建
  cLog(chalk.green.bold('\nstart build...'))
  if (status === 1) {
    // 当前资源存在，会被覆盖给个警告
    cLog(chalk.hex('#F4A460')('warning: 本次构建成功后将会覆盖原有资源，你有可能需要刷新CDN缓存~\n'));
  }

  try {
    if (args.env === 'production') {
      // 生产环境 
      let cmdStr = `node_modules${path.sep}.bin${path.sep}rollup -c rollup.config.prod.js --environment production`;
      if (args.analyze) {
        cmdStr = `${cmdStr} --configAnalyze`;
      }
      // 执行
      execSync(cmdStr, { cwd: path.resolve(__dirname, '../'), stdio: 'inherit' });
    } else if (args.env === 'test') {
      // 测试环境
      execSync(`node_modules${path.sep}.bin${path.sep}rollup -c rollup.config.test.js`, { cwd: path.resolve(__dirname, '../'), stdio: 'inherit' });
    }
    cLog(chalk.green.bold(`\nbuild domain version ${currentVersion} successfully\n`));
  } catch (ex) {
    cLog(chalk.redBright(ex));
    process.exit(1);
  }
})();

function getUrl(env) {
  return env === 'production' ?
    `https://cnstatic01.e.vhall.com/common-static/middle/middle-domain/${currentVersion}/middle-domain.js` :
    // t-vhallsaas-static.oss-cn-beijing.aliyuncs.com
    `https://t-alistatic01.e.vhall.com/common-static/middle/middle-domain/${currentVersion}/middle-domain.js`;
}