import live from './live';
import roomBase from './roomBase.js';
import user from './user.js';
import insertFile from './insertFile.js';
import virtualClient from './virtualClient.js';
import interactive from './interactive.js';
import mic from './mic.js';
import doc from './doc.js';
import imChat from './im/chat/index.js';
import imKeyWords from './im/keyWords/index.js';
import imPrivateChat from './im/privateChat/index.js';
import imSignaling from './im/signaling/index.js';
import imNotice from './im/notice/index.js';
import imChatAuth from './im/chatAuth/index.js';
import activity from './room/activity/index.js';
import player from './player.js';

export default {
  live,
  roomBase,
  user,
  insertFile,
  virtualClient,
  interactive,
  mic,
  doc,
  player,
  im: {
    chat: imChat,
    keyWords: imKeyWords,
    privateChat: imPrivateChat,
    signaling: imSignaling,
    notice: imNotice,
    chatAuth: imChatAuth
  },
  room: {
    activity: activity
  }
};
