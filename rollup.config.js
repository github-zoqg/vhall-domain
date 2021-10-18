import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from "rollup-plugin-uglify";
import alias from '@rollup/plugin-alias';
import path from 'path';
const _dirname = path.resolve();
export default {
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
        },
        {
            file: './dist/bundle-es.js',
            format: 'esm'
        },
        {
            file: './dist/bundle-cjs.js',
            format: 'cjs'
        },
    ],

    plugins:[
        babel({
            exclude: 'node_modules/**'
        }),
        uglify(),
        commonjs(),
        alias({
            entries: [
                {find: '@', replacement: path.resolve(_dirname,'src')}
            ]
        }),
    ]
};
