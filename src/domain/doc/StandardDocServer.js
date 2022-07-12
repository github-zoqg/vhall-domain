import AbstractDocServer from './AbstractDocServer';
import { merge, sleep } from '../../utils';
import useRoomBaseServer from '../room/roombase.server';
import useGroupServer from '../group/StandardGroupServer';
import useRebroadcastServer from '../interactiveTools/rebroadcast.server';
import useMsgServer from '../common/msg.server';
import { doc as docApi } from '../../request/index.js';
import request from '@/utils/http.js';
import useMicServer from '../media/mic.server';
import useInsertFileServer from '../media/insertFile.server';
import useDesktopShareServer from '../media/desktopShare.server';
/**
 * 标准（通用）直播场景下的文档白板服务
 * 继承自AbstractDocServer
 * 规则：
 * 1、当前最多只有一个文件和一个白板，当前展示其中一个
 * 2、
 *
 * @class StandardDocServer
 */
export default class StandardDocServer extends AbstractDocServer {
  constructor() {
    super();

    this.state = {
      isChannelChanged: false, // 频道是否变更，进入/退出小组时变化
      currentCid: '', //当前正在展示的容器id
      docCid: '', // 当前文档容器Id
      boardCid: '', // 当前白板容器Id
      containerList: [], // 动态容器列表

      pageTotal: 1, //总页数
      pageNum: 1, // 当前页码

      allComplete: true,
      docLoadComplete: true, // 文档是否加载完成

      thumbnailList: [], // 缩略图列表
      switchStatus: false, // 直播中观众是否可见

      isVodUpdateFirst: true, //是否回放update消息第一次执行

    };

    // 由于文档对象的创建需要指定具体的宽高，而宽高需要根据具体dom计算，所以需要在文档组件初始化时初始化该方法
    // 获取文档宽高的方法
    this.getDocViewRect = null;
  }

  /**
   * 获取单实例
   * @returns
   */
  static getInstance() {
    if (!StandardDocServer.instance) {
      StandardDocServer.instance = new StandardDocServer();
    }
    return StandardDocServer.instance;
  }

  /**
   * 初始化
   * @param {Object} customOptions
   * @returns {Promise}
   */
  async init(customOptions = {}) {
    const defaultOptions = await this._getDefaultOptions();

    const options = merge.recursive({}, defaultOptions, customOptions);
    // 初始化 passDocInstance
    return this.initialize(options)
      .then(() => {
        // 实例化PaaS文档成功
        // 初始化事件
        this._initEvent();
        const { watchInitData } = useRoomBaseServer().state;
        if (watchInitData.join_info.role_name == 3) {
          this.setRole(VHDocSDK.RoleType.ASSISTANT);
        }
        // 无延迟
        if (watchInitData.webinar.no_delay_webinar) {
          this.setPlayMode(VHDocSDK.PlayMode.INTERACT);
        }
        if (watchInitData?.rebroadcast?.channel_id) {
          // 直播中旁路频道
          this.setRelay(true); // 转播中
          this.setRole(VHDocSDK.RoleType.SPECTATOR);
          this.setPlayMode(VHDocSDK.PlayMode.FLV);
        }
      })
      .catch(ex => {
        console.error('实例化PaaS文档失败', ex);
      });
  }

  // 获取默认初始化参数
  async _getDefaultOptions() {
    const { watchInitData, interactToolStatus } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state;
    // 初始化参数
    const defaultOptions = {
      isVod: [4, 5].includes(watchInitData.webinar?.type) && watchInitData.record?.paas_record_id, // 是否是点播和回放
      appId: watchInitData.interact.paas_app_id, // 互动应用ID，必填
      accountId: watchInitData.join_info.third_party_user_id, // 第三方用户ID，必填
      client: VHDocSDK.Client.PC_WEB // 客户端类型
    };

    // 如果当前用户进入了某个小组
    if (groupInitData && groupInitData.isInGroup) {
      // 当前用户在小组房间内
      defaultOptions.role = this.mapDocRole(this.hasDocPermission() ? 1 : 2); // 角色
      defaultOptions.roomId = groupInitData.group_room_id;
      defaultOptions.channelId = groupInitData.channel_id;
      defaultOptions.token = groupInitData.access_token;

      const groupMsgInitOptions = useMsgServer().getCurrentGroupMsgInitOptions()
      if (groupMsgInitOptions && groupMsgInitOptions.context) {
        // 文档的 context 字段需要转成字符串（聊天不用），否则断线重连会收不到重连人的上线消息，paas的bug，已反馈
        defaultOptions.context = JSON.stringify(groupMsgInitOptions.context)
      }
    } else {
      defaultOptions.role = this.mapDocRole(this.hasDocPermission() ? 1 : 2);
      defaultOptions.roomId = watchInitData.interact.room_id; // 必填。
      defaultOptions.channelId = watchInitData.interact.channel_id; // 频道id 必须
      defaultOptions.token = watchInitData.interact.paas_access_token; // access_token，必填

      const msgInitOptions = useMsgServer().getCurrentMsgInitOptions()
      if (msgInitOptions && msgInitOptions.context) {
        // 文档的 context 字段需要转成字符串（聊天不用），否则断线重连会收不到重连人的上线消息，paas的bug，已反馈
        defaultOptions.context = JSON.stringify(msgInitOptions.context)
      }
    }
    //  如果是无延迟直播，文档播放模式改为互动模式
    if (watchInitData.webinar.no_delay_webinar) {
      // 分组直播一定是无延迟直播 no_delay_webinar=1
      defaultOptions.mode = window.VHDocSDK.PlayMode.INTERACT;
    }

    const watermarkOptions = this.initWaterMark()
    Object.assign(defaultOptions, watermarkOptions)

    console.log('【defaultOptions】=====>:', defaultOptions)
    return defaultOptions;
  }

