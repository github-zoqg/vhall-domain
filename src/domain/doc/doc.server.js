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
    this.state = {
      allComplete: false,
      currentCid: '', //当前激活的容器ID
      currentType: 'document', // 当前激活的容器类型： 文档-document, 白板-board
      fileOrBoardList: [], // 所有容器列表
      thumbnailList: [], // 缩略图列表
      switchStatus: false, // 观众是否可见
      pageNum: 1, // 当前页码
      pageTotal: 1 //总页数
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
          this._initEvent();
          resolve();
        },
        err => {
          reject(err);
        }
      );
    });
  }

  // 获取默认初始化参数
  _getDefaultOptions() {
    const { watchInitData } = useRoomBaseServer().state;
    const defaultOptions = {
      accountId: watchInitData.join_info.third_party_user_id, // 第三方用户ID，必填
      roomId: watchInitData.interact.room_id, // 必填。
      channelId: watchInitData.interact.channel_id, // 频道id 必须
      appId: watchInitData.interact.paas_app_id, // 互动应用ID，必填
      role: watchInitData.join_info.role_name, // 角色 必须
      isVod: false, // 是否是回放 必须
      client: VhallPaasSDK.modules.VHDocSDK.Client.PC_WEB, // 客户端类型
      token: watchInitData.interact.paas_access_token // access_token，必填
    };
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
    if (!width || !height) {
      console.error('容器宽高错误', width, height);
    }
    this.state.allComplete = false;
    console.log('--this.state.fileOrBoardList--');
    // 创建文档和白板的实例
    for (const item of this.state.fileOrBoardList) {
      let { cid, active, docId, is_board } = item;
      const options = {
        elId: cid,
        docId: docId,
        width: width,
        height: height,
        noDispatch: false,
        backgroundColor: item.backgroundColor || '#fff',
        option: {
          graphicType: window.VHDocSDK.GRAPHIC.PEN,
          stroke: '#FD2C0A',
          strokeWidth: 7
        }
      };
      if (Number(is_board) === 1) {
        await this.docInstance.createDocument(options);
      } else {
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

    this.docInstance.setRemoteData2(this.state.fileOrBoardList);
  }

  /**
   * 准备创建文档或白板的数据
   * @param {*} width 容器宽
   * @param {*} height 容器高
   * @param {*} fileType fileType document:文档 board:白板,默认文档
   * @param {*} docId docId 文档id，白板时为空
   * @param {*} docType 演示类型：1：静态文档（jpg） 2：动态文档(PPT)
   */
  prepareDocumentOrBorad(width, height, fileType = 'document', docId = '', docType) {
    const cid = this.docInstance.createUUID(fileType);
    const is_board = fileType === 'document' ? 1 : 2;
    let options = {
      docId: docId,
      elId: cid,
      id: cid,
      width,
      height,
      option: {
        // 初始画笔
        graphicType: window.VHDocSDK.GRAPHIC.PEN,
        stroke: '#FD2C0A',
        strokeWidth: 7
      },
      is_board,
      docType
    };
    const item = {
      cid: cid,
      is_board,
      docId,
      docType
    };
    this.state.fileOrBoardList.push({ ...item });
    return options;
  }

  /**
   * 新增文档或白板
   * @param {*} item
   * @param {*}
   */
  async addNewDocumentOrBorad(options) {
    // console.log('-------addNewFile-----');
    // this.allComplete = false;
    // 创建
    const { elId, docId, is_board, docType } = options;
    if (Number(is_board) === 1) {
      try {
        await this.docInstance.createDocument(options);
        await this.docInstance.selectContainer({ id: elId });
        const {
          status,
          status_jpeg,
          slideIndex,
          slidesTotal,
          converted_page,
          converted_page_jpeg
        } = await this.docInstance.loadDoc({
          docId: docId,
          id: elId,
          docType
        });

        if (Number(status) === 200) {
          this.pageNum = Number(slideIndex) + 1;
          this.pageTotal = slidesTotal;
        } else if (Number(status_jpeg) === 200) {
          this.pageNum = Number(converted_page) + 1;
          this.pageTotal = converted_page_jpeg;
        }
        this.state.currentCid = elId;
        this.state.currentType = 'document';
      } catch (e) {
        // 移除失败的容器fileOrBoardList
        this.state.fileOrBoardList = this.state.fileOrBoardList.filter(item => item.elId === elId);
        console.error(e);
        // roomApi.report(this.$store.getters.roomId, e)
      }
    } else {
      console.log('-------创建白板-------');
      try {
        await this.docInstance.createBoard({
          ...options,
          backgroundColor: '#fff'
        });
        await this.docInstance.selectContainer({ id: elId });
        this.state.currentCid = elId;
        this.state.currentType = 'board';
      } catch (e) {
        // 移除失败的容器
        this.state.fileOrBoardList = this.state.fileOrBoardList.filter(item => item.elId === elId);
        console.error(e);
        // roomApi.report(this.$store.getters.roomId, e)
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
  async getAllContainerInfo() {
    const { list, switch_status } = await this.docInstance.getContainerInfo();
    this.state.fileOrBoardList = list;
    this.state.switchStatus = Boolean(switch_status);
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
