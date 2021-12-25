const deploy = require('ali-oss-deploy')
const { version } = require('../package.json')

deploy({
    path: '../dist',   // 改为自己的静态资源目录
    ossConfig: {   // oss配置参数
        region: 'oss-cn-beijing',
        accessKeyId: 'LTAI5tLYAdxjbLUhXpHgkdUj',
        accessKeySecret: 'N9QBmA3OsD3NcD8A9DyB12mmvuexHP',
        secure: true
    },
    bucket: {
        // pro: {
        //     name: 'vhallstatic',
        //     // refreshPath: 'your refresh url', //可选，deploy后刷新缓存，必需保证url正确
        // },
        test: {
            name: 't-vhallsaas-static',
            projectPath: `/common-static/middle/middle-domain/${version}/dist`, //可选，添加项目文件夹(需修改webpack的baseUrl,以保证资源文件路径正确)，不填默认为空
            refreshPath: `/common-static/middle/middle-domain/${version}/dist`
        },
    },
})
