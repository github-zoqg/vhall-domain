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
import player from './player.js';
import rebroadcast from './room/rebroadcast';
import liveTimerApi from './live-timer';
import watchSignApi from './watch-sign/index';
import giftsApi from './gifts/index';
import rewardApi from './reward/index';
import cash from './cash';
import attentionApi from './attention';
import praiseApi from './praise/index';

// 问答
import qaList from './qa/list/index.js';
import qaPrivateChat from './qa/privateChat/index.js';

// 商品
import goodSaasApi from './good/index.js';

const im = {
  chat: imChat,
  keyWords: imKeyWords,
  privateChat: imPrivateChat,
  signaling: imSignaling,
  notice: imNotice,
  chatAuth: imChatAuth
};
const room = {
  activity: activity
};

// 问答
const qa = {
  list: qaList,
  privateChat: qaPrivateChat
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
  room,
  qa,
  rebroadcast,
  liveTimerApi,
  giftsApi,
  rewardApi,
  cash,
  attentionApi,
  goodSaasApi,
  praiseApi,
  watchSignApi
};
