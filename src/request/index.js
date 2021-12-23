import '../libs/sdk.js';
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
import meetingChat from './meeting/chat/index.js';


class RequestApi {
    constructor() {
        this.live = window.VhallSaasSDK.requestApi.live;
        this.roomBase = roomBase;
        this.user = user;
        this.insertFile = insertFile;
        this.virtualClient = virtualClient;
        this.interactive = interactive;
        this.mic = mic;
        this.doc = doc;


        this.im = {
            chat:imChat,
            keyWords:imKeyWords,
            privateChat:imPrivateChat,
            signaling:imSignaling
        };

        this.meeting = {
            chat:meetingChat,
        }


    }
}

const requestApi = new RequestApi()
export default requestApi
