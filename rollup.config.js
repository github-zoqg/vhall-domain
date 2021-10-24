import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from "rollup-plugin-uglify";
import alias from '@rollup/plugin-alias';

const inputMapList = [
    {
        input: 'src/index.js',
        output: [
            {
                file: './dist/lib/vhall-saas-domain.js',
                format: 'umd',
                //允许动态引入
                inlineDynamicImports: true,
                name: 'vhall-sass-domain'
            },
            {
                file: './dist/lib/vhall-saas-domain.es.js',
                format: 'esm',
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
    uglify(),
    commonjs(),
    alias({
        entries: [
            {find: '@', replacement: './src'}
        ]
    }),
];

const buildConfig = inputMapList.map(item => Object.assign({}, item, {plugins: pluginsConfig}));
export default buildConfig;
