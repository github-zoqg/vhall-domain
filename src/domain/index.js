//common
import contextServer from '@/domain/common/context.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import useInteractiveServer from '@/domain/media/interactive.server.js'
import useMediaCheckServer from '@/domain/media/mediaCheck.server.js'
import usePlayerServer from '@/domain/player/player.server.js'
import useDocServer from '@/domain/doc/doc.server.js'

import useRoomBaseServer from '@/domain/room/roombase.server.js'
import useUserServer from '@/domain/user/user.server.old.js'
import useVirtualAudienceServer from '@/domain/audience/virtualAudience.server.js'
import useInsertFileServer from '@/domain/media/insertFile.server.js'

import useRoomInitGroupServer from '@/domain/room/roomInit.group.server.js'
import useDesktopShareServer from "@/domain/media/desktopShare.server.js";
import useChatServer from "@/domain/im/chat.server.js";
import useMicServer from "@/domain/media/mic.server.js";
import useNoticeServer from "@/domain/im/notice.server.js";
import useMemberServer from "@/domain/member/member.server.js";
import useGroupDiscussionServer from "@/domain/room/groupDiscussion.server.js";

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
    useMemberServer,
    useGroupDiscussionServer
};
