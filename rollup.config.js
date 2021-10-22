import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from "rollup-plugin-uglify";
import alias from '@rollup/plugin-alias';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
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

const viewDemoOption = {
    input: 'src/demo/index.js',
    output: {
        file: 'dist/demo.js',
        format: 'umd',
        sourcemap: true,
        inlineDynamicImports: true // 允许动态import
    },
    plugins: [
        commonjs(),
        nodeResolve(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        babel(babelOptions),
        alias({
            entries: [
                { find: '@', replacement: './src' }
            ]
        }),
        serve({
            open: true,// 自动打开浏览器
            contentBase: 'dist/',
            port: 1235
        }),
        htmlTemplate({
            template: './index.html',
            target: 'index.html',
        }),
        livereload({
            watch: 'dist/'
        })
    ]
}

export default [
    sdkOption, viewDemoOption
]