  /**
   * 根据直播用户的角色返回映射的文档角色
   * 文档角色：1-主持人 编辑、翻页、缩放
   *         2-嘉宾  缩放
   *         3-观众  缩放
   *         4-助理 翻页、缩放
   * @param {*} role 直播角色 1-主持人；2-观众；3-助理；4-嘉宾
   */
  mapDocRole(role) {
    if (role === 1) {
      return VHDocSDK.RoleType.HOST;
    } else if (role === 2) {
      return VHDocSDK.RoleType.SPECTATOR;
    } else if (role === 3) {
      return VHDocSDK.RoleType.ASSISTANT;
    } else if (role === 4) {
      return VHDocSDK.RoleType.GUEST;
    }
    return 'unkown role';
  }

  _initEvent() {
    const rebroadcastServer = useRebroadcastServer();
    // 转播开始，将观众可见置为 false 通过getContainerList判断最新的值
    rebroadcastServer.$on('live_broadcast_start', () => {
      this.state.switchStatus = false;
    });

    // 转播结束，将观众可见置为 false 通过getContainerList判断最新的值
    rebroadcastServer.$on('live_broadcast_stop', () => {
      this.state.switchStatus = false;
    });

    useMsgServer().$onMsg('ROOM_MSG', async (msg) => {
      const msgType = msg.data.event_type || msg.data.type;
      if (msgType === 'live_start') {
        // 直播开始
        console.log('live_start domain');
        const { watchInitData } = useRoomBaseServer().state;
        if (watchInitData.join_info.role_name == 1) {
          this.start(1, watchInitData.webinar.mode == 3 ? 2 : 1);
          setTimeout(() => {
            // 补发消息
            this.republish();
          }, 100);
        }
        this.$emit('live_start');

      } else if (msgType === 'live_over' || (msgType === 'group_switch_end' && msg.data.over_live === 1)) {
        // 直播结束（包括分组直播的结束）
        console.log('live_over domain');
        // 删除所有容器, 该方法包含重置观众不可见的逻辑
        this.resetContainer();

        // 还原
        this.state.currentCid = ''; //当前正在展示的容器id
        this.state.docCid = ''; // 当前文档容器Id
        this.state.boardCid = ''; // 当前白板容器Id
        this.state.containerList = []; // 动态容器列表
        this.state.pageTotal = 1; //总页数
        this.state.pageNum = 1; // 当前页码Ï
        this.state.allComplete = true;
        this.state.docLoadComplete = true; // 文档是否加载完成
        this.state.thumbnailList = []; // 缩略图列表
        this.state.switchStatus = false; // 观众是否可见

        const { watchInitData } = useRoomBaseServer().state;
        if (watchInitData.join_info.role_name == 1) {
          this.start(2, watchInitData.webinar.mode == 3 ? 2 : 1);
        }
        this.$emit('live_over');
      }
    })

    // 设置主讲人，消息只 发起端 能收到
    // 1、互动直播 - 主持人设置嘉宾为主讲人
    // 2、互动直播 - 嘉宾主讲人下麦，把主讲人还给主持人
    useRoomBaseServer().$on('VRTC_SPEAKER_SWITCH', async (msg) => {
      console.log('[doc] VRTC_SPEAKER_SWITCH', msg);
      if (!useGroupServer().state.groupInitData.isInGroup) {
        // 在直播间内
        await useRoomBaseServer().getInavToolStatus();
        this._setDocPermisson();
      }
    })

    // 所有文档加载完成事件
    this.on(VHDocSDK.Event.ALL_COMPLETE, () => {
      console.log('[doc]========所有文档加载完成======');
      this.state.allComplete = true;
      this.state.docLoadComplete = true;

      if (useRoomBaseServer().state.clientType === 'send') {
        // 主持端才需要获取缩略图
        setTimeout(() => {
          // 延迟100ms获取，否则sdk中要用到的某个数据可能还是空
          this.getCurrentThumbnailList();
        }, 100);
      }

      this.$emit('dispatch_doc_all_complete');
    });
    // 当前文档加载完成
    this.on(VHDocSDK.Event.DOCUMENT_LOAD_COMPLETE, data => {
      console.log('[doc]========当前文档加载完成======', data);
      this.state.pageTotal = data.info.slidesTotal;
      this.state.pageNum = Number(data.info.slideIndex) + 1;
      this.state.docLoadComplete = true;

      if (useRoomBaseServer().state.clientType === 'send') {
        // 主持端才需要获取缩略图
        setTimeout(() => {
          // 延迟100ms获取，否则sdk中要用到的某个数据可能还是空
          this.getCurrentThumbnailList();
        }, 100);
      }
      this.$emit('dispatch_doc_load_complete', data);
    });
    // 文档翻页事件
    this.on(VHDocSDK.Event.PAGE_CHANGE, data => {
      console.log('[doc]========文档翻页========');
      if (this.isWatch() && useRoomBaseServer().state.watchInitData.webinar.type != 1) return;
      this.state.pageTotal = data.info.slidesTotal;
      this.state.pageNum = Number(data.info.slideIndex) + 1;
      this.$emit('dispatch_doc_page_change', data);
    });

    // 观众可见按钮切换
    this.on(VHDocSDK.Event.SWITCH_CHANGE, status => {
      if (useRoomBaseServer().state.watchInitData.webinar.type != 1) return;
      console.log('[doc]========控制文档开关========', status);
      this.state.switchStatus = status === 'on';
      if (useRoomBaseServer().state.clientType != 'send') {
        this.resetLayoutByMiniElement()
      }
      this.$emit('dispatch_doc_switch_change', this.state.switchStatus);
    });

    // 创建容器
    this.on(VHDocSDK.Event.CREATE_CONTAINER, data => {
      console.log('[doc]========创建容器========', data);
      const { watchInitData } = useRoomBaseServer().state;
      if (watchInitData.join_info.role_name != 1 && watchInitData.webinar.type != 1) {
        // 如果不是主持人并且未开播，则不处理
        return;
      }
      if (typeof this.getDocViewRect === 'function') {
        const { width, height } = this.getDocViewRect();
        const { docId, id, type } = data;
        if (width > 0 && height > 0 && this.state.containerList.findIndex(item => item.cid == data.id) == -1) {
          console.log('======CREATE_CONTAINER 设置  docId= ');
          this.addNewDocumentOrBorad({ width, height, fileType: type, cid: id });
        }
      }
      this.$emit('dispatch_doc_create_container', data);
    });

    // 删除文档
    this.on(VHDocSDK.Event.DELETE_CONTAINER, data => {
      console.log('[doc]========删除容器========', data);
      if (data && data.id) {
        this.destroyContainer(data.id);
        const idx = this.state.containerList.findIndex((item) => item.cid == data.id);
        if (idx > -1) {
          this.state.containerList.splice(idx, 1);
        }
      }
      this.$emit('dispatch_doc_delete_container', data);
    });

    // 选中容器
    this.on(VHDocSDK.Event.SELECT_CONTAINER, data => {
      console.log('[doc]========选中容器========', data);
      const { watchInitData } = useRoomBaseServer().state;
      if (watchInitData.join_info.role_name != 1 && watchInitData.webinar.type != 1) {
        return;
      }
      if (this.state.currentCid == data.id) {
        return;
      }
      // 判断容器是否存在
      const currentItem = this.state.containerList.find(item => item.cid === data.id);
      if (currentItem) {
        this.activeContainer(data.id);
      } else {
        const { id: cid, docId } = data;
        const fileType = (cid || '').split('-')[0];
        if (fileType === 'document' && !docId) {
          // 文档id没有
          console.log('[doc] 文档id没有 cid:', cid);
          return;
        }
        this.addNewFile({ fileType, docId, cid });
      }
      this.$emit('dispatch_doc_select_container', data);
    });

    this.on(VHDocSDK.Event.DOCUMENT_NOT_EXIT, ({ cid, docId }) => {
      console.log('[doc]========文档不存在或已删除========', cid, docId);
      this.setDocLoadComplete();
      if (cid == this.currentCid) {
        setTimeout(() => {
          const index = this.containerList.findIndex(item => item.cid == cid);
          this.containerList.splice(index, 1);
          this.docServer.destroyContainer(cid);
          this.state.docCid = '';
          this.currentCid = '';
        }, 3000); // 其他地方调用回将值重新传入
        this.$emit('dispatch_doc_not_exit', { cid, docId });
      }
    });

    // 文档报错事件
    this.on(VHDocSDK.Event.ERROR, (ev) => {
      console.log('[doc]========文档报错=======', ev);
      this.setDocLoadComplete(true);
    })

    // 非单视频嵌入监听此事件
    if (!useRoomBaseServer().state.embedObj.embedVideo) {
      // 回放文档加载完成事件
      this.on(VHDocSDK.Event.VOD_CUEPOINT_LOAD_COMPLETE, async ({ chapters }) => {
        console.log('[doc]=======回放文档加载完成事件=======');
        // 获取回放文档容器数据
        const data = this.getVodAllCids();
        this.state.containerList = data.map(item => {
          return {
            cid: item.cid
          };
        });
        await this.domNextTick();
        if (this.state.containerList.length && typeof this.getDocViewRect === 'function') {
          const { width, height } = this.getDocViewRect();
          if (width > 0 && height > 0) {
            // 循环初始化容器数据
            for (const item of data) {
              this.initContainer({
                cid: item.cid,
                width,
                height,
                fileType: item.type.toLowerCase()
              });
            }
          }
        }

        // 获取点播或回放设置的章节
        this.$emit('dispatch_doc_vod_cuepoint_load_complate', chapters);
      });

      this.on(VHDocSDK.Event.VOD_TIME_UPDATE, data => {
        let isChange = this.state.switchStatus !== data.watchOpen;
        if (this.state.isVodUpdateFirst) {
          this.state.isVodUpdateFirst = false;
          isChange = true; //首次 isChange强制为true
        }
        // 是否文档可见
        this.state.switchStatus = data.watchOpen;
        if (data.activeId) {
          this.selectContainer(data.activeId, !this.hasDocPermission());
          this.state.currentCid = data.activeId;
        } else {
          this.state.currentCid = '';
        }
        this.$emit('dispatch_doc_vod_time_update', { isChange });
      });
    }
  }
  /**
   * 观众是否可见
   */
  toggleSwitchStatus() {
    if (this.state.switchStatus) {
      this.switchOffContainer();
      this.state.switchStatus = false;
      // 数据埋点-关闭观众可见
      window.vhallReportForProduct?.report(110024);
    } else {
      this.switchOnContainer();
      this.state.switchStatus = true;
      // 数据埋点-开启观众可见
      window.vhallReportForProduct?.report(110023);
    }
  }

