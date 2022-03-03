export const configMap = function (data) {
  const keyMap = {
    100001: 'ui.hide_logo_but_show_login', //logo下显示登录注册
    100002: 'ui.hide_live_helper',  //直播助手
    100003: 'ui.hide_favicon', // 浏览器顶部微吼图标
    100004: 'ui.hide_hostOnly', //只发给主持人勾选框（主持人聊天设置）",(线上互动直播已废弃)
    100005: 'ui.hide_share', // 分享 1
    // 100008: 发起端没用
    // 100008: 'ui.hide_guest_normal_userlist',
    // 100008: 'ui.hide_assistant_userlist',
    // 100009: ui.hide_host_userlist_nums/ui.hide_host_userlist_nums
    100009: 'ui.hide_host_nums', // 在线人数（人员列表下面）TODO 接口好了，用上面两个字端判断
    100010: 'ui.hide_handsUp', // 允许举手开关
    100011: 'white_board', //文档白板模块  v3-lives没有用
    100012: 'ui.hide_survey', //问卷
    100013: 'members_manager', // TODO成员
    100014: 'ui.hide_lottery', // 抽奖
    100015: 'comment_check', // 开启手动过滤
    100016: 'ui.is_hide_qa_button', // 问答
    100017: 'disable_msg', // 全员禁言
    100018: 'ui.show_redpacket', //红包
    100019: 'webinar_notice', // TODO公告
    100020: 'cut_record', // 录制
    100021: 'ui.hide_live_end', // 是否隐藏结束按钮
    100022: 'ui.hide_sign_in', // 签到
    100023: 'btn_thirdway', // 第三方发起
    100024: 'is_interact_and_host', // 举手列表
    100025: 'is_interact', //分屏
    100026: 'is_membermanage', //受限列表
    100027: 'rebroadcast', // 转播
    100028: 'virtual_user', // 虚拟人数
    100029: 'close_assistant_flip_doc', //TODO助理文档翻页权限
    100030: 'hide-document', // 文档模块
    100033: 'waiting.video.file', // 插播文件
    100034: 'webinar.timer', //计时器
    100035: 'webinar.group' // 分组
  }
  let configList = {}
  data.map(item => {
    configList[keyMap[item]] = 1
  })
  return configList
}
