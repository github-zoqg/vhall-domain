import { getBuildConfig } from './rollup.config.base.js';
import { visualizer } from "rollup-plugin-visualizer";
// 正式环境
export default (args) => {
  // 获取构建配置
  const buildConfig = getBuildConfig('production');
  // 判断是否添加分析插件
  if (args.configAnalyze) {
    // 添加分析插件
    buildConfig.plugins.push(
      // 放在最后
      visualizer({
        open: true,
        gzipSize: true
      })
    )
  }
  return buildConfig
};