  /**
   * 设置观众可见
   * @param {} val true/false
   */
  setSwitchStatus(val) {
    if (val) {
      this.switchOnContainer();
    } else {
      this.switchOffContainer();
    }
    this.state.switchStatus = !!val;
  }

  // 容器大小重置
  resize() {
    if (typeof this.getDocViewRect !== 'function') return;
    let { width, height } = this.getDocViewRect();
    if (!width || !height) {
      console.error(`[doc] resize 获取容器宽高异常width=${width},height=${height}`);
      return;
    }
    if (
      this.state.currentCid && document.getElementById(this.state.currentCid) &&
      document.getElementById(this.state.currentCid).childNodes.length) {
      try {
        this.setSize(width, height, this.state.currentCid);
      } catch (ex) {
        console.error('[doc] resize setSize:', ex);
      }
    }
  }

  /**
   * 获取容器列表信息
   */
  async getContainerList(channelId) {
    const rebroadcastChannelId = useRoomBaseServer().state?.watchInitData?.rebroadcast?.channel_id;
    if (rebroadcastChannelId) {
      channelId = rebroadcastChannelId;
    }
    // 获取该channelId下的所有容器列表信息
    const { list, switch_status } = await this.getContainerInfo(channelId);

    // 直播中
    if (useRoomBaseServer().state.watchInitData.webinar.type == 1) {
      // 观众端是否可见
      if (useGroupServer().state.groupInitData.isInGroup) {
        // 小组中文档始终可见
        this.state.switchStatus = true;
      } else {
        this.state.switchStatus = Boolean(switch_status);
      }
    } else {
      this.state.switchStatus = false;
    }
    // 通知观众可见状态
    this.$emit('dispatch_doc_switch_status', this.state.switchStatus);


    // 如果是发起端，主持人正在桌面共享，助理界面优先显示文档
    if (!this.isWatch() && useRoomBaseServer().state.watchInitData.join_info.role_name == 3 &&
      useDesktopShareServer().state.localDesktopStreamId) {
      if (this.state.currentCid) {
        useRoomBaseServer().setChangeElement('doc');
      } else {
        useRoomBaseServer().setChangeElement('stream-list');
      }
    }

    if (useRoomBaseServer().state.clientType != 'send') {
      this.resetLayoutByMiniElement()
    }

    // 小组内是否去显示文档判断根据是否有文档内容
    if (useGroupServer().state.isInGroup) {
      this.state.switchStatus = !!list.length;
    }
    this.state.containerList = list;
  }

