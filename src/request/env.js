// 配置各模块使用 v3 接口还是 v4 接口

export default {
  meeting: 'v3',
  user: 'v3',
  customMenu: 'v3',
  insertFile: 'v3',
  virtualClient: 'v3',
  interactive: 'v3',
  doc: 'v3',
  group: 'v3',
  imChat: 'v3',
  imKeyWords: 'v3',
  imPrivateChat: 'v3',
  imSignaling: 'v3',
  imNotice: 'v3',
  imChatAuth: 'v3',
  activity: 'v3', //活动开关
  player: 'v3',
  brand: 'v3',
  qa: 'v3',
  rebroadcast: 'v3',
  gifts: 'v3',
  entryform: 'v3',
  gray: 'v3',
  gifts: 'v3',
  signUpForm: 'v3'
};

//中台api接口清单
export const meetingApiList = {
  initSendLive: {
    v3: "/v3/webinars/live/init",
    middle: "/v4/meeting/live/init"
  },
}

export const roomApiList = {
  startLive: {
    v3: "/v3/webinars/live/start",
    middle: "/v4/room/webinar/start"
  },
  endLive: {
    v3: "/v3/webinars/live/end",
    middle: "/v4/room/webinar/end"
  },
  getInavToolStatus: {
    v3: "/v3/interacts/room/get-inav-tool-status",
    middle: "/v4/room/get-inav-tool-status"
  },
  setDeviceStatus: {
    v3: "/v3/interacts/room/set-device-status",
    middle: "/v4/room/set-device-status"
  },
  setDevice: {
    v3: "/v3/interacts/room/set-device",
    middle: "/v4/room/set-device"
  },
  webinarInitBefore: {
    v3: "/v3/webinars/webinar/init-before",
    middle: "/v4/room/webinar/init-before"
  },
  getActivityBasicInfo: {
    v3: "/v3/webinars/webinar/info",
    middle: "/v4/room/webinar/info"
  }
}

export const roomSubjectApiList = {
  subjectInitBefore: {
    v3: "/v3/webinars/subject/init-before",
    middle: "/v4/room-subject/subject/init-before"
  },
  getSubjectInfo: {
    v3: "/v3/webinars/subject/info",
    middle: "/v4/room-subject/subject/info"
  }
}
