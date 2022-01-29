import $http from '@/utils/http.js'
import contextServer from "@/domain/common/context.server.js"

// 初始化问答信息----予以提供聊天实例化
const v3InitChatMess = (params = {}) => {
  // const { state } = contextServer.get('roomBaseServer')

  let retParams = {
    // room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)

  return $http({
    url: '/v3/webinars/live/get-connect',
    type: 'GET',
    data: retParams
  })
}

// 主持人开启问答
const v3GetQa = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)

  return $http({
    url: '/v3/interacts/qa/enable',
    type: 'POST',
    data: retParams
  })
}

// 主持人关闭问答
const v3CloseQa = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/qa/enable',
    type: 'POST',
    data: retParams
  })
}

// 获取当前场次收集到的问题个数
const v3GetQaNum = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/qa/get-current-play-question-num',
    type: 'POST',
    data: retParams
  })
}

// 获取当前场次收集到的历史问答 主持人
const v3ReplayUserQu = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/qa/reply-user-question',
    type: 'POST',
    data: retParams
  })
}

// 提问列表
const getAutherQa = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/qa/get-question-by-status',
    type: 'POST',
    data: retParams
  })
}

// 发送私聊信息
const sendPrivateMsg = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/chat-private/send-message',
    type: 'POST',
    data: retParams
  })
}

// 文字回复---私密
const v3GetTextReply = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/qa/get-answer-list',
    type: 'POST',
    data: retParams
  })
}

// 主持人撤销回复
const v3Revoke = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/qa/revoke-reply',
    type: 'POST',
    data: retParams
  })
}

// 获取私聊列表
const v3GetPrivateList = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/chat-private/get-rank-list',
    type: 'POST',
    data: retParams
  })
}

// 获取私聊内容
const v3GetPrivCon = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/chat-private/get-list',
    type: 'POST',
    data: retParams
  })
}

// 设置联系人列表
const v3SetUser = (params = {}) => {
  let retParams = {
    room_id: params.room_id || state.watchInitData.interact.room_id,
  }
  retParams = Object.assign(retParams, params)
  return $http({
    url: '/v3/interacts/chat-private/set-rank-list',
    type: 'POST',
    data: retParams
  })
}

export default {
  v3InitChatMess,
  v3GetQa,
  v3CloseQa,
  v3GetQaNum,
  v3ReplayUserQu,
  getAutherQa,
  sendPrivateMsg,
  v3GetTextReply,
  v3Revoke,
  v3GetPrivateList,
  v3GetPrivCon,
  v3SetUser
}
