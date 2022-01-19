import BaseServer from '../common/base.server';
import VhallPaasSDK from '@/sdk/index.js';

/**
 * 装饰器，检测docInstance是否初始化
 * @returns
 */
function checkDocInstance() {
  return (target, name, descriptor) => {
    const method = descriptor.value;
    descriptor.value = function (...args) {
      if (!this.docInstance) {
        console.error(
          `Method \`${name}\` call failed, the docInstance property is null。\r\n Before calling, Make sure the \`initialize\` method is called to initialize`
        );
        return;
      }
      return method.apply(this, args);
    };
  };
}

/**
 * 文档白板服务 抽象基类
 * 主要是封装微吼云PaaS文档sdk的操作
 *
 * PaaS doc-JSSDK文档: http://www.vhallyun.com/docs/show/603
 *
 * @class AbstractDocServer
 */
export default class AbstractDocServer extends BaseServer {
  constructor() {
    if (new.target === AbstractDocServer) {
      throw new Error('can`t instantiate AbstractDocServer class');
    }
    super();
    this.docInstance = null; //pass 文档sdk的实例
  }

  /**
   * 初始化
   * @param {Object} options
   * @returns {Promise}
   */
  initialize(options = {}) {
    return new Promise((resolve, reject) => {
      this.docInstance = VhallPaasSDK.modules.VHDocSDK.createInstance(
        options,
        () => {
          resolve();
        },
        err => {
          console.error('实例化文档失败', err);
          reject(err);
        }
      );
    });
  }

  /**
   * 绑定各种事件
   * @param {*} type
   * @param {*} cb
   */
  @checkDocInstance()
  on(type, cb) {
    this.docInstance.on(type, cb);
  }

  /**
   * 销毁实例文档SdK实例，销毁所有容器、销毁所有
   * @param {Boolean} isAutoDestroyMsg 销毁后是否退出聊天频道，默认true。true:退出, false: 不退出
   * @returns
   */
  @checkDocInstance()
  destroy(isAutoDestroyMsg = true) {
    this.docInstance.destroy(isAutoDestroyMsg);
  }

  /***
   * 创建容器id
   * @param {String} type 白板传入board，文档传入document
   * @returns 返回唯一id
   */
  @checkDocInstance()
  createUUID(type) {
    return this.docInstance.createUUID(type);
  }

  /**
   * 创建白板 http://www.vhallyun.com/docs/show/603#%E5%88%9B%E5%BB%BA%E7%99%BD%E6%9D%BF
   * 注意: 当创建多次白板容器时，请使用不同的容器ID（elId）
   * @param {Object} options
   * @returns
   */
  @checkDocInstance()
  createBoard(options) {
    return this.docInstance.createBoard(options);
  }

  /**
   * 创建文档 http://www.vhallyun.com/docs/show/603#%E5%88%9B%E5%BB%BA%E6%96%87%E6%A1%A3
   * 注意当创建多次文档容器时，请使用不同的容器ID（elId）
   * @param {Object} options
   * @returns
   */
  @checkDocInstance()
  createDocument(options) {
    return this.docInstance.createDocument(options);
  }

  /**
   * 设置选中容器(激活某容器)
   * 如果找到了对应id的容器，返回容器，否则返回null
   * @param {String} cid 容器ID
   * @param {Boolean} noDispatch //非必填，默认false，是否推送消息到远端，false为推送，true为不推送
   * @returns {Promise}
   */
  @checkDocInstance()
  selectContainer(id, noDispatch = false) {
    return this.docInstance.selectContainer({ id, noDispatch });
  }

  /**
   * 显示容器，观看端可见
   * @param {?String} id 容器id，参数可选，一般不传，显示所有容器
   * @returns
   */
  @checkDocInstance()
  switchOnContainer(id) {
    const opts = id ? { id } : undefined;
    return this.docInstance.switchOnContainer(opts);
  }

  /**
   * 隐藏容器，观看端不可见
   * @param {?String} id 容器id，参数可选，一般不传，隐藏所有容器
   * @returns
   */
  @checkDocInstance()
  switchOffContainer(id) {
    const opts = id ? { id } : undefined;
    return this.docInstance.switchOffContainer(opts);
  }

