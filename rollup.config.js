import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve'; //提供静态服务器能力
import replace from '@rollup/plugin-replace';
const pkg = require('./package.json');
import path from 'path';

const inputMapList = [
  {
    input: 'src/index.js',
    output: [
      {
        file: './dist/lib/middle-domain.js',
        // file: '../saas-v3-watchs/packages/vhall-live-watch/src/domain/sdk/vhall-saas-domain.js',
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
  serve({
    // Launch in browser (default: false)
    open: true,

    // Show server address in console (default: true)
    verbose: false,

    // Folder to serve files from
    contentBase: '',

    // Multiple folders to serve from
    contentBase: ['dist'],

    // Set to true to return index.html instead of 404
    historyApiFallback: true,
    openPage: './index.html',
    // Options used in setting up server
    host: 'localhost',
    port: 10001
  })
];

const buildConfig = inputMapList.map(item => Object.assign({}, item, { plugins: pluginsConfig }));
export default buildConfig;
