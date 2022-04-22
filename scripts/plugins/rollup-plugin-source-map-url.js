/**
 * Created by yangxy on 2022/04/21.
 * 自定义rollup插件
 * 插件的作用是：在编译完成后修改js文件中的sourceMappingURL的路径
 */
const fs = require('fs');
const path = require('path');

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
      if (options.sourcemap !== true) {
        // 必须开启了sourcemap，且不是inline模式
        return;
      }
      // do
      const jsFilePath = path.join(__dirname, options.file);
      const mapFilePath = path.join(__dirname, options.file + '.map');
      if (fs.existsSync(jsFilePath) && fs.existsSync(mapFilePath)) {
        const sourcemapFile = path.basename(mapFilePath);
        let mapUrl = '';
        if (/^(http\:|https\:|\/\/)[\S\s]*/.test(userOptions.publicPath.toUpperCase())) {
          // URL处理
          mapUrl = userOptions.publicPath.endsWith('/') ? `${userOptions.publicPath}${sourcemapFile}`
            : `${userOptions.publicPath}/${sourcemapFile}`;
        } else {
          // 普通路径处理
          mapUrl = path.join(userOptions.publicPath, sourcemapFile);
        }
        let content = fs.readFileSync(jsFilePath, 'utf-8');
        content = content.replace(/sourceMappingURL=.*\.map/, `sourceMappingURL=${mapUrl}`)
        fs.writeFileSync(jsFilePath, content, 'utf-8');
      }
    }
  }
}

export default sourceMapUrl;