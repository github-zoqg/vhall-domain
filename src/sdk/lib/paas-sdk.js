export default {
  //基础sdk
  base: {
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-base/vhall-msg-1.1.1.js'
  },
  //播放器sdk
  player: {
    name: 'VhallPlayer',
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-player/latest/vhall-jssdk-player-2.5.1.js'
  },
  //聊天sdk
  chat: {
    name: 'VhallChat',
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-chat/2.1.5/vhall-jssdk-chat-2.1.5.js'
  },
  //互动sdk
  interaction: {
    name: 'VhallRTC',
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-interaction/latest/vhall-jssdk-interaction-2.4.2.js'
  },
  //文档sdk
  doc: {
    name: 'VHDocSDK',
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-doc/latest/vhall-jssdk-doc-3.4.6.js'
  },
  questionnaire: {
    name: 'VhallQuestionnaire',
    url: '//s3.e.vhall.com/common-static/middle/questionnaire/1.0.22/questionnaire_service.js',
    defer: true // 新增属性，延迟执行
  },
  exam: {
    name: "ExamTemplateServer",
    url: "//s3.e.vhall.com/common-static/vhall-form/1.0.0/vhall-form-vue.js"
  }
};
