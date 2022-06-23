import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve'; //提供静态服务器能力
import replace from '@rollup/plugin-replace';
const pkg = require('./package.json');
import path from 'path';

export default arg => {
  return {
    input: 'src/index.js',
    output: [
      {
        file: './dist/lib/middle-domain.js',
        format: 'umd',
        name: 'middleDomain',
        sourcemap: true,
        // rollup通过`external` + `output.globals`来标记外部依赖
        globals: {
        }
      }
    ],
    // 警告处理
    onwarn: function (warning, rollupWarn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        // 不显示循环依赖的警告
        return;
      }
      rollupWarn(warning)
    },
    // 插件
    plugins: [
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
        host: '0.0.0.0',
        port: 10001,

        // execute function after server has begun listening
        onListening: function () {
          console.log('\r\nServer listening at: http://localhost:10001/lib/middle-domain.js\r\n');
        }
      })
    ]
  };
};
