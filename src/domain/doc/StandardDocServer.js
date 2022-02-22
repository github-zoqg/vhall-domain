import AbstractDocServer from './AbstractDocServer';
import { merge } from '../../utils';
import useRoomBaseServer from '../room/roombase.server';
import useGroupServer from '../group/StandardGroupServer';
import { doc as docApi } from '../../request/index.js';
import request from '@/utils/http.js';
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

      allComplete: false,
      docLoadComplete: true, // 文档是否加载完成

      thumbnailList: [], // 缩略图列表
      switchStatus: false, // 观众是否可见
      hasDocPermission: false //是否文档的演示(操作)权限
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
    // console.log('---[doc]------init options:', options);
    // 初始化 passDocInstance
    return this.initialize(options)
      .then(() => {
        // 实例化PaaS文档成功
        // 初始化事件
        this._initEvent();

        const { watchInitData } = useRoomBaseServer().state;

        // 无延迟
        if (watchInitData.webinar.no_delay_webinar) {
          this.setPlayMode(VHDocSDK.PlayMode.INTERACT);
        }
        if (watchInitData?.rebroadcast?.channel_id) {
          // 直播中旁路频道
          // this.docServer.setAccountId({ accountId: this.accountId + '7890' });
          // this.$VhallEventBus.$emit('docInfo', this.docInfo);
          // this.docServer.setRole(roleTypeMap[2]);
          // this.docServer.setPlayMode(VHDocSDK.PlayMode.FLV);
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
      this.state.hasDocPermission =
        groupInitData.main_screen == watchInitData.join_info.third_party_user_id;
      defaultOptions.role = this.mapDocRole(this.state.hasDocPermission ? 1 : 2); // 角色
      defaultOptions.roomId = groupInitData.group_room_id;
      defaultOptions.channelId = groupInitData.channel_id;
      defaultOptions.token = groupInitData.access_token;
    } else {
      //当前用户在主直播间内
      if (interactToolStatus && interactToolStatus.main_screen) {
        // 分组直播和非分组直播的文档权限字段不同
        if (watchInitData.webinar.mode === 6) {
          this.state.hasDocPermission =
            interactToolStatus.main_screen == watchInitData.join_info.third_party_user_id; // 演示权限-> 主屏权限
        } else {
          this.state.hasDocPermission =
            interactToolStatus.doc_permission == watchInitData.join_info.third_party_user_id;
        }
      }
      defaultOptions.role = this.mapDocRole(watchInitData.join_info.role_name);
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
      this.state.pageTotal = data.info.slidesTotal;
      this.state.pageNum = Number(data.info.slideIndex) + 1;
      this.$emit('dispatch_doc_page_change', data);
    });

    // 观众可见按钮切换
    this.on(VHDocSDK.Event.SWITCH_CHANGE, status => {
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
      // if ((this.roleName != 1 && this.liveStatus != 1) || this.cids.includes(data.id)) {
      //   return;
      // }
      this.$emit('dispatch_doc_create_container', data);
    });

    // 删除文档
    this.on(VHDocSDK.Event.DELETE_CONTAINER, data => {
      console.log('=========删除容器=============', data);
      if (data && data.id) {
        this.destroyContainer({ id: data.id });
      }
      this.$emit('dispatch_doc_delete_container', data);
    });

    this.on(VHDocSDK.Event.DOCUMENT_NOT_EXIT, ({ cid, docId }) => {
      console.log('=============文档不存在或已删除========', cid, docId);
      this.$emit('dispatch_doc_not_exit', { cid, docId });
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
    // 获取该channelId下的所有容器列表信息
    const { list, switch_status } = await this.getContainerInfo(channelId);

    // 直播中
    if (useRoomBaseServer().state.watchInitData.webinar.type === 1) {
      // 观众端是否可见
      this.state.switchStatus = Boolean(switch_status);
    } else {
      this.state.switchStatus = false;
    }
    // 观看端(
    console.log('this.state.switchStatus:', this.state.switchStatus);

    this.roomBaseServer = useRoomBaseServer();
    if (this.roomBaseServer.state.clientType != 'send') {
      if (this.state.switchStatus) {
        // 是否在麦上
        if (this.roomBaseServer.getSpeakStatus()) {
          this.roomBaseServer.setChangeElement('stream-list');
        } else {
          // 文档如果可见,直接设置 播放器 为小屏
          this.roomBaseServer.setChangeElement('player');
        }
      } else {
        this.roomBaseServer.setChangeElement('');
        // useRoomBaseServer().setChangeElement('doc');
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
   * @param {Function} bindCidFun 等待cid绑定的处理函数
   * @returns
   */
  async recover({ width, height, bindCidFun }) {
    console.log('[doc] recover start：');
    if (!width || !height) {
      console.error('容器宽高错误', width, height);
      this.setDocLoadComplete();
    }
    console.log('[doc] recover setDocLoadComplete false');
    this.setDocLoadComplete(false);
    for (const item of this.state.containerList) {
      const fileType = item.is_board === 1 ? 'document' : 'board';
      if (
        fileType == 'document' &&
        this.state.docCid == item.cid &&
        document.getElementById(item.cid)
      ) {
        continue;
      } else if (
        fileType == 'board' &&
        this.state.boardCid == item.cid &&
        document.getElementById(item.cid)
      ) {
        continue;
      }
      await this.initDocumentOrBoardContainer({
        width,
        height,
        fileType,
        cid: item.cid,
        docId: item.docId,
        bindCidFun
      });
      console.log('[doc] initDocumentOrBoardContainer:', item);
      if (fileType == 'document') {
        this.state.docCid = item.cid;
      } else if (fileType == 'board') {
        this.state.boardCid = item.cid;
      }
      console.log('[doc] domain setRemoteData:', item);
      this.setRemoteData(item);
    }
    console.log('[doc] recover activeItem');
    this.setDocLoadComplete(true);
    const activeItem = this.state.containerList.find(item => item.active === 1);
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
    // console.log('[doc] initDocumentOrBoardContainer:', {
    //   width,
    //   height,
    //   fileType,
    //   cid,
    //   docId,
    //   bindCidFun
    // });
    if (!cid) {
      cid = this.createUUID(fileType);
      console.log('[doc] domain 新建的cid:', cid);
    } else {
      console.log('[doc] domain 指定的cid:', cid);
    }

    let opt = {
      id: cid,
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
    console.log('[doc] domain getCurrentThumbnailList res:', res);
    this.state.thumbnailList = res && res[0] ? res[0].list : [];
    // let doc = Array.isArray(res) ? res.find(item => item.id === this.state.currentCid) : null;
    // this.state.thumbnailList = doc ? doc.list : [];
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
    this.init()
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
        this.state.switchStatus = false; // 观众是否可见

        // 注意这里用true
        this.state.isChannelChanged = true;
      })
      .catch(ex => {
        console.error('[doc] groupReInitDocProcess error:', ex);
      });
  }
}
