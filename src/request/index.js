import meeting from './meeting/index.js';
import user from './user.js';
import insertFile from './insertFile.js';
import virtualClient from './virtualClient.js';
import interactive from './interactive.js';
import doc from './doc.js';
import imChat from './im/chat/index.js';
import imKeyWords from './im/keyWords/index.js';
import imPrivateChat from './im/privateChat/index.js';
import imSignaling from './im/signaling/index.js';
import imNotice from './im/notice/index.js';
import imChatAuth from './im/chatAuth/index.js';
import activity from './room/activity/index.js';
import player from './player.js';
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
export { meeting, user, insertFile, virtualClient, interactive, doc, player, im, room };
