export default {
  //基础sdk
  base: {
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-base/vhall-msg-1.1.1.js'
  },
  //播放器sdk
  player: {
    name: 'VhallPlayer',
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-player/latest/vhall-jssdk-player-2.4.8.js'
  },
  //聊天sdk
  chat: {
    name: 'VhallChat',
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-chat/2.1.5/vhall-jssdk-chat-2.1.5.js'
  },
  //互动sdk
  interaction: {
    name: 'VhallRTC',
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-interaction/latest/vhall-jssdk-interaction-2.4.1.js'
  },
  //文档sdk
  doc: {
    name: 'VHDocSDK',
    url: '//static.vhallyun.com/jssdk/vhall-jssdk-doc/latest/vhall-jssdk-doc-3.4.3.js'
  },
  questionnaire: {
    name: 'VhallQuestionnaire',
    // url: '//s3.e.vhall.com/common-static/middle/questionnaire/1.0.9/questionnaire_service.js',
    url: '//t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/middle/questionnaire/1.0.11-test3/questionnaire_service.js',
    // url: 'http://localhost:2566/questionnaire_service.js',
    defer: true // 新增属性，延迟执行
  }
};