  /***
   * 设置文档加载完成
   */
  setDocLoadComplete(val = true) {
    this.state.docLoadComplete = val;
  }

  /**
   * 增加
   * @param {*} param0
   */
  async addNewFile({ fileType, docId, docType, cid }) {
    const docViewRect = this.getDocViewRect();
    if (!docViewRect || docViewRect.width < 1 || docViewRect.height < 1) {
      return;
    }
    const { width, height } = docViewRect;
    await this.addNewDocumentOrBorad({
      width,
      height,
      fileType,
      cid,
      docId,
      docType
    });
    this.resize();
  }

  /**
   * 退出重进或刷新恢复数据
   * @param {Number} width 容器宽，必填
   * @param {height} height 容器高，必填
   * @returns
   */
  async recover({ width, height }) {
    console.log('[doc] recover start：');
    if (!width || !height) {
      console.error('容器宽高错误', width, height);
      this.setDocLoadComplete();
    }
    const noDispatch = this.isWatch() ? !this.hasDocPermission() : true;
    try {
      for (const item of this.state.containerList) {
        const fileType = item.is_board === 1 ? 'document' : 'board';
        if (
          fileType == 'document' &&
          this.state.docCid == item.cid &&
          document.getElementById(item.cid) &&
          document.getElementById(item.cid).childNodes.length
        ) {
          // 该文档元素已经初始化过，跳过
          continue;
        } else if (
          fileType == 'board' &&
          this.state.boardCid == item.cid &&
          document.getElementById(item.cid) &&
          document.getElementById(item.cid).childNodes.length
        ) {
          // 该白板元素已经初始化过，跳过
          continue;
        }
        await this.initDocumentOrBoardContainer({
          width,
          height,
          fileType,
          cid: item.cid,
          docId: item.docId,
          noDispatch
        });
        if (fileType == 'document') {
          this.state.docCid = item.cid;
          this.state.pageNum = item.show_page + 1;
          this.state.pageTotal = item.page;
        } else if (fileType == 'board') {
          this.state.boardCid = item.cid;
        }
        this.setRemoteData(item);
      }
      const activeItem = this.state.containerList.find(item => item.active === 1);
      if (activeItem) {
        if (activeItem.is_board == 1) {
          // 如果是文档
          this.state.pageNum = activeItem.show_page + 1;
          this.state.pageTotal = activeItem.page;
        }
        // 激活选中
        await this.activeContainer(activeItem.cid);
      }
      this.setDocLoadComplete();
    } catch (ex) {
      this.setDocLoadComplete();
      console.error('[doc] domain recover error:', ex)
    }
  }

