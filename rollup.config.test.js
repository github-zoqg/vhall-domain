import { getBuildConfig } from './rollup.config.base.js';
// 测试环境，获取构建配置
const buildConfig = getBuildConfig('test');

export default buildConfig;