const path = require('path')
const fs = require('fs')
const version = require('../package.json').version;

// sourcemap url
const mapPath = 'https://t-alistatic01.e.vhall.com/common-static/source-map'

// dist 目录路径
const distPath = path.join(__dirname, `../dist/${version}`)

const files = fs.readdirSync(distPath)

files.forEach(file => {
  if (/\.js$/.test(file)) {
    let content = fs.readFileSync(path.join(distPath, file), 'utf-8')
    const content1 = content.replace(/sourceMappingURL=.*\.map/, `sourceMappingURL=${mapPath}/${version}/${file}.map`)
    fs.writeFileSync(path.join(distPath, file), content1, 'utf-8');
  }
})
