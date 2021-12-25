import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from "rollup-plugin-uglify";
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
                name:'middleDomain',
                sourcemap:true
            }
        ]
    }
];
const pluginsConfig = [
    babel({
        exclude: 'node_modules/**'
    }),
    uglify(),
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
