import { getBuildConfig } from './rollup.config.base.js';
// 正式环境，获取构建配置
const buildConfig = getBuildConfig('production');

export default buildConfig;