  /**
   * 重置容器列表
   * 异步请求，清空所有的容器列表，此时再进入场景，服务端就不再返回任何容器内容，同时重置显示内容
   * @returns
   */
  @checkDocInstance()
  resetContainer() {
    return this.docInstance.resetContainer();
  }

  /**
   * 拉取指定channelId下的容器列表，不传获取当前channelId下的所有容器列表
   * @param {?String} channelId 频道id
   * @returns
   */
  @checkDocInstance()
  getContainerInfo(channelId) {
    const opts = channelId ? { channelId } : null;
    return this.docInstance.getContainerInfo(opts);
  }

  /**
   * 销毁（文档白板）容器
   * @param {String} id 容器id
   * @returns {Promise}
   */
  @checkDocInstance()
  destroyContainer(id) {
    const opts = id ? { id } : null;
    return this.docInstance.destroyContainer(opts);
  }

  /**
   * 获取点播、回放的所有容器列表
   * @returns
   */
  @checkDocInstance()
  getVodAllCids() {
    return this.docInstance.getVodAllCids();
  }

  /**
   * 加载远端实例数据
   * NOTE:
   *  This function is DEPRECATED (to be removed after 2.0.0). Users should use setRemoteData2 instead.
   * @param {Object} item
   * @deprecated
   * @returns
   */
  @checkDocInstance()
  setRemoteData(item) {
    return this.docInstance.setRemoteData(item);
  }

  /**
   * 加载远端实例数据2
   * @deprecated
   * @param {Array} list
   * @returns
   */
  @checkDocInstance()
  setRemoteData2(list) {
    return this.docInstance.setRemoteData2(list);
  }

  /**
   * 放大当前文档
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  zoomIn(id) {
    return this.docInstance.zoomIn({ id });
  }

  /**
   * 缩小当前文档
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  zoomOut(id) {
    return this.docInstance.zoomOut({ id });
  }

  /**
   * 还原当前文档
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  zoomReset(id) {
    return this.docInstance.zoomReset({ id });
  }

  /**
   * 取消缩放、移动模式。 恢复默认行为：画笔
   * NOTE:
   *  This function is DEPRECATED (to be removed after 2.0.0).
   * @deprecated
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  cancelZoom(id) {
    return this.docInstance.cancelZoom({ id });
  }

  /**
   * 设置当前文档进入移动模式,此时取消正在使用的文档功能：如画笔、涂鸦等
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  move(id) {
    return this.docInstance.move({ id });
  }

  /**
   * 当前文档(PPT2H5文档)上一步
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  prevStep(id) {
    return this.docInstance.prevStep({ id });
  }

  /**
   * 当前文档(PPT2H5文档)下一步
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  nextStep(id) {
    return this.docInstance.nextStep({ id });
  }

  /**
   * 设置播放模式
   * 因播放源存在 互动流，flv流，hls流 会引发延迟大小不一，设置指定播放模式用来控制接收到消息后的消息同步问题
   * @param {Enum} mode
   *  VHDocSDK.PlayMode.INTERACT 互动，0延迟
   *  VHDocSDK.PlayMode.FLV 低延迟，默认5秒
   *  VHDocSDK.PlayMode.HLS 较高延迟，默认10秒
   * @returns
   */
  @checkDocInstance()
  setPlayMode(mode) {
    return this.docInstance.setPlayMode(mode);
  }

  /**
   * 设置画布尺寸
   * @param {Number} width 宽,大于0的数字，不可用百分比
   * @param {Number} height 高,大于0的数字，不可用百分比
   * @param {?String} id 容器id, 可选，不传则设置所有文档的大小
   * @returns
   */
  @checkDocInstance()
  setSize(width, height, id) {
    return this.docInstance.setSize(width, height, { id });
  }

  /**
   * 设置指定容器的控制条样式 http://www.vhallyun.com/docs/show/603#%E6%8E%A7%E5%88%B6%E6%9D%A1%E6%A0%B7%E5%BC%8F
   * @param {?String} id 容器id,可选，不传则设置所有文档的控制条样式
   * @param {Object} style 样式
   * @returns
   */
  @checkDocInstance()
  setControlStyle(id, style) {
    return this.docInstance.setControlStyle({ id, style });
  }

