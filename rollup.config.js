import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from "rollup-plugin-uglify";
import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import path from 'path';
const _dirname = path.resolve();

const babelOptions = {
    presets: [
        '@babel/preset-env',
        '@babel/preset-react'
    ]
}

const sdkOption = {
    input: 'src/index.js',
    //是否开启摇树优化
    // treeshake :false ,
    output: [
        {
            file: './dist/bundle-umd.js',
            format: 'umd',
            //允许动态引入
            inlineDynamicImports: true,
            name:'sassDomain'
        }
    ],

    plugins:[
        babel(babelOptions),
        uglify(),
        commonjs(),
        nodeResolve(),
        alias({
            entries: [
                {find: '@', replacement: path.resolve(_dirname,'src')}
            ]
        }),
    ]
};

export default [
    sdkOption
]
