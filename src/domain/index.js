//common
import contextServer from '@/domain/common/context.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import useInteractiveServer from '@/domain/stream/interactive.server.js'
import useMediaCheckServer from '@/domain/stream/mediaCheck.server.js'


import useRoomBaseServer from '@/domain/roombase/roombase.server.js'
import useUserServer from '@/domain/user/user.server.js'
import useVirtualAudienceServer from '@/domain/virtualAudience/virtualAudience.server.js'
import useInsertFileServer from '@/domain/stream/insertFile.server.js'

import useRoomInitGroupServer from '@/domain/roombase/roomInit.group.server.js'

import useDesktopShareServer from "@/domain/stream/desktopShare.server.js";
import useChatServer from "@/domain/chat/chatServer";

export {
    contextServer,
    useMsgServer,
    useRoomBaseServer,
    useUserServer,
    useVirtualAudienceServer,
    useRoomInitGroupServer,
    useInteractiveServer,
    useMediaCheckServer,
    useInsertFileServer,
    useDesktopShareServer,
    useChatServer
};
