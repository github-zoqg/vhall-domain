import contextServer from '@/domain/common/context.server.js';
import useMsgServer from '@/domain/common/msg.server.js';
import useRoomBaseServer from '@/domain/room/roombase.server.js';
import useInteractiveServer from '@/domain/media/interactive.server.js';
import { getBaseUrl, setToken, setRequestHeaders } from '@/utils/http.js';
import { merge } from '@/utils/index.js';
import useMicServer from '@/domain/media/mic.server.js';
import VhallPaasSDK from '../../sdk';

export default function useRoomInitGroupServer(options = {}) {
  let state = {
    bizId: options.biz_id || 2, // 区分 端（知客/直播） 2-直播 4-知客
    vhallSaasInstance: null,
    live_token: null
  };

  let roomBaseServer = useRoomBaseServer();
  let msgServer = useMsgServer();
  let interactiveServer = useInteractiveServer();
  let micServer = useMicServer();

  contextServer.set('roomBaseServer', roomBaseServer);
  contextServer.set('msgServer', msgServer);
  contextServer.set('interactiveServer', interactiveServer);
  contextServer.set('micServer', micServer);

  async function reload() {
    msgServer.destroy();
    await msgServer.init();
  }

  function setRequestConfig(options) {
    setToken(options.token, options.liveToken);

    if (options.requestHeaders) {
      setRequestHeaders(options.requestHeaders);
    }
  }
  async function initSendLive(customOptions = {}) {
    VhallPaasSDK.init({
      plugins: customOptions.plugins || ['chat', 'player', 'doc', 'interaction']
    })
    const defaultOptions = {
      clientType: 'send',
      development: true,
      requestHeaders: {
        platform: 7
      }
    };
    roomBaseServer.setClientType('send');

    if (customOptions.liveToken) {
      state.live_token = customOptions.liveToken;
    }

    const options = merge.recursive({}, defaultOptions, customOptions);

    if (!options.baseUrl) {
      options.baseUrl = getBaseUrl();
    }

    setRequestConfig(options);

    await roomBaseServer.init(options);
    if (roomBaseServer.state.watchInitData.webinar.mode === 6) {
      // 如果是分组直播
      roomBaseServer.setGroupType(true);
    }

    return true;
  }

  async function initReceiveLive(customOptions = {}) {
    VhallPaasSDK.init({
      plugins: customOptions.plugins || ['chat', 'player', 'doc', 'interaction']
    })
    const defaultOptions = {
      clientType: 'receive',
      development: true,
      requestHeaders: {
        platform: 7
      },
      receiveType: 'standard'
    };
    roomBaseServer.setClientType('receive');

    const options = merge.recursive({}, defaultOptions, customOptions);

    if (!options.baseUrl) {
      options.baseUrl = getBaseUrl();
    }

    setRequestConfig(options);

    await roomBaseServer.init(options);
    if (
      roomBaseServer.state.watchInitData.webinar.mode === 6 &&
      roomBaseServer.state.watchInitData.webinar.type == 1
    ) {
      // 如果是分组直播
      roomBaseServer.setGroupType(true);
      await roomBaseServer.getGroupInitData();
    }
    return true;
  }

  const result = {
    state,
    roomBaseServer,
    msgServer,
    interactiveServer,
    reload,
    initSendLive,
    initReceiveLive
  };

  function addToContext() {
    contextServer.set('roomInitGroupServer', result);
  }

  return result;
}
