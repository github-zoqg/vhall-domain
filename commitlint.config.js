/**
 * Created by yangxy on 2021/12/08.
 * Copy from middle-platform
 * commitlint 是当前使用最为广泛的 git commit 提交信息校验约束工具之一
 * config-conventional是社区整理的常用的commit规范。
 * 链接：https://www.npmjs.com/package/@commitlint/config-conventional
 * 配合：commit-msg hook 使用
 * 使用规则： git commit -am '<type>: <subject>'   # 注意冒号后面有一个空格
 * 使用示例： git commit -am 'style: 缩进改成两空格'
 */
 module.exports = {
    extends: ['@commitlint/config-conventional'],
    'subject-case': [0, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build', // 主要目的是修改项目构建系统(例如 glup，webpack，rollup 的配置等)的提交
        'chore', // 不属其他类型的类型(日常事务)
        'ci', // 主要目的是修改项目继续集成流程(例如 Travis，Jenkins，GitLab CI，Circle等)的提交
        'docs', // 文档更新
        'feat', // 新增功能
        'fix', // bug修复
        'perf', // 性能优化
        'refactor', // 重构代码(既没有新增功能，也没有修复 bug)
        'revert', // 回滚某个更早之前的提交
        'style', // 不影响程序逻辑的代码修改(修改空白字符，补全缺失的分号等)
        'test' // 新增测试用例或是更新现有测试
      ]
    ]
  };
  