  /**
   * 当前文档跳转到某一页
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @param {Number} page 第几页
   * @returns
   */
  @checkDocInstance()
  gotoPage({ id, page }) {
    return this.docInstance.gotoPage({ id, page });
  }

  /**
   * 设置当前文档使用画笔
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setPen(id) {
    return this.docInstance.setPen({ id });
  }

  /**
   * 设置当前文档使用橡皮擦
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setEraser(id) {
    return this.docInstance.setEraser({ id });
  }

  /**
   * 设置前文档的画笔粗细
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @param {Number} width 画笔粗细，数字，必填
   * @returns
   */
  @checkDocInstance()
  setStrokeWidth({ id, width }) {
    return this.docInstance.setStrokeWidth({ id, width });
  }

  /**
   * 设置前文档的画笔颜色
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @param {String} width 画笔颜色，必填
   * @returns
   */
  @checkDocInstance()
  setStroke({ id, color }) {
    return this.docInstance.setStroke({ id, color });
  }

  /**
   * 清空当前文档的绘画内容
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  clear(id) {
    return this.docInstance.clear({ id });
  }

  /**
   * 设置当前文档使用四边形
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setSquare(id) {
    return this.docInstance.setSquare({ id });
  }

  /**
   * 设置当前文档使用单箭头
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setSingleArrow(id) {
    return this.docInstance.setSingleArrow({ id });
  }

  /**
   * 设置当前文档使用双箭头
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setDoubleArrow(id) {
    return this.docInstance.setDoubleArrow({ id });
  }

  /**
   * 设置当前文档使用圆形
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setCircle(id) {
    return this.docInstance.setCircle({ id });
  }

  /**
   * 为当前文档设置图片，需要在初始化的时候设置uploadURL
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setBitmap(id) {
    return this.docInstance.setBitmap({ id });
  }

  /**
   * 设置当前文档使用等腰三角形
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setIsoscelesTriangle(id) {
    return this.docInstance.setIsoscelesTriangle({ id });
  }

  /**
   * 设置当前文档使用选择工具（取消画笔）
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  cancelDrawable(id) {
    return this.docInstance.cancelDrawable({ id });
  }

  /**
   * 设置当前文档使用荧光笔
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setHighlighters(id) {
    return this.docInstance.setHighlighters({ id });
  }

  /**
   * 设置当前文档使用文字工具
   * @param {?String} id 可选容器id，有传入id的话则会设置成当前文档
   * @returns
   */
  @checkDocInstance()
  setText(id) {
    return this.docInstance.setText({ id });
  }

  /**
   * 加载文档
   * 不传 docType 的时候,根据服务端返回的doc_type决定用哪个文档类型
   * @param {String} id 必填，容器id
   * @param {String} docId 必填，文档id
   * @param {Number} docType 非必填，文档类型 1:动态文档，即ppt；2:静态文档,即JPG
   * @returns
   */
  @checkDocInstance()
  loadDoc({ id, docId, docType }) {
    return this.docInstance.loadDoc({ id, docId, docType });
  }

  // TODO 没明白
  start(val, type) {
    return this.docInstance.start(val, type);
  }

  // TODO 没明白
  republish() {
    return this.docInstance.republish();
  }

  /**
   * 设置用户角色， sdk会根据用户角色进行权限设置
   * @param {Enum} role
   * VHDocSDK.RoleType.HOST	演讲人	编辑、翻页、缩放
   * VHDocSDK.RoleType.GUEST	嘉宾	缩放
   * VHDocSDK.RoleType.SPECTATOR	普通观众	缩放
   * VHDocSDK.RoleType.ASSISTANT	助理	翻页、缩放
   * @returns {Promise}
   */
  @checkDocInstance()
  setRole(role) {
    return this.docInstance.setRole(role);
  }

  setEditable(editable) {
    return this.docInstance.setEditable(editable);
  }

  /**
   * 获取缩略图列表
   * @returns
   */
  @checkDocInstance()
  getThumbnailList() {
    return this.docInstance.getThumbnailList();
  }
}
