//common
import contextServer from '@/domain/common/context.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import useInteractiveServer from '@/domain/stream/interactive.server.js'
import useMediaCheckServer from '@/domain/stream/mediaCheck.server.js'
import usePlayerServer from '@/domain/player/player.server.js'
import useDocServer from '@/domain/doc/doc.server.js'

import useRoomBaseServer from '@/domain/roombase/roombase.server.js'
import useUserServer from '@/domain/user/user.server.js'
import useVirtualAudienceServer from '@/domain/virtualAudience/virtualAudience.server.js'
import useInsertFileServer from '@/domain/stream/insertFile.server.js'

import useRoomInitGroupServer from '@/domain/roombase/roomInit.group.server.js'
import useDesktopShareServer from "@/domain/stream/desktopShare.server.js";
import useChatServer from "@/domain/chat/chat.server.js";
import useMicServer from "@/domain/stream/mic.server.js";
import useNoticeServer from "@/domain/notice/notice.server.js";
import userMemberServer from "@/domain/member/member.server.js";
import groupDiscussionServer from "@/domain/groupDiscussion/groupDiscussion.server.js";

export {
    contextServer,
    useMsgServer,
    useRoomBaseServer,
    useUserServer,
    usePlayerServer,
    useVirtualAudienceServer,
    useRoomInitGroupServer,
    useInteractiveServer,
    useMediaCheckServer,
    useInsertFileServer,
    useDesktopShareServer,
    useChatServer,
    useMicServer,
    useDocServer,
    useNoticeServer,
    userMemberServer,
    groupDiscussionServer
};
