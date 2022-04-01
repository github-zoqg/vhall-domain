const ora = require('ora')
const chalk = require('chalk')
const startVersionUpdate = require('./build-version-update.js')
const replaceSourceMapUrl = require('./replace-source-map-url.js')
const { execSync } = require('child_process')
const log = console.log

async function startBuild() {
  const result = await startVersionUpdate();

  if (result === 'exit') {
    process.exit()
  }

  // 执行构建
  log(chalk.blueBright('start build source code'))
  const spinner = ora('building...').start();
  try {
    execSync('npm run build:rollup')
    spinner.succeed('build complete')
  } catch {
    spinner.succeed('build complete')
  }

  // 更新sourcemapUrl
  log(chalk.blueBright('start replace source map url'))
  const spinner1 = ora('replacing...').start();
  try {
    replaceSourceMapUrl(result)
    spinner1.succeed('replace complete')
  } catch {
    spinner1.succeed('replace complete')
  }

  // git
  log(chalk.blueBright('start submit code by git'))
  const spinner2 = ora('replacing...').start();
  try {
    execSync(`git add package.json`)
    execSync(`git commit -m "chore: Update version number to ${result}"`)
    execSync('git push')
    spinner2.succeed('all process complete')
  } catch {
    spinner2.succeed('all process complete')
  }
}

startBuild()