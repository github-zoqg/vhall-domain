import AbstractDocServer from './AbstractDocServer';
import { merge } from '../../utils';
import useRoomBaseServer from '../room/roombase.server';
import { doc as docApi } from '../../request/index.js';

/**
 * 标准（通用）直播场景下的文档白板服务
 * 继承自AbstractDocServer
 * @class StandardDocServer
 */
export default class StandardDocServer extends AbstractDocServer {
  constructor() {
    super();
    this.watchInitData = null;
    this.state = {
      allComplete: false,
      docLoadComplete: false, // 文档是否加载完成
      currentCid: '', //当前激活的容器ID
      currentType: 'document', // 当前激活的容器类型： 文档-document, 白板-board
      fileOrBoardList: [], // 所有容器列表
      thumbnailList: [], // 缩略图列表
      switchStatus: false, // 观众是否可见
      pageNum: 1, // 当前页码
      pageTotal: 1, //总页数
      isInGroup: false,
      hasDocPermission: false,
      groupRole: '' // 小组内角色
    };
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
    // 初始化 passDocInstance
    return this.initialize(options)
      .then(() => {
        // 实例化PaaS文档成功
        // 初始化事件
        this._initEvent();

        // 无延迟
        if (this.watchInitData.webinar.no_delay_webinar) {
          this.setPlayMode(VHDocSDK.PlayMode.INTERACT);
        }
      })
      .catch(ex => {
        console.error('实例化PaaS文档失败', err);
      });
  }

  // 获取默认初始化参数
  _getDefaultOptions() {
    const { watchInitData, groupInitData } = useRoomBaseServer().state;
    // console.log('---groupInitData---:', groupInitData);
    this.watchInitData = watchInitData;

    console.log('获取默认初始化参数:', this.watchInitData);
    if (groupInitData && groupInitData.isInGroup) {
      // 小组房间内
      this.state.isInGroup = true;
      this.state.hasDocPermission = groupInitData.main_screen == defaultOptions.accountId;
      this.state.groupRole = groupInitData.join_role;
    } else {
      // 主房间内
      this.state.isInGroup = false;
      // TODO interactToolStatus
      // if (this.interactToolStatus) {
      //   // 主直播间邀请
      //   this.hasDocPermission = this.interactToolStatus.main_screen == this.joinId;
      // }
    }
    // 初始化参数
    const defaultOptions = {
      appId: watchInitData.interact.paas_app_id, // 互动应用ID，必填
      accountId: watchInitData.join_info.third_party_user_id, // 第三方用户ID，必填
      client: VHDocSDK.Client.PC_WEB // 客户端类型
    };
    if (this.state.isInGroup) {
      // 分组讨论直播间中
      defaultOptions.role = this.mapDocRole(this.state.hasDocPermission ? 1 : 2); // 角色
      defaultOptions.roomId = groupInitData.group_room_id;
      defaultOptions.channelId = groupInitData.channel_id;
      defaultOptions.token = groupInitData.access_token;
      console.log('取小组数据');
    } else {
      defaultOptions.role = this.mapDocRole(watchInitData.join_info.role_name);
      defaultOptions.roomId = watchInitData.interact.room_id; // 必填。
      defaultOptions.channelId = watchInitData.interact.channel_id; // 频道id 必须
      defaultOptions.token = watchInitData.interact.paas_access_token; // access_token，必填
      defaultOptions.isVod = false; // 是否是回放 必须
      console.log('取主房间数据');
    }
    //  如果是无延迟直播，文档播放模式改为互动模式
    if (watchInitData.webinar.no_delay_webinar) {
      // 分组直播一定是无延迟直播 no_delay_webinar=1
      defaultOptions.mode = window.VHDocSDK.PlayMode.INTERACT;
    }
    return defaultOptions;
  }

