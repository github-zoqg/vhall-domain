import path from 'path';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import clear from 'rollup-plugin-clear';
import sourceMapUrl from './scripts/rollup-plugin-source-map-url';
import copy from 'rollup-plugin-copy'
const pkg = require('./package.json');

const inputMapList = [
  {
    input: 'src/index.js',
    output: [
      {
        file: `./dist/${pkg.version}/middle-domain.js`,
        format: 'umd',
        name: 'middleDomain',
        sourcemap: true
      }
    ]
  }
];
const pluginsConfig = [
  clear({
    targets: ['dist']
  }),
  babel({
    exclude: 'node_modules/**'
  }),
  uglify(),
  commonjs(),
  nodeResolve({
    extensions: ['.mjs', '.js', '.json']
  }),
  alias({
    entries: [{ find: '@', replacement: path.resolve('./src') }]
  }),
  replace({
    preventAssignment: true,
    __VERSION__: pkg.version
  }),
  sourceMapUrl({
    publicPath: 'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/sourcemap/middle-domain/1.3.15/'
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
  })
];

const buildConfig = inputMapList.map(item => Object.assign({}, item, { plugins: pluginsConfig }));
export default buildConfig;