  /**
   * 新增文档或白板
   * @param {Number} width 容器宽，必填
   * @param {height} height 容器高，必填
   * @param {String} fileType 创建类型，非必填，默认文档。 document：文档, board：白板
   * @param {String} cid 容器id，非必填，如果不存在需要调用 createUUID 新建
   * @param {String} docId 具体演示文件id,演示文档时必填，白板为空
   * @param {String} docType 具体演示文件类型,非必填，1:动态文档，即ppt；2:静态文档,即JPG
   */
  async addNewDocumentOrBorad({ width, height, fileType, cid, docId, docType }) {
    const noDispatch = this.isWatch() ? !this.hasDocPermission() : false;
    const elId = await this.initDocumentOrBoardContainer({
      width,
      height,
      fileType,
      cid,
      docId,
      docType,
      noDispatch
    });
    await this.activeContainer(elId);
    if (fileType === 'document' && docId) {
      const { status, status_jpeg, slideIndex, slidesTotal, converted_page, converted_page_jpeg } =
        await this.loadDoc({
          id: elId,
          docId,
          docType
        });
      if (Number(status) === 200) {
        this.state.pageNum = Number(slideIndex) + 1;
        this.state.pageTotal = slidesTotal;
      } else if (Number(status_jpeg) === 200) {
        this.state.pageNum = Number(converted_page) + 1;
        this.state.pageTotal = converted_page_jpeg;
      }
    }
  }

  /**
   * 初始化文档或白板容器
   * @param {Number} width 容器宽，必填
   * @param {height} height 容器高，必填
   * @param {String} fileType 创建类型，非必填，默认文档。 document：文档, board：白板
   * @param {String} cid 容器id，非必填，如果不存在需要调用 createUUID 新建
   * @param {String} docId 具体演示文件id,演示文档时必填，白板为空
   * @param {String} docType 具体演示文件类型,非必填，1:动态文档，即ppt；2:静态文档,即JPG
   * @param {String} noDispatch false-派发消息，true-不派发消息
   */
  async initDocumentOrBoardContainer({
    width,
    height,
    fileType = 'document',
    cid,
    docId = '',
    noDispatch = false
  }) {
    if (!cid) {
      cid = this.createUUID(fileType);
    }
    let opt = {
      id: cid,
      elId: cid, // 创建时，该参数就是cid
      docId: docId,
      width,
      height,
      backgroundColor: '#fff',
      noDispatch
    };
    if (this.state.containerList.findIndex(item => item.cid === cid) === -1) {
      // 说明容器不在列表中，主动添加
      this.state.containerList.push({ cid, docId });
      // 确保dom渲染
      await this.domNextTick();
    }
    try {
      if (fileType === 'document') {
        await this.createDocument(opt);
      } else {
        await this.createBoard(opt);
      }
    } catch (ex) {
      // 移除失败的容器
      this.state.containerList = this.state.containerList.filter(item => item.cid !== cid);
      console.error('[doc]:--------移除失败的容器------', ex);
      return;
    }
    return cid;
  }

