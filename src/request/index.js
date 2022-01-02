import VhallSaasSDK from '@/sdk'
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

class RequestApi {
    constructor() {
        this.live = VhallSaasSDK.requestApi.live;
        this.roomBase = roomBase;
        this.user = user;
        this.insertFile = insertFile;
        this.virtualClient = virtualClient;
        this.interactive = interactive;
        this.mic = mic;
        this.doc = doc;
        this.player = player;

        this.im = {
            chat: imChat,
            keyWords: imKeyWords,
            privateChat: imPrivateChat,
            signaling: imSignaling,
            notice: imNotice,
            chatAuth: imChatAuth
        };

        this.meeting = {};

        this.room = {
            activity: activity
        };
    }
}

const requestApi = new RequestApi();
export default requestApi;
