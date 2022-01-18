import { doc as docApi } from '../../request/index.js';
import { merge } from '../../utils';
import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import VhallPaasSDK from '@/sdk/index.js';
// PaaS SDK文档: http://www.vhallyun.com/docs/show/603
class DocServer extends BaseServer {
  constructor() {
    super();
    this.docInstance = null;
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
      styleOpts: {
        style: {
          hasControls: true, // 是否有控制条
          hasBorders: true, // 每个控制块之间是否有连接线
          hasRotatingPoint: true, // 是否有旋转控制块
          transparentCorners: false, // 方向控制块是否是透明
          cornerStyle: 'circle', // 控制块样式， 支持:"circle", "square"
          padding: 8, // 控制块与元件的边界
          cornerSize: 13, // 控制块大小，单位px
          rotatingPointOffset: 19, // 旋转控制块的距离元件的距离
          borderColor: '#979797', // 连接线颜色
          cornerColor: '#007AFF', // 控制块填充色颜色
          cornerStrokeColor: '#007AFF' // 控制块描边颜色
        }
      },
      isInGroup: false,
      hasDocPermission: false,
      groupRole: '' // 小组内角色
    };
  }

  on(type, cb) {
    if (!this.docInstance) return;
    this.docInstance.on(type, cb);
  }

  destroy(isAutoDestroyMsg) {
    return this.docInstance.destroy(isAutoDestroyMsg);
  }

  _initEvent() {
    if (!this.docInstance) return;
    // 所有文档加载完成事件
    this.docInstance.on(VHDocSDK.Event.ALL_COMPLETE, () => {
      // if (process.env.NODE_ENV !== 'production') console.debug('所有文档加载完成');
      // const list = this.$doc.getLiveAllCids();
      // if (list.includes(this.previewInfo.elId)) this.previewInfo.canOperate = true;
      // console.log('this.cid:', this.cid);
      // console.log('this.isFullscreen :', this.isFullscreen);
      this.state.allComplete = true;
    });
    // 单个文档加载完成
    this.docInstance.on(VHDocSDK.Event.DOCUMENT_LOAD_COMPLETE, data => {
      console.log('==============文档加载完成===============');
      this.state.pageTotal = data.info.slidesTotal;
      this.state.pageNum = Number(data.info.slideIndex) + 1;
      const res = this.docInstance.getThumbnailList();
      this.state.thumbnailList = res && res[0] ? res[0].list : [];
    });
    // 文档翻页事件
    this.docInstance.on(VHDocSDK.Event.PAGE_CHANGE, data => {
      console.log('==============文档翻页================');
      this.state.pageTotal = data.info.slidesTotal;
      this.state.pageNum = Number(data.info.slideIndex) + 1;
    });

    this.docInstance.on(VHDocSDK.Event.SWITCH_CHANGE, status => {
      // if (this.hasDocPermission) return;
      console.log('==========控制文档开关=============', status);
    });

    this.docInstance.on(VHDocSDK.Event.CREATE_CONTAINER, data => {
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

    this.docInstance.on(VHDocSDK.Event.DELETE_CONTAINER, data => {
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

    this.docInstance.on(VHDocSDK.Event.SELECT_CONTAINER, async data => {
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

    this.docInstance.on(VHDocSDK.Event.DOCUMENT_NOT_EXIT, ({ cid, docId }) => {
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
      this.docInstance.switchOffContainer();
      this.state.switchStatus = false;
    } else {
      this.docInstance.switchOnContainer();
      this.state.switchStatus = true;
    }
  }
  /**
   * 设置观众可见
   * @param {} val true/false
   */
  setSwitchStatus(val) {
    if (val) {
      this.docInstance.switchOnContainer();
    } else {
      this.docInstance.switchOffContainer();
    }
    this.state.switchStatus = !!val;
  }

  /**
   * 初始化
   * @param {Object} customOptions
   * @returns {Promise}
   */
  init(customOptions = {}) {
    const defaultOptions = this._getDefaultOptions();
    const options = merge.recursive({}, defaultOptions, customOptions);

    return new Promise((resolve, reject) => {
      this.docInstance = VhallPaasSDK.modules.VHDocSDK.createInstance(
        options,
        () => {
          // 初始化事件
          this._initEvent();

          // 无延迟
          if (this.watchInitData.webinar.no_delay_webinar) {
            this.docInstance.setPlayMode(VHDocSDK.PlayMode.INTERACT);
          }
          resolve();
        },
        err => {
          console.error('实例化文档失败', err);
          reject(err);
        }
      );
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
      client: VhallPaasSDK.modules.VHDocSDK.Client.PC_WEB // 客户端类型
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

  createBoard(options) {
    return this.docInstance.createBoard(options);
  }

  createDocument(options) {
    return this.docInstance.createDocument(options);
  }

  /**
   * 加载列表中文档或白板的实例
   * @param {*} width
   * @param {*} height
   */
  async loadDocumentOrBoradData(width, height) {
    this.state.allComplete = false;
    console.log('--loadDocumentOrBoradData--');
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
        elId: cid,
        docId: docId,
        width: width,
        height: height,
        backgroundColor: item.backgroundColor || '#fff'
        // option: {
        //   graphicType: window.VHDocSDK.GRAPHIC.PEN,
        //   stroke: '#FD2C0A',
        //   strokeWidth: 7
        // }
      };

      if (Number(is_board) === 1) {
        console.log('创建文档:', options);
        await this.docInstance.createDocument(options);
      } else {
        console.log('创建白板:', options);
        await this.docInstance.createBoard(options);
      }
      if (active != 0) {
        this.state.currentCid = cid;
        this.state.currentType = Number(is_board) === 1 ? 'document' : 'board';
        // 设置选中
        await this.docInstance.selectContainer({
          id: cid,
          noDispatch: false
        });
      }
    }
    await this.docInstance.setRemoteData2(this.state.fileOrBoardList);
  }

  /**
   * 新增文档或白板
   * @param {*} item
   * @param {*}
   */
  async addNewDocumentOrBorad(options) {
    const { width, height, fileType, docId, docType, bindCidFun } = options;
    const elId = this.docInstance.createUUID(fileType);
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
      docType
    };
    this.state.fileOrBoardList.push(option);
    if (typeof bindCidFun === 'function') {
      await bindCidFun(elId);
    }
    try {
      if (Number(is_board) === 1) {
        await this.docInstance.createDocument(option);
      } else {
        await this.docInstance.createBoard(option);
      }
    } catch (ex) {
      // 移除失败的容器fileOrBoardList
      this.state.fileOrBoardList = this.state.fileOrBoardList.filter(item => item.elId === elId);
      console.error(ex);
    }
    // 选中
    console.log('-选中 elId-----:', elId);
    await this.docInstance.selectContainer({ id: elId });
    this.state.currentCid = elId;
    this.state.currentType = fileType;

    if (Number(is_board) === 1) {
      const { status, status_jpeg, slideIndex, slidesTotal, converted_page, converted_page_jpeg } =
        await this.docInstance.loadDoc({
          docId: docId,
          id: elId,
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
   * 激活某容器
   * @param {*} options
     id:'xxx', //容器ID
     noDispatch:false //非必填，默认false，是否推送消息到远端，false为推送，true为不推送
   * @returns
   */
  async selectContainer(cid, noDispatch = false) {
    await this.docInstance.selectContainer({
      id: cid,
      noDispatch
    });
    this.state.currentCid = cid;
    return cid;
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

  switchOnContainer(val) {
    return this.docInstance.switchOnContainer(val);
  }

  switchOffContainer(val) {
    return this.docInstance.switchOffContainer(val);
  }

  resetContainer() {
    return this.docInstance.resetContainer();
  }

  /**
   * 当前channelId下的所有容器列表
   * @returns
   */
  async getAllContainerInfo(channelId = null) {
    let params = channelId ? { channelId } : null;
    const rebroadcastChannelId = this.roomBaseServer?.watchInitData?.rebroadcast?.channel_id;
    if (rebroadcastChannelId) {
      params = { channelId: rebroadcastChannelId };
    }
    console.log('params:::::', params);
    const { list, switch_status } = await this.docInstance.getContainerInfo(params);
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
   * 拉取指定channelId下的容器列表，不传获取当前channelId下的所有容器列表
   * @param {*} options
   * @returns
   */
  async getContainerInfo(options) {
    return await this.docInstance.getContainerInfo(options);
  }

  destroyContainer(val) {
    return this.docInstance.destroyContainer(val);
  }

  getVodAllCids(val) {
    return this.docInstance.getVodAllCids(val);
  }

  setRemoteData(item) {
    return this.docInstance.setRemoteData(item);
  }

  zoomIn(cid) {
    return this.docInstance.zoomIn({
      id: cid || this.state.currentCid
    });
  }

  zoomOut(cid) {
    return this.docInstance.zoomOut({
      id: cid || this.state.currentCid
    });
  }

  zoomReset(cid) {
    return this.docInstance.zoomReset({
      id: cid || this.state.currentCid
    });
  }

  cancelZoom(cid) {
    return this.docInstance.cancelZoom({
      id: cid || this.state.currentCid
    });
  }

  move(cid) {
    return this.docInstance.move({
      id: cid || this.state.currentCid
    });
  }

  prevStep() {
    return this.docInstance.prevStep();
  }

  nextStep() {
    return this.docInstance.nextStep();
  }

  setPlayMode(mode) {
    return this.docInstance.setPlayMode(mode);
  }

  setSize(width, height, cid) {
    return this.docInstance.setSize(width, height, {
      id: cid || this.state.currentCid
    });
  }

  createUUID(type) {
    return this.docInstance.createUUID(type);
  }

  setControlStyle(style) {
    return this.docInstance.setControlStyle(style);
  }

  gotoPage(options) {
    return this.docInstance.gotoPage(options);
  }

  /**
   * 设置画笔
   * @param {*} cid
   * @returns
   */
  setPen(cid) {
    return this.docInstance.setPen({
      id: cid || this.state.currentCid
    });
  }

  /**
   * 设置橡皮擦
   * @param {*} cid
   * @returns
   */
  setEraser(cid) {
    return this.docInstance.setEraser({
      id: cid || this.state.currentCid
    });
  }

  /**
   * 设置画笔粗细
   * @param {*} width
   * @returns
   */
  setStrokeWidth(width, cid) {
    return this.docInstance.setStrokeWidth({
      id: cid || this.state.currentCid,
      width: width // 画笔粗细，数字，必填
    });
  }

  /**
   * 设置画笔颜色
   * @param {*} color
   * @param {*} cid
   * @returns
   */
  setStroke(color, cid) {
    return this.docInstance.setStroke({
      id: cid || this.state.currentCid,
      color: color // 画笔颜色，必填
    });
  }

  /**
   * 清空画板
   * @returns
   */
  clear() {
    return this.docInstance.clear();
  }

  /**
   * 设置四边形
   * @param {*} cid
   * @returns
   */
  setSquare(cid) {
    return this.docInstance.setSquare({
      id: cid || this.state.currentCid
    });
  }

  /**
   * 设置单箭头
   * @param {*} cid
   * @returns
   */
  setSingleArrow(cid) {
    return this.docInstance.setSingleArrow({
      id: cid || this.state.currentCid
    });
  }

  /**
   * 设置双箭头
   * @param {*} cid
   * @returns
   */
  setDoubleArrow(cid) {
    return this.docInstance.setDoubleArrow({
      id: cid || this.state.currentCid
    });
  }

  /**
   * 设置圆形
   * @param {*} cid
   * @returns
   */
  setCircle(cid) {
    return this.docInstance.setCircle({
      id: cid || this.state.currentCid
    });
  }

  /**
   * 设置图片
   * @param {*} cid
   * @returns
   */
  setBitmap(cid) {
    return this.docInstance.setBitmap({
      id: cid || this.state.currentCid
    });
  }

  setIsoscelesTriangle(options) {
    return this.docInstance.setIsoscelesTriangle(options);
  }

  /**
   * 取消画笔(选择)
   * @param {*} cid
   * @returns
   */
  cancelDrawable(cid) {
    return this.docInstance.cancelDrawable({
      id: cid || this.state.currentCid
    });
  }

  /**
   * 设置荧光笔
   * @param {*} cid
   * @returns
   */
  setHighlighters(cid) {
    return this.docInstance.setHighlighters({
      id: cid || this.state.currentCid
    });
  }

  /**
   * 设置文字工具
   * @param {*} cid
   * @returns
   */
  setText(cid) {
    return this.docInstance.setText({
      id: cid || this.state.currentCid
    });
  }

  loadDoc(options) {
    return this.docInstance.loadDoc(options);
  }

  start(val, type) {
    return this.docInstance.start(val, type);
  }

  republish() {
    return this.docInstance.republish();
  }

  setRole(role) {
    return this.docInstance.setRole(role);
  }

  setAccountId(role) {
    return this.docInstance.setAccountId(role);
  }

  setEditable(editable) {
    return this.docInstance.setEditable(editable);
  }

  getThumbnailList(options) {
    return this.docInstance.getThumbnailList(options);
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

  setRemoteData2(list) {
    return this.docInstance.setRemoteData2(list);
  }
}
export default function useDocServer() {
  if (!useDocServer.instance) {
    useDocServer.instance = new DocServer();
  }
  return useDocServer.instance;
}