  /**
   * 初始化容器
   * @param {String} cid 容器id，非必填，如果不存在需要调用 createUUID 新建
   * @param {Number} width 容器宽，必填，像素单位，数值型不带px
   * @param {height} height 容器高，必填，像素单位，数值型不带px
   * @param {String} fileType 创建类型，非必填，默认文档。 document：文档, board：白板
   * @param {String} docId 具体演示文件id,演示文档时必填，白板为空
   */
  async initContainer({
    cid,
    width,
    height,
    fileType = 'document',
    docId = ''
  }) {
    console.log('[doc] initContainer ');
    try {
      if (!cid) {
        cid = this.createUUID(fileType);
      }
      if (this.state.containerList.findIndex(item => item.cid === cid) === -1) {
        // 说明容器不在列表中，主动添加
        this.state.containerList.push({ cid, docId });
        // 确保dom渲染
        await this.domNextTick();
      }
      let noDispatch = !this.hasDocPermission();
      const opts = {
        id: cid,
        elId: cid,
        width: width,
        height: height,
        noDispatch
      };
      if (fileType === 'board') {
        this.state.boardCid = cid;
        opts.backgroundColor = '#FFFFFF';
        await this.createBoard(opts);
      } else {
        this.state.docCid = cid;
        opts.docId = docId;
        await this.createDocument(opts);
      }
    } catch (ex) {
      // 移除失败的容器
      this.state.containerList = this.state.containerList.filter(item => item.cid !== cid);
      console.error('[doc]:--------移除失败的容器------', ex);
      return;
    }
    return cid;
  }

  /**
   * 激活容器
   */
  activeContainer(cid) {
    console.log('[doc] activeContainer cid:', cid);
    this.selectContainer(cid, !this.hasDocPermission());
    const type = cid.split('-')[0];
    if (type === 'document') {
      this.state.docCid = cid;
    } else {
      this.state.boardCid = cid;
      if (!this.state.currentCid) {
        // 解决主持人开了白板进行插播时，嘉宾、助理端刷新后小屏白板展示不全问题
        setTimeout(() => {
          this.resize();
        })
      }
    }
    this.state.currentCid = cid;
  }

  /**
   * 获取当前文档的缩略图
   */
  getCurrentThumbnailList() {
    const res = this.docInstance.getThumbnailList();
    this.state.thumbnailList = res && res[0] ? res[0].list : [];
  }

