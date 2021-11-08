let count = 0;
let count2 = 0;
let count3 = 0
export default class Msg {
    constructor(params, type = '') {
        switch (type) {
            case '发起端':
                this.generateLiveMsg(params);
                break;
            case '观看端':
                this.generateWatchMsg(params);
                break;
            case 'h5':
                this.generateH5Msg(params);
                break;
            default:
                break;
        }
    }

    //组装发起端消息
    generateLiveMsg(params = {}) {
        let {
            avatar = '',
            sendId = '',
            nickName = '',
            type = 'text',
            showTime = '',
            roleName = '',
            content = {},
            sendTime = '',
            client = '',
            replyMsg = {},
            msgId = '',
            channel = '',
            atList = [],
            isHistoryMsg = false
        } = params;

        // 用户id
        this.type = type;
        this.avatar = avatar;
        this.sendId = sendId;
        this.nickName = nickName;
        this.roleName = roleName;
        this.content = content;
        this.showTime = showTime;
        this.sendTime = sendTime;
        this.client = client;
        this.count = count++;
        this.replyMsg = replyMsg;
        this.msgId = msgId;
        this.channel = channel;
        this.atList = atList;
        this.isHistoryMsg = isHistoryMsg;
    }

    //组装观看端消息
    generateWatchMsg(params = {}) {
        let {
            avatar = '',
            sendId = '',
            nickName = '',
            type = 'text',
            showTime = '',
            roleName = '',
            content = {},
            sendTime = '',
            client = '',
            replyMsg = {},
            msgId = '',
            channel = '',
            atList = [],
            isHistoryMsg = false,
            interactStatus = false,
            isCheck = false,
            interactToolsStatus = false
        } = params;
        // 用户id
        this.type = type;
        this.avatar = avatar;
        this.sendId = sendId;
        this.nickName = nickName;
        this.roleName = roleName;
        this.content = content;
        this.showTime = showTime;
        this.sendTime = sendTime;
        this.client = client;
        this.count = count2++;
        this.replyMsg = replyMsg;
        this.msgId = msgId;
        this.channel = channel;
        this.atList = atList;
        this.isHistoryMsg = isHistoryMsg;
        this.interactStatus = interactStatus;
        this.isCheck = isCheck;
        this.interactToolsStatus = interactToolsStatus;
    }

    //组装wap端消息
    generateH5Msg(params = {}) {
        let {
            avatar = '',
            sendId = '',
            nickName = '',
            type = 'text',
            showTime = '',
            roleName = '',
            content = {},
            sendTime = '',
            client = '',
            self = false,
            replyMsg = {},
            atList = [],
            context = {}, // 回复或者@消息集合
            source = 'mobile' // 暂时没用到
        } = params;
        // 用户id
        this.type = type;
        this.avatar = avatar;
        this.sendId = sendId;
        this.nickName = nickName;
        this.roleName = roleName;
        this.content = content;
        this.showTime = showTime;
        this.sendTime = sendTime;
        this.client = client;
        this.count = count3++;
        this.self = self;
        this.replyMsg = replyMsg;
        this.atList = atList;
        this.context = context;
        this.source = source;
    }
}