  /**
   * 根据直播用户的角色映射文档角色
   * 直播角色：1-主持人；2-观众；3-助理；4-嘉宾
   * 文档角色：1-主持人 编辑、翻页、缩放
   *         2-嘉宾  缩放
   *         3-观众  缩放
   *         4-助理 翻页、缩放
   * @param {*} role
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
    // 所有文档加载完成事件
    this.on(VHDocSDK.Event.ALL_COMPLETE, () => {
      // if (process.env.NODE_ENV !== 'production') console.debug('所有文档加载完成');
      // const list = this.$doc.getLiveAllCids();
      // if (list.includes(this.previewInfo.elId)) this.previewInfo.canOperate = true;
      // console.log('this.cid:', this.cid);
      // console.log('this.isFullscreen :', this.isFullscreen);
      this.state.allComplete = true;
      this.state.docLoadComplete = true;
    });
    // 当前文档加载完成
    this.on(VHDocSDK.Event.DOCUMENT_LOAD_COMPLETE, data => {
      console.log('====当前文档加载完成=====');
      this.state.pageTotal = data.info.slidesTotal;
      this.state.pageNum = Number(data.info.slideIndex) + 1;
      this.state.docLoadComplete = true;

      // 获取缩略图
      setTimeout(() => {
        // 延迟100ms获取，否则sdk中要用到的某个数据可能还是空
        this.getCurrentThumbnailList();
      }, 100);
    });
    // 文档翻页事件
    this.on(VHDocSDK.Event.PAGE_CHANGE, data => {
      console.log('==============文档翻页================');
      this.state.pageTotal = data.info.slidesTotal;
      this.state.pageNum = data.info.slideIndex;
    });

    this.on(VHDocSDK.Event.SWITCH_CHANGE, status => {
      // if (this.hasDocPermission) return;
      console.log('==========控制文档开关=============', status);
    });

    this.on(VHDocSDK.Event.CREATE_CONTAINER, data => {
      // if ((this.roleName != 1 && this.liveStatus != 1) || this.cids.includes(data.id)) {
      //   return;
      // }
      console.log('===========创建容器===========', data);
      // this.docInfo.docContainerShow = true;
      // this.docInfo.docShowType = data.type;
      // this.cids.push(data.id);
      // this.$nextTick(() => {
      //   this.initWidth(data.type);
      //   this.initContainer(data.type, data.id, '');
      // });
    });

    this.on(VHDocSDK.Event.DELETE_CONTAINER, data => {
      // if (this.roleName != 1 && this.liveStatus != 1) {
      //   return;
      // }
      console.log('=========删除容器=============', data);
      // const index = this.cids.indexOf(data.id);
      // if (index > -1) {
      //   this.cids.splice(index, 1);
      //   this.docServer.destroyContainer({ id: data.id });
      // }
      // if (this.currentCid == data.id) {
      //   this.currentCid = '';
      //   this.docInfo.docShowType = '';
      // }
    });

    this.on(VHDocSDK.Event.SELECT_CONTAINER, async data => {
      // if (this.currentCid == data.id || (this.roleName != 1 && this.liveStatus != 1)) {
      //   return;
      // }
      console.log('===========选择容器======', data);
      // this.docInfo.docShowType = data.id.split('-')[0];
      // this.currentCid = data.id;
      // // 判断容器是否存在
      // if (this.cids.indexOf(data.id) > -1) {
      //   this.activeContainer(data.id);
      // } else {
      //   this.cids.push(data.id);
      //   await this.$nextTick();
      //   this.initWidth(data.type);
      //   this.initContainer(data.type, data.id, '');
      //   this.activeContainer(data.id);
      // }
      // EventBus.$emit('docInfo', this.docInfo);
      // console.log('a9');

      // this.docServer.setControlStyle(this.styleOpts);
    });

    this.on(VHDocSDK.Event.DOCUMENT_NOT_EXIT, ({ cid, docId }) => {
      console.log('=============文档不存在或已删除========', cid, docId);
      // if (cid == this.currentCid) {
      //   this.$message({
      //     type: 'error',
      //     message: '文档不存在或已删除'
      //   });
      //   this.deleteTimer = setTimeout(() => {
      //     this.docId = '';
      //     const index = this.cids.indexOf(cid);
      //     this.cids.splice(index, 1);
      //     this.docServer.destroyContainer({ id: this.currentCid });
      //     this.currentCid = '';
      //     this.docInfo.docShowType = '';
      //   }, 3000); // 其他地方调用回将值重新传入
      // }
    });
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

  async recover({ width, height, bindCidFun }) {
    if (!width || !height) {
      console.error('容器宽高错误', width, height);
    }
    await this.getAllContainerInfo();

    if (typeof bindCidFun === 'function') {
      await bindCidFun();
    }

    // 创建文档和白板的实例
    for (const item of this.state.fileOrBoardList) {
      let { cid, active, docId, is_board } = item;
      const options = {
        id: cid,
        cid: cid,
        elId: cid,
        docId: docId,
        width: width,
        height: height,
        backgroundColor: item.backgroundColor || '#fff',
        option: {
          graphicType: window.VHDocSDK.GRAPHIC.PEN,
          stroke: '#FD2C0A',
          strokeWidth: 7
        }
      };

      if (Number(is_board) === 1) {
        console.log('创建文档:', options);
        await this.createDocument(options);
      } else {
        console.log('创建白板:', options);
        await this.createBoard(options);
      }
      if (active != 0) {
        this.state.currentCid = cid;
        this.state.currentType = Number(is_board) === 1 ? 'document' : 'board';
        // 设置选中
        await this.selectContainer(cid);
      }
    }
    await this.setRemoteData2(this.state.fileOrBoardList);
  }

  /**
   * 新增文档或白板
   * @param {*} item
   * @param {*}
   */
  async addNewDocumentOrBorad(options) {
    const { width, height, fileType, docId, docType, bindCidFun } = options;
    const elId = this.createUUID(fileType);
    const is_board = fileType === 'document' ? 1 : 2;
    let option = {
      id: elId,
      cid: elId,
      docId: docId,
      elId: elId,
      width,
      height,
      backgroundColor: '#fff',
      option: {
        // 初始画笔
        graphicType: window.VHDocSDK.GRAPHIC.PEN,
        stroke: '#FD2C0A',
        strokeWidth: 7
      },
      is_board,
      doc_type: docType
    };
    this.state.fileOrBoardList.push(option);
    if (typeof bindCidFun === 'function') {
      await bindCidFun(elId);
    }
    try {
      if (Number(is_board) === 1) {
        await this.createDocument(option);
      } else {
        await this.createBoard(option);
      }
    } catch (ex) {
      // 移除失败的容器fileOrBoardList
      this.state.fileOrBoardList = this.state.fileOrBoardList.filter(item => item.elId !== elId);
      console.error(ex);
      return;
    }
    // 选中
    console.log('-选中 elId-----:', elId);
    await this.selectContainer(elId);
    this.state.currentCid = elId;
    this.state.currentType = fileType;

    if (Number(is_board) === 1) {
      const { status, status_jpeg, slideIndex, slidesTotal, converted_page, converted_page_jpeg } =
        await this.loadDoc({
          id: elId,
          docId: docId,
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
   * 当前channelId下的所有容器列表
   * @returns
   */
  async getAllContainerInfo(channelId = null) {
    const rebroadcastChannelId = this.roomBaseServer?.watchInitData?.rebroadcast?.channel_id;
    if (rebroadcastChannelId) {
      channelId = rebroadcastChannelId;
    }
    console.log('getAllContainerInfo channelId:', channelId);
    const { list, switch_status } = await this.getContainerInfo(channelId);
    // 观众端是否可见
    this.state.switchStatus = Boolean(switch_status);
    // 文档列表
    this.state.fileOrBoardList = list;

    // 小组内是否去显示文档判断根据是否有文档内容
    if (this.state.isInGroup) {
      this.state.switchStatus = !!list.length;
    }
    this.state.docLoadComplete = true;
    if (!list.length) return;
    const activeItem = list.find(item => item.active == 1);
    if (activeItem) {
      this.state.pageNum = Number(activeItem.show_page) + 1;
      this.state.pageTotal = activeItem.page;
    }
  }

  /**
   * 获取当前文档的缩略图
   */
  getCurrentThumbnailList() {
    const res = this.docInstance.getThumbnailList();
    let doc = Array.isArray(res) ? res.find(item => item.id === this.state.currentCid) : null;
    this.state.thumbnailList = doc ? doc.list : [];
  }

  // 获取文档列表(资料库所有文档)
  getAllDocList(params) {
    return docApi.getAllDocList(params);
  }

  // 获取文档列表(当前活动下)
  getWebinarDocList(params) {
    return docApi.getWebinarDocList(params);
  }

  // 获取文档详情
  getDocDetail(params) {
    return docApi.getDocDetail(params);
  }

  // 同步文档
  syncDoc(params) {
    return docApi.syncDoc(params);
  }

  // 删除文档(多选)
  delDocList(params) {
    return docApi.delDocList(params);
  }
}
