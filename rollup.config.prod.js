/*
 * @Author: your name
 * @Date: 2021-12-26 20:26:16
 * @LastEditTime: 2021-12-28 11:01:47
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /middle-domain/rollup.config.prod.js
 */
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from "rollup-plugin-uglify";
import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import path from 'path'



const inputMapList = [
  {
    input: 'src/index.js',
    output: [
      {
        file: './dist/lib/middleDomain.js',
        format: 'umd',
        name: 'middleDomain',
        sourcemap: true
      }
    ]
  }
];
const pluginsConfig = [
  babel({
    exclude: 'node_modules/**'
  }),
  uglify({
    sourcemap: {
      root: "https://t-alistatic01.e.vhall.com/common-static/source-map"
    }
  }),
  commonjs(),
  nodeResolve({
    extensions: ['.mjs', '.js', '.json']
  }),
  alias({
    entries: [
      { find: '@', replacement: path.resolve('./src') },
    ]
  }),
];

const buildConfig = inputMapList.map(item => Object.assign({}, item, { plugins: pluginsConfig }));
export default buildConfig;
