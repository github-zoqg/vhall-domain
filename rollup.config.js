import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import path from 'path'



const inputMapList = [
    {
        input: 'src/index.js',
        output: [
            {
                file: './dist/lib/vhall-saas-domain.js',
                // file: '../saas-v3-watchs/packages/vhall-live-watch/src/domain/sdk/vhall-saas-domain.js',
                format: 'umd',
                name:'vhall-sass-domain',
                sourcemap:true
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
        extensions:['.mjs','.js','.json']
    }),
    alias({
        entries: [
            {find: '@', replacement: path.resolve('./src')},
        ]
    }),
];

const buildConfig = inputMapList.map(item => Object.assign({}, item, {plugins: pluginsConfig}));
export default buildConfig;
