import AbstractDocServer from './AbstractDocServer';
import { merge } from '../../utils';
import useRoomBaseServer from '../room/roombase.server';
import { doc as docApi } from '../../request/index.js';
import $http from '@/utils/http.js';

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
    this.watchInitData = null;
    this.state = {
      currentCid: '', //当前正在展示的容器id
      docCid: '', // 当前文档容器Id
      boardCid: '', // 当前白板容器Id
      containerList: [], // 动态容器列表

      pageTotal: 1, //总页数
      pageNum: 1, // 当前页码

      allComplete: false,
      docLoadComplete: false, // 文档是否加载完成

      thumbnailList: [], // 缩略图列表
      switchStatus: false, // 观众是否可见

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
    console.log('---useRoomBaseServer()----:', useRoomBaseServer());
    // console.log('---groupInitData---:', groupInitData);
    this.watchInitData = watchInitData;

    console.log('获取默认初始化参数 watchInitData:', this.watchInitData);
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
      console.log('[doc] ====当前文档加载完成=====', data);
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
      this.state.pageNum = Number(data.info.slideIndex) + 1;
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

  /**
   * 获取容器列表信息
   */
  async getContainerList(channelId) {
    const rebroadcastChannelId = useRoomBaseServer().state?.watchInitData?.rebroadcast?.channel_id;
    if (rebroadcastChannelId) {
      channelId = rebroadcastChannelId;
    }
    console.log('[doc] getContainerInfo channelId:', channelId);
    // 获取该channelId下的所有容器列表信息
    const { list, switch_status } = await this.getContainerInfo(channelId);
    // 观众端是否可见
    console.log('switch_status:', switch_status);
    this.state.switchStatus = Boolean(switch_status);
    console.log('this.state.switchStatus :', this.state.switchStatus);
    // 小组内是否去显示文档判断根据是否有文档内容
    if (this.state.isInGroup) {
      this.state.switchStatus = !!list.length;
    }
    console.log('[doc] list:', list);
    this.state.containerList = list;
  }

  // 设置文档加载完成
  setDocLoadComplete() {
    this.state.docLoadComplete = true;
  }

  /**
   * 退出重进或刷新恢复数据
   * @param {Number} width 容器宽，必填
   * @param {height} height 容器高，必填
   * @param {Function} bindCidFun 等待cid绑定的处理函数
   * @returns
   */
  async recover({ width, height, bindCidFun }) {
    console.log('[doc] recover start：');
    if (!width || !height) {
      console.error('容器宽高错误', width, height);
      this.setDocLoadComplete();
    }
    for (const item of this.state.containerList) {
      const fileType = item.is_board === 1 ? 'document' : 'board';
      await this.initDocumentOrBoardContainer({
        width,
        height,
        fileType,
        cid: item.cid,
        docId: item.docId,
        bindCidFun
      });
      console.log('[doc] initDocumentOrBoardContainer:', item.cid);
      if (fileType == 'document') {
        this.state.docCid = item.cid;
      } else if (fileType == 'board') {
        this.state.boardCid = item.cid;
      }
      console.log('[doc] setRemoteData:', item.cid);
      this.setRemoteData(item);
    }
    const activeItem = this.state.containerList.find(item => item.active === 1);
    console.log('[doc] activeItem:', activeItem);
    if (activeItem) {
      if (activeItem.is_board === 1) {
        this.state.pageNum = activeItem.show_page + 1;
        this.state.pageTotal = activeItem.page;
      }
      // 激活选中
      await this.activeContainer(activeItem.cid);
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
   * @param {Function} bindCidFun 等待cid绑定的处理函数
   */
  async addNewDocumentOrBorad({ width, height, fileType, cid, docId, docType, bindCidFun }) {
    const elId = await this.initDocumentOrBoardContainer({
      width,
      height,
      fileType,
      cid,
      docId,
      docType,
      bindCidFun
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
   * @param {Function} bindCidFun 等待cid绑定的处理函数
   */
  async initDocumentOrBoardContainer({
    width,
    height,
    fileType = 'document',
    cid,
    docId = '',
    bindCidFun
  }) {
    if (fileType === 'document' && !docId) {
      throw new Error('required docment param docId');
    }
    console.log('[doc] initDocumentOrBoardContainer:', {
      width,
      height,
      fileType,
      cid,
      docId,
      bindCidFun
    });
    if (!cid) {
      cid = this.createUUID(fileType);
      console.log('[doc] 新建的cid:', cid);
    } else {
      console.log('[doc] 指定的cid:', cid);
    }

    let opt = {
      elId: cid, // 创建时，该参数就是cid
      docId: docId,
      width,
      height,
      backgroundColor: '#fff',
      noDispatch: false,
      option: {
        // 初始画笔
        graphicType: window.VHDocSDK.GRAPHIC.PEN,
        stroke: '#FD2C0A',
        strokeWidth: 7
      }
    };
    if (this.state.containerList.findIndex(item => item.cid === cid) === -1) {
      // 说明容器不在列表中，主动添加
      console.log('[doc] --------向列表中添加容器------');
      this.state.containerList.push({ cid, docId });
      if (typeof bindCidFun === 'function') {
        await bindCidFun(cid);
      }
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
   * 激活容器
   */
  activeContainer(cid) {
    this.selectContainer(cid);
    this.state.currentCid = cid;
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
    console.log('[doc] getCurrentThumbnailList res:', res);
    this.state.thumbnailList = res && res[0] ? res[0].list : [];
    // let doc = Array.isArray(res) ? res.find(item => item.id === this.state.currentCid) : null;
    // this.state.thumbnailList = doc ? doc.list : [];
  }

  /**
   * 上传文档
   * @param {Object}} param
   */
  uploadFile(param, uploadUrl) {
    try {
      const { watchInitData, groupInitData } = useRoomBaseServer().state;
      // 创建form对象,必须使用这个,会自动把 content-type 设置成 multipart/form-data
      const formData = new FormData();
      formData.append('resfile', param.file);
      formData.append('type', groupInitData.isInGroup ? 3 : 2);
      formData.append('webinar_id', watchInitData.webinar.id);
      // 当分组直播时必传 group_id 必传
      // formData.append('group_id', ？);

      //创建xhr
      const xhr = new XMLHttpRequest();
      // 设置 post 上传地址
      xhr.open('POST', uploadUrl);

      // 设置 headers
      xhr.setRequestHeader('token', window.localStorage.getItem('token') || '');
      xhr.setRequestHeader('platform', 7);
      xhr.setRequestHeader('gray-id', watchInitData.join_info.user_id);
      xhr.setRequestHeader('interact-token', watchInitData.interact.interact_token || '');

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const json = JSON.parse(xhr.response);
          // 根据后端给的信息判断是否上传成功
          if (json.code === 200) {
            json.data.webinar_id = watchInitData.webinar.id; // 补充字段
            param.onSuccess(json, param.file, param.fileList);
          } else {
            param.onError(json, param.file, param.fileList);
          }
        }
      };
      //获取上传的进度
      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          var percent = (event.loaded / event.total) * 100;
          // 上传进度回传
          if (typeof param.onProgress === 'function') {
            param.onProgress(percent, param.file, param.fileList);
          }
        }
      };

      //将formdata上传
      xhr.send(formData);
    } catch (e) {
      param.onError(e, param.file, param.fileList);
    }
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
}
