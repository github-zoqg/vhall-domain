import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from "rollup-plugin-uglify";
import alias from '@rollup/plugin-alias';
import path from 'path';

const _dirname = path.resolve();
const inputMapList = [
    {
        input: 'src/index.js',
        //是否开启摇树优化
        // treeshake :false ,
        output: [
            {
                file: './dist/vhall-saas-domain/lib/index.js',
                format: 'umd',
                //允许动态引入
                inlineDynamicImports: true,
                name: 'vhall-sass-domain'
            },
            // {
            //     file: './dist/vhall-saas-domain/lib/index.js',
            //     format: 'esm',
            //     name:'vhall-sass-domain'
            // },
            // {
            //     file: './dist/vhall-saas-domain/lib/index-cjs.js',
            //     format: 'cjs',
            //     name:'vhall-sass-domain'
            // },
        ]
    },
    {
        input: 'src/domain/common/context.server.js',
        output: {
            file: './dist/vhall-saas-domain/lib/contextServer.js',
            format: 'esm'
        }
    },
    {
        input: 'src/domain/common/msg.server.js',
        output: {
            file: './dist/vhall-saas-domain/lib/userMsgServer.js',
            format: 'esm'
        }
    },
    {
        input: 'src/domain/insertFile/insertFile.server.js',
        output: {
            file: './dist/vhall-saas-domain/lib/insertFileServer.js',
            format: 'esm'
        }
    },
    {
        input: 'src/domain/praise/praise.server.js',
        output: {
            file: './dist/vhall-saas-domain/lib/praiseServer.js',
            format: 'esm'
        }
    },
    {
        input: 'src/domain/signIn/signIn.server.js',
        output: {
            file: './dist/vhall-saas-domain/lib/signInServer.js',
            format: 'esm'
        }
    },
    {
        input: 'src/domain/timer/timer.server.js',
        output: {
            file: './dist/vhall-saas-domain/lib/timerServer.js',
            format: 'esm'
        }
    },
];
const pluginsConfig = [
    babel({
        exclude: 'node_modules/**'
    }),
    // uglify(),
    commonjs(),
    alias({
        entries: [
            {find: '@', replacement: path.resolve(_dirname, 'src')}
        ]
    }),
];
const buildConfig = inputMapList.map(item => Object.assign({}, item, {plugins: pluginsConfig}));
export default buildConfig;
