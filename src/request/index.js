import customMenu from './brand/customMenu/index';
import meeting from './meeting/index.js';
import user from './user.js';
import insertFile from './insertFile.js';
import virtualClient from './virtualClient.js';
import interactive from './interactive.js';
import doc from './doc.js';
import group from './group.js';
import imChat from './im/chat/index.js';
import imKeyWords from './im/keyWords/index.js';
import imPrivateChat from './im/privateChat/index.js';
import imSignaling from './im/signaling/index.js';
import imNotice from './im/notice/index.js';
import imChatAuth from './im/chatAuth/index.js';
import activity from './room/activity/index.js';
import roomBase from './room/index.js';
import webinar from './room/webinar/index.js';
import player from './player.js';
import rebroadcast from './room/rebroadcast';
import liveTimerApi from './live-timer';
import watchSignApi from './watch-sign/index';
import giftsApi from './gifts/index';
import rewardApi from './reward/index';
import cash from './cash';
import attentionApi from './attention';
import praiseApi from './praise/index';
import inviteApi from './invite';
import entryformApi from './entryform/index';
import subscribeApi from './subscribe';
import wechatApi from './brand/wechat';
import signUpFormApi from "./signUpForm";
import homepageApi from './homepage';
import recommendApi from './recommend'

// 问答
import qaList from './qa/list/index.js';

// 商品
import goodSaasApi from './good/index.js';
// 专题
import subject from './room-subject/subject';
//快问快答
import exam from './exam.js'
const im = {
  chat: imChat,
  keyWords: imKeyWords,
  privateChat: imPrivateChat,
  signaling: imSignaling,
  notice: imNotice,
  chatAuth: imChatAuth
};

const roomApi = {
  base: roomBase,
  activity: activity,
  webinar: webinar
};

const roomSubjectApi = {
  subject: subject
}

// 问答
const qa = {
  list: qaList
};

export {
  customMenu,
  meeting,
  user,
  insertFile,
  virtualClient,
  interactive,
  doc,
  group,
  player,
  im,
  roomApi,
  qa,
  rebroadcast,
  liveTimerApi,
  giftsApi,
  rewardApi,
  cash,
  attentionApi,
  goodSaasApi,
  praiseApi,
  watchSignApi,
  inviteApi,
  entryformApi,
  subscribeApi,
  wechatApi,
  signUpFormApi,
  homepageApi,
  roomSubjectApi,
  recommendApi,
  exam
};
