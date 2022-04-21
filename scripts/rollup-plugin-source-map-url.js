const fs = require('fs')
const path = require('path')
/**
 * 修改js文件中的sourceMappingURL的路径
 * @param {Object} userOptions 
 * @returns 
 */
function sourceMapUrl(userOptions = {}) {
  if (!userOptions.publicPath) {
    throw Error("publicPath option is required");
  }
  if (typeof userOptions.publicPath !== 'string') {
    throw new Error(`publicPath option must be a string`);
  }
  return {
    name: "rollup-plugin-source-map-url",
    // hook
    writeBundle(options, bundle, isWrite) {
      console.log('====writeBundle=====')
      if (options.sourcemap !== true) {
        // 必须开启了sourcemap，且不是inline模式
        return;
      }
      // do
      const jsFilePath = path.join(__dirname, options.file);
      const mapFilePath = path.join(__dirname, options.file + '.map');
      if (fs.existsSync(jsFilePath) && fs.existsSync(mapFilePath)) {
        const sourcemapFile = path.basename(mapFilePath);
        const mapPath = path.join(userOptions.publicPath, sourcemapFile);
        let content = fs.readFileSync(jsFilePath, 'utf-8');
        content = content.replace(/sourceMappingURL=.*\.map/, `sourceMappingURL=${mapPath}`)
        fs.writeFileSync(jsFilePath, content, 'utf-8');
      }
    }
  }
}

export default sourceMapUrl;