  /**
   * 上传文档
   * @param {Object}} param
   */
  uploadFile(param) {
    const uploadUrl = docApi.uploadUrl;
    const { watchInitData } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state;
    // 创建form对象,必须使用这个,会自动把 content-type 设置成 multipart/form-data
    const formData = new FormData();
    formData.append('resfile', param.file);
    formData.append('type', groupInitData.isInGroup ? 3 : 2);
    formData.append('webinar_id', watchInitData.webinar.id);
    // 当分组直播时必传 group_id 必传
    formData.append('group_id', groupInitData.group_id);
    request
      .post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: window.localStorage.getItem('token') || '',
          platform: 7,
          'gray-id': watchInitData.join_info.user_id,
          'interact-token': watchInitData.interact.interact_token || ''
        },
        onUploadProgress: progressEvent => {
          if (progressEvent.lengthComputable) {
            const percent = (progressEvent.loaded / progressEvent.total) * 100;
            // 上传进度回传
            if (typeof param.onProgress === 'function') {
              param.onProgress(percent, param.file, param.fileList);
            }
          }
        }
      })
      .then(res => {
        // 根据后端给的信息判断是否上传成功
        if (res.code === 200) {
          res.data.webinar_id = watchInitData.webinar.id; // 补充字段
          param.onSuccess(res, param.file, param.fileList);
        } else {
          param.onError(res, param.file, param.fileList);
        }
      })
      .catch(ex => {
        param.onError(ex, param.file, param.fileList);
      });
  }

  // 获取资料库文档列表
  async getSharedDocList(params) {
    const result = await docApi.getSharedDocList(params);
    if (result && result.code === 200) {
      this._formatDocList(result.data?.list);
    }
    return result;
  }

  /**
   * 获取当前活动下文档列表
   * @param {Object} params
   * @returns
   */
  async getWebinarDocList(params) {
    const result = await docApi.getWebinarDocList(params);
    if (result && result.code === 200) {
      this._formatDocList(result.data?.list);
    }
    return result;
  }

  _formatDocList(list) {
    if (Array.isArray(list) && list.length) {
      // 补充数据
      // TODO 前端显示是否要区分静态转码和动态转码状态
      for (let item of list) {
        const statusJpeg = Number(item.status_jpeg);
        const status = Number(item.status);
        let docStatus = ''; // 文档状态 (前端上传时会有几个状态用这个字段)
        let transformProcess = 0;
        if (statusJpeg === 0 && status === 0) {
          docStatus = 'transwait'; // 等待转码
        } else if (statusJpeg === 100) {
          docStatus = 'transdoing'; // 转码中(静态转码中)
          const _percent = (parseInt(item.converted_page_jpeg) / parseInt(item.page)) * 100;
          transformProcess = parseInt(_percent);
        } else if (status === 100) {
          docStatus = 'transdoing'; // 转码中(动态转码中)
        } else if (statusJpeg === 200 || status === 200) {
          docStatus = 'transcompleted'; // 转码完成
          transformProcess = 100;
        } else {
          docStatus = 'transfailed'; // 转码失败
          transformProcess = 100;
        }
        item.docStatus = docStatus;
        item.transformProcess = transformProcess;
      }
    }
    return list;
  }

  isWatch() {
    return !['send', 'record', 'clientEmbed'].includes(useRoomBaseServer().state.clientType);
  }

  // 是否有文档演示权限
  hasDocPermission() {
    const { clientType, watchInitData, interactToolStatus } = useRoomBaseServer().state;
    const webinarType = Number(watchInitData.webinar.type);
    const isWatch = !['send', 'record', 'clientEmbed'].includes(clientType);
    if (isWatch && [4, 5].includes(webinarType)) {
      // 对于观看端 && 点播和回放，所有人都没有文档演示权限
      return false;
    }

    const { groupInitData } = useGroupServer().state;
    const userId = watchInitData.join_info.third_party_user_id;
    const presenterId = groupInitData.isInGroup ? groupInitData.presentation_screen :
      interactToolStatus.presentation_screen;
    // 当前用户是否演示者
    return presenterId == userId;
  }

  // 同步文档
  syncDoc(params) {
    const { watchInitData } = useRoomBaseServer().state;
    if (!params.webinar_id) {
      params.webinar_id = watchInitData.webinar.id;
    }
    if (!params.room_id) {
      params.room_id = watchInitData.interact.room_id;
    }
    return docApi.syncDoc(params);
  }

  // 删除文档(多选)
  delDocList(params) {
    const { watchInitData } = useRoomBaseServer().state;
    if (!params.webinar_id) {
      params.webinar_id = watchInitData.webinar.id;
    }
    if (!params.room_id) {
      params.room_id = watchInitData.interact.room_id;
    }
    return docApi.delDocList(params);
  }

  // 重置
  groupReInitDocProcess() {
    return this.init()
      .then(() => {
        // 重置数据
        this.resetState();
        // 注意这里用true
        this.state.isChannelChanged = true;
      })
      .catch(ex => {
        console.error('[doc] groupReInitDocProcess error:', ex);
      });
  }

  // 重置state数据
  resetState() {
    this.state.currentCid = ''; //当前正在展示的容器id
    this.state.docCid = ''; // 当前文档容器Id
    this.state.boardCid = ''; // 当前白板容器Id
    this.state.containerList = []; // 动态容器列表

    this.state.pageTotal = 1; //总页数
    this.state.pageNum = 1; // 当前页码

    this.state.allComplete = false;
    this.state.docLoadComplete = true; // 文档是否加载完成

    this.state.thumbnailList = []; // 缩略图列表

    // 观众是否可见
    if (useGroupServer().state.groupInitData.switch_status == 1
      && useGroupServer().state.groupInitData.isInGroup) {
      this.state.switchStatus = true; // 在小组中,文档始终可见
    } else {
      this.state.switchStatus = false; // 默认不可见
    }
  }

  async domNextTick() {
    if (window.Vue) {
      await window.Vue.nextTick();
    } else {
      await sleep(0);
    }
  }


  // 设置文档操作权限
  _setDocPermisson() {
    // 分组直播预约页的时候还没有加载文档sdk，VHDocSDK还不存在，但是有些消息的逻辑会调用此方法
    if (!window.VHDocSDK) return;
    const { interactToolStatus, watchInitData } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state;
    if (
      (groupInitData.isInGroup && groupInitData.presentation_screen ==
        watchInitData.join_info.third_party_user_id) ||
      (!groupInitData.isInGroup &&
        interactToolStatus.presentation_screen == watchInitData.join_info.third_party_user_id)
    ) {
      // 在小组内有要是权限，或者在主直播间有演示权限
      // 设置文档操作权限为主人
      this.setRole(VHDocSDK.RoleType.HOST);
    } else {
      if (watchInitData.join_info.role_name == 3) {
        this.setRole(VHDocSDK.RoleType.ASSISTANT);
      } else {
        // 设置文档操作权限为观众
        this.setRole(VHDocSDK.RoleType.SPECTATOR);
      }
    }


  }

  /**
   * 处理观看端布局
   */
  resetLayoutByMiniElement() {
    const { isInGroup } = useGroupServer().state.groupInitData
    const isShareScreen = !!useDesktopShareServer().state.localDesktopStreamId
    const isSpeakOn = useMicServer().getSpeakerStatus()
    const isInsertFilePushing = useInsertFileServer().state.isInsertFilePushing

    const setChangeElement = useRoomBaseServer().setChangeElement.bind(useRoomBaseServer())
    const {
      interactToolStatus: { presentation_screen, is_desktop },
      watchInitData: { join_info: { third_party_user_id, role_name }, webinar: { type, no_delay_webinar } }, embedObj
    } = useRoomBaseServer().state

    const switchStatus = this.isWatch() ? this.state.switchStatus : this.state.currentCid
    if (this.isWatch() && useRoomBaseServer().state.embedObj?.embedVideo) {
      // 如果是单视频嵌入的观看端，不应该有文档白板
      setChangeElement('');
      return;
    }

    // 小组内
    if (isInGroup) {
      // 小组内文档常显
      if (isSpeakOn) {
        // 上麦观众房间内不管有没有桌面共享，小屏都显示组长画面
        setChangeElement('stream-list');
      } else {
        if (isShareScreen) {
          // 未上麦观众应展示文档+桌面共享
          if (role_name == 2) {
            setChangeElement('doc');
          } else {
            setChangeElement('stream-list');
          }
        } else {
          // 如果在小组内,文档常显，所以小屏显示流画面
          setChangeElement('stream-list');
        }
      }
    }

    // 非小组
    if (!isInGroup) {
      // 不在小组内且自己是演示者
      if (presentation_screen == third_party_user_id) {
        // 直播状态下，无延迟或上麦是流列表
        setChangeElement('stream-list');
      } else if (switchStatus) {
        if ((isShareScreen || is_desktop == 1) && !isSpeakOn) {
          // 如果在插播或者桌面共享中，并且没上麦，文档是小窗，插播是大窗
          if (role_name == 4) {
            setChangeElement('stream-list')
          } else {
            setChangeElement('doc');
          }
        } else if (type == 1 && (no_delay_webinar == 1 || isSpeakOn)) {
          // 直播状态下，无延迟或上麦是流列表
          setChangeElement('stream-list');
        } else {
          // 文档如果可见,直接设置 播放器 为小屏
          setChangeElement('player');
        }

        // 如果开启插播，并且文档可见，小屏一定是文档
        if (isInsertFilePushing) {
          setChangeElement('doc');
        }
      } else {
        // 没有开文档
        if (isShareScreen) {
          // 有插播或者桌面共享
          if (isSpeakOn) {
            setChangeElement('stream-list');
          } else if (role_name == 3) {
            if (this.state.currentCid) {
              setChangeElement('doc');
            } else {
              setChangeElement('stream-list');
            }
          } else if (role_name != 2) {
            setChangeElement('stream-list');
          } else {
            setChangeElement('')
          }
        } else {
          setChangeElement('');
        }
      }
    }
  }

  /**
   * 获取文档水印配置
   */
  initWaterMark() {
    let watermarkOptions = {}
    const { watchInitData } = useRoomBaseServer().state;
    //非观众不设置文档水印
    if (watchInitData.join_info.role_name != 2) return {}
    let configWater = useRoomBaseServer().state.unionConfig['water-mark'] && useRoomBaseServer().state.unionConfig['water-mark'].data;
    // 水印  文档
    if (configWater && configWater.doc_watermark_open == 1) {

      let waterText = ''
      let waterText_arr = []
      configWater.doc_watermark_type.text && waterText_arr.push(configWater.doc_watermark_type.text_value)
      if (watchInitData.join_info.join_id) {
        configWater.doc_watermark_type.user_id && waterText_arr.push(watchInitData.join_info.join_id)
        configWater.doc_watermark_type.nick_name && waterText_arr.push(watchInitData.join_info.nickname)
      } else {
        let userInfo = localStorage.getItem('userInfo')
        configWater.doc_watermark_type.user_id && userInfo?.user_id && waterText_arr.push(userInfo.user_id)
        configWater.doc_watermark_type.nick_name && userInfo?.nick_name && waterText_arr.push(userInfo.nick_name)
      }
      waterText = waterText_arr.join('-')
      watermarkOptions = Object.assign({}, {
        watermarkOption: {  // 如果有watermarkOption则展示水印，否则不展示。
          text: waterText, // 水印内容，如果有watermarkOption必填，length最大为20
          angle: 15, // 水印逆时针倾斜角度，选填，默认15，取值范围 [0-360]
          color: configWater.doc_font_color || '#5a5a5a', // 水印颜色，选填，默认#000000
          opcity: configWater.doc_transparency || 50, // 水印透明度，选填，默认50，取值范围 [0-100]
          fontSize: configWater.doc_font_size || 12, // 字体大小，选填，默认12，取值范围 [12-48]
        }
      })
    }

    // Object.assign(defaultOptions, {
    //   watermarkOption: {  // 如果有watermarkOption则展示水印，否则不展示。
    //     text: '版权所有，盗版必究', // 水印内容，如果有watermarkOption必填，length最大为20
    //     angle: 15, // 水印逆时针倾斜角度，选填，默认15，取值范围 [0-360]
    //     color: '#5a5a5a', // 水印颜色，选填，默认#000000
    //     opcity: 50, // 水印透明度，选填，默认0.5，取值范围 [0-1]
    //     fontSize: 12, // 字体大小，选填，默认12，取值范围 [12-48]
    //   }
    // })
    return watermarkOptions
  }
}
