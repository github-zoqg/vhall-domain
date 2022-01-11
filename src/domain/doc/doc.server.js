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

    this.docInstance.on(VHDocSDK.Event.DOCUMENT_LOAD_COMPLETE, data => {
      console.log('===================文档加载完成===================');
      this.state.pageTotal = data.info.slidesTotal;
      this.state.pageNum = Number(data.info.slideIndex) + 1;
      const res = this.docInstance.getThumbnailList();
      this.state.thumbnailList = res && res[0] ? res[0].list : [];
    });
  }

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
   *
   * @param {*} width
   * @param {*} height
   */
  async loadDocumentOrBoradData(width, height) {
    if (!width || !height) {
      console.error('容器宽高错误', width, height);
    }
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
   *
   * @param {*} width 容器宽
   * @param {*} height 容器高
   * @param {*} fileType fileType document:文档 board:白板,默认文档
   * @param {*} docId docId 文档id，白板时为空
   * @param {*} type 演示类型：1：静态文档（jpg） 2：动态文档(PPT)
   */
  prepareDocumentOrBorad(width, height, fileType = 'document', docId = '', type) {
    const cid = this.docServer.createUUID(fileType);
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
      }
    };
    const item = {
      cid: cid,
      is_board: fileType === 'document' ? 1 : 2,
      docId,
      type
    };
    this.docServer.state.fileOrBoardList.push({ ...item });
    return options;
  }

  /**
   *
   * @param {*} item
   * @param {*}
   */
  async addNewDocumentOrBorad(options) {
    // console.log('-------addNewFile-----');
    // this.allComplete = false;
    // 创建
    const { elId, docId } = options;
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
          docType: item.type
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
    console.log('list:', list);
    console.log('switch_status:', switch_status);
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

  zoomIn() {
    return this.docInstance.zoomIn();
  }

  zoomOut() {
    return this.docInstance.zoomOut();
  }

  zoomReset() {
    return this.docInstance.zoomReset();
  }

  cancelZoom() {
    return this.docInstance.cancelZoom();
  }

  move() {
    return this.docInstance.move();
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

  setSize(width, height, options) {
    return this.docInstance.setSize(width, height, options);
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
    console.log(this.state.currentCid);
    this.docInstance.setPen({ id: this.state.currentCid });
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
