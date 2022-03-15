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
      isChannelChanged: false, // 频道是否变更，进入/退出小组是变化
      currentCid: '', //当前正在展示的容器id
      docCid: '', // 当前文档容器Id
      boardCid: '', // 当前白板容器Id
      containerList: [], // 动态容器列表

      pageTotal: 1, //总页数
      pageNum: 1, // 当前页码

      allComplete: true,
      docLoadComplete: true, // 文档是否加载完成

      thumbnailList: [], // 缩略图列表
      switchStatus: false // 直播中观众是否可见
    };

    // 由于文档对象的创建需要指定具体的宽高，而宽高需要根据具体dom计算，所以需要在文档组件初始化时初始化该方法
    // 获取文档宽高的方法
    getDocViewRect: null;
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
  init(customOptions = {}) {
    const defaultOptions = this._getDefaultOptions();
    const options = merge.recursive({}, defaultOptions, customOptions);
    // console.log('---[doc]------init options:', options);
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
          // this.docServer.setAccountId({ accountId: this.accountId + '7890' });
          this.setRole(VHDocSDK.RoleType.GUEST);
          this.setPlayMode(VHDocSDK.PlayMode.FLV);
        }
      })
      .catch(ex => {
        console.error('实例化PaaS文档失败', ex);
      });
  }

  // 获取默认初始化参数
  _getDefaultOptions() {
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
    } else {
      defaultOptions.role = this.mapDocRole(this.hasDocPermission() ? 1 : 2);
      defaultOptions.roomId = watchInitData.interact.room_id; // 必填。
      defaultOptions.channelId = watchInitData.interact.channel_id; // 频道id 必须
      defaultOptions.token = watchInitData.interact.paas_access_token; // access_token，必填
    }
    //  如果是无延迟直播，文档播放模式改为互动模式
    if (watchInitData.webinar.no_delay_webinar) {
      // 分组直播一定是无延迟直播 no_delay_webinar=1
      defaultOptions.mode = window.VHDocSDK.PlayMode.INTERACT;
    }
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
      switch (msg.data.event_type || msg.data.type) {
        // 直播结束
        case 'live_over':
          console.log('[doc] 直播结束，删除所有容器');
          // 观众不可见
          this.switchOffContainer()
          // 删除所有容器
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
          break;
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
      // if (process.env.NODE_ENV !== 'production') console.debug('所有文档加载完成');
      console.log('[doc] domain 所有文档加载完成: ');
      // const webinarType = useRoomBaseServer().state.watchInitData.webinar.type;
      // if (list.includes(this.previewInfo.elId)) this.previewInfo.canOperate = true;
      // console.log('this.cid:', this.cid);
      // console.log('this.isFullscreen :', this.isFullscreen);
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
      console.log('[doc] domain 当前文档加载完成: ', data);
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
      console.log('==============文档翻页================');
      if (this.isWatch() && useRoomBaseServer().state.watchInitData.webinar.type != 1) return;
      this.state.pageTotal = data.info.slidesTotal;
      this.state.pageNum = Number(data.info.slideIndex) + 1;
      this.$emit('dispatch_doc_page_change', data);
    });

    // 观众可见按钮切换
    this.on(VHDocSDK.Event.SWITCH_CHANGE, status => {
      if (useRoomBaseServer().state.watchInitData.webinar.type != 1) return;
      console.log('==[doc] [player]========控制文档开关=============', status);
      this.state.switchStatus = status === 'on';
      if (useRoomBaseServer().state.clientType != 'send') {
        // 观看端
        useRoomBaseServer().setChangeElement('doc');
      }
      this.$emit('dispatch_doc_switch_change', this.state.switchStatus);
    });

    // 创建容器
    this.on(VHDocSDK.Event.CREATE_CONTAINER, data => {
      console.log('===========创建容器===========', data);
      const { watchInitData } = useRoomBaseServer().state;
      if (watchInitData.join_info.role_name != 1 && watchInitData.webinar.type != 1) {
        return;
      }
      if (typeof this.getDocViewRect === 'function') {
        const { width, height } = this.getDocViewRect();
        const { docId, id, type } = data;
        if (width > 0 && height > 0 && this.state.containerList.findIndex(item => item.cid == data.id) == -1) {
          this.addNewDocumentOrBorad({ width, height, fileType: type, cid: id, docId });
        }
      }
      this.$emit('dispatch_doc_create_container', data);
    });

    // 删除文档
    this.on(VHDocSDK.Event.DELETE_CONTAINER, data => {
      console.log('doc] =========删除容器=============', data);
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
      this.$emit('dispatch_doc_select_container', data);
    });

    this.on(VHDocSDK.Event.DOCUMENT_NOT_EXIT, ({ cid, docId }) => {
      console.log('=============文档不存在或已删除========', cid, docId);
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

    // 非单视频嵌入监听此事件
    if (!useRoomBaseServer().state.embedObj.embedVideo) {
      // 回放文档加载完成事件
      this.on(VHDocSDK.Event.VOD_CUEPOINT_LOAD_COMPLETE, ({ chapters }) => {
        // 获取点播或回放设置的章节
        this.$emit('dispatch_doc_vod_cuepoint_load_complate', chapters);
      });

      this.on(VHDocSDK.Event.VOD_TIME_UPDATE, data => {
        // console.log('[doc] dispatch_doc_vod_time_update:', data);
        this.state.switchStatus = data.watchOpen;
        if (data.activeId) {
          this.selectContainer(data.activeId, !this.hasDocPermission());
          this.state.currentCid = data.activeId;
        } else {
          this.state.currentCid = '';
        }
        this.$emit('dispatch_doc_vod_time_update', data);
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
    } else {
      this.switchOnContainer();
      this.state.switchStatus = true;
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
    // 观看端(
    console.log('getContainerList=>switchStatus:', this.state.switchStatus);
    // 通知观众可见状态
    this.$emit('dispatch_doc_switch_status', this.state.switchStatus);

    const roomBaseServer = useRoomBaseServer();
    if (roomBaseServer.state.clientType != 'send') {


      if (useGroupServer().state.groupInitData.isInGroup) {
        // 如果在小组内
        if (useMicServer().getSpeakerStatus()) {
          // 如果小组成员在麦上,小屏默认显示流窗口
          roomBaseServer.setChangeElement('stream-list');
        }

      } else {
        const {
          interactToolStatus: { presentation_screen },
          watchInitData: { join_info: { third_party_user_id }, webinar: { type, no_delay_webinar } }
        } = roomBaseServer.state

        // 不在小组内且自己是演示者
        if (presentation_screen == third_party_user_id) {
          // 直播状态下，无延迟或上麦是流列表
          roomBaseServer.setChangeElement('stream-list');

        } else if (this.state.switchStatus) {
          if (useInsertFileServer().state.isInsertFilePushing) {
            // 如果在插播中，文档是小窗，插播是大窗
            roomBaseServer.setChangeElement('doc');
          } else if (type == 1 && (no_delay_webinar == 1 || useMicServer().getSpeakerStatus())) {
            // 直播状态下，无延迟或上麦是流列表
            roomBaseServer.setChangeElement('stream-list');
          } else {
            // 文档如果可见,直接设置 播放器 为小屏
            roomBaseServer.setChangeElement('player');
          }
        } else {
          roomBaseServer.setChangeElement('');
          // useRoomBaseServer().setChangeElement('doc');
        }
      }

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
          docId: item.docId
        });
        if (fileType == 'document') {
          this.state.docCid = item.cid;
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
    const elId = await this.initDocumentOrBoardContainer({
      width,
      height,
      fileType,
      cid,
      docId,
      docType
    });
    await this.activeContainer(elId);
    if (fileType === 'document') {
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
   */
  async initDocumentOrBoardContainer({
    width,
    height,
    fileType = 'document',
    cid,
    docId = ''
  }) {
    if (fileType === 'document' && !docId) {
      throw new Error('required docment param docId');
    }
    if (!cid) {
      cid = this.createUUID(fileType);
    }
    let noDispatch = true;
    // console.log('[doc] noDis:', !this.hasDocPermission())
    noDispatch = !this.hasDocPermission();
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
      console.log('[doc] --------向列表中添加容器------');
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
    docId = '',
    noDispatch = false
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
      if (fileType === 'board') {
        this.state.boardCid = cid;
        const opts = {
          id: cid,
          elId: cid,
          width: width,
          height: width,
          noDispatch,
          backgroundColor: '#FFFFFF'
        };
        await this.createBoard(opts);
      } else {
        this.state.docCid = cid;
        const opts = {
          id: cid,
          docId: docId,
          elId: cid, // div 容器 必须
          width: width,
          height: height,
          noDispatch
        };
        console.log('[doc] opts:', opts);
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
    this.state.currentCid = cid;

    const activeItem = this.state.containerList.find(item => item.cid == cid);
    console.log('[doc] activeItem:', activeItem);
    const type = cid.split('-')[0];
    if (type === 'document') {
      this.state.docCid = cid;
    } else {
      this.state.boardCid = cid;
    }

  }

  /**
   * 获取当前文档的缩略图
   */
  getCurrentThumbnailList() {
    const res = this.docInstance.getThumbnailList();
    console.log('[doc] domain getCurrentThumbnailList res:', res);
    this.state.thumbnailList = res && res[0] ? res[0].list : [];
  }

  /**
   * 上传文档
   * @param {Object}} param
   */
  uploadFile(param, uploadUrl) {
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
        console.log('[doc] domain groupReInitDocProcess');
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
        if (useRoomBaseServer().state.interactToolStatus.is_open_switch == 1
          && useGroupServer().state.groupInitData.isInGroup) {
          this.state.switchStatus = true; // 在小组中,文档始终可见
        } else {
          this.state.switchStatus = false; // 默认不可见
        }

        // 注意这里用true
        this.state.isChannelChanged = true;
      })
      .catch(ex => {
        console.error('[doc] groupReInitDocProcess error:', ex);
      });
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
}
