import path from 'path';
// 让我们可以用es6新特性来编写代码
import babel from 'rollup-plugin-babel';
// 将commonjs模块转换成es6
import commonjs from 'rollup-plugin-commonjs';
// 代码压缩,uglify只能翻译es5语法。如果要转译es6+语法，请改用terser
import { uglify } from 'rollup-plugin-uglify';
// 定义别名
import alias from '@rollup/plugin-alias';
// 让rollup支持nodejs的解析机制
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import clear from 'rollup-plugin-clear';
import sourceMapUrl from './scripts/plugins/rollup-plugin-source-map-url';
import copy from 'rollup-plugin-copy'
const pkg = require('./package.json');

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: `./dist/${pkg.version}/middle-domain.js`,
        format: 'umd',
        name: 'middleDomain',
        sourcemap: true,
        // rollup通过`external` + `output.globals`来标记外部依赖
        globals: {
          moment: 'moment'
        }
      }
    ],
    // 第三方库通过外链引入
    external: ['moment'],
    // 插件
    plugins: [
      clear({
        targets: ['dist']
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      nodeResolve(),
      commonjs(),
      uglify(),
      alias({
        entries: [{ find: '@', replacement: path.resolve('./src') }]
      }),
      replace({
        preventAssignment: true,
        __VERSION__: pkg.version
      }),
      sourceMapUrl({
        publicPath: `https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/sourcemap/middle-domain/${pkg.version}/`
      }),
      copy({
        targets: [
          {
            src: `./dist/${pkg.version}/middle-domain.js`,
            dest: `./dist/cloud/${pkg.version}/`
          },
          {
            src: `./dist/${pkg.version}/middle-domain.js.map`,
            dest: `./dist/sourcemap/${pkg.version}/`
          }
        ],
        hook: 'writeBundle',
        verbose: true
      })]
  }
];