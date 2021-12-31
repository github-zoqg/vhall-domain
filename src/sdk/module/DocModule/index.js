import BaseModule from '../Base'
import { merge, isPc } from '@/utils/index.js'
import store from '../../store/index.js'


export default class DocModule extends BaseModule {
  constructor(options) {
    super(options)
    this.instance = null
    this.children = []
  }

  init(customOptions = {}) {
    const defaultOptions = this.initDefaultOptions()

    const options = merge.recursive({}, defaultOptions, customOptions)
    console.log('doc options:', options)

    return new Promise((resolve, reject) => {

      const onSuccess = () => {
        console.log('saasSDK文档初始化成功')
        resolve()
      }

      const onFail = (failed) => {
        console.error('saasSDK文档初始化失败', failed.msg)
        reject()
      }

      this.instance = window.VHDocSDK.createInstance(options, onSuccess, onFail)
      this.listenEvents()

    })

  }

  initDefaultOptions() {
    const isPcClient = isPc()

    const { paasInfo = {}, userInfo = {} } = store.get('roomInitData')

    const defaultOptions = {
      accountId: userInfo?.third_party_user_id,
      roomId: paasInfo?.room_id,
      channelId: paasInfo?.channel_id, // 频道id 必须
      appId: paasInfo?.paas_app_id, // appId 必须
      role: userInfo?.role_name, // 角色 必须
      isVod: false, // 是否是回放 必须
      client: window.VHDocSDK.Client.PC_WEB, // 客户端类型
      token: '',
    }

    return defaultOptions;
  }

  listenEvents() {
    // 创建容器事件
    this.instance.on(VHDocSDK.Event.CREATE_CONTAINER, (data) => {
      this.$emit(VHDocSDK.Event.CREATE_CONTAINER, data)
    })

    // 选择容器
    this.instance.on(VHDocSDK.Event.SELECT_CONTAINER, (data) => {
      this.$emit(VHDocSDK.Event.SELECT_CONTAINER, data)
    })

    // 当前文档加载完成
    this.instance.on(VHDocSDK.Event.DOCUMENT_LOAD_COMPLETE, (data) => {
      console.log('doc 加载完成')
      this.$emit(VHDocSDK.Event.DOCUMENT_LOAD_COMPLETE, data)
    })

    // 开关变换
    this.instance.on(VHDocSDK.Event.SWITCH_CHANGE, (status) => {
      this.$emit(VHDocSDK.Event.SWITCH_CHANGE, status)
    })

    // 删除容器时候触发的事件
    this.instance.on(VHDocSDK.Event.DELETE_CONTAINER, (data) => {
      this.$emit(VHDocSDK.Event.DELETE_CONTAINER, data)
    })

    // 所有的文档准备完成
    this.instance.on(VHDocSDK.Event.ALL_COMPLETE, (data, s1, s2) => {
      console.log('doc 所有文档加载完成', data, s1, s2)
      this.$emit(VHDocSDK.Event.ALL_COMPLETE, data)
    })

    // 正在演示的文档被删除(文档不存在)
    this.instance.on(VHDocSDK.Event.DOCUMENT_NOT_EXIT, ({ cid, docId }) => {
      this.$emit(VHDocSDK.Event.DOCUMENT_NOT_EXIT, { cid, docId })
    })

    // 翻页事件
    this.instance.on(VHDocSDK.Event.PAGE_CHANGE, event => {
      this.$emit(VHDocSDK.Event.PAGE_CHANGE, event)
    })

    // 回放文件加载完成
    this.instance.on(VHDocSDK.Event.VOD_CUEPOINT_LOAD_COMPLETE, (event, s1, s2) => {
      console.log('doc 回放文件加载完成', event, s1, s2)
      this.$emit(VHDocSDK.Event.VOD_CUEPOINT_LOAD_COMPLETE, event)
    })

    // 回放时间更新
    this.instance.on(VHDocSDK.Event.VOD_TIME_UPDATE, (event) => {
      this.$emit(VHDocSDK.Event.VOD_TIME_UPDATE, event)
    })

    // error
    this.instance.on(VHDocSDK.Event.ERROR, (event) => {
      this.$emit(VHDocSDK.Event.ERROR, event)
    })

    // ppt文档加载完毕
    this.instance.on(VHDocSDK.Event.PLAYBACKCOMPLETE, event => {
      this.$emit(VHDocSDK.Event.PLAYBACKCOMPLETE, event)
    })
  }

  destroy(isAutoDestroyMsg) {
    if (!this.instance) return;
    this.instance.destroy(isAutoDestroyMsg)
    this.instance = null
  }

  createUUID(type) {
    return this.instance.createUUID(type)
  }

  createBoard(customOptions) {
    let elId = this.instance.createUUID('board')
    const defaultOptions = {
      elId, // div 容器 必须
      width: 200, // div 宽度，像素单位，数值型不带px 必须
      height: 200, // div 高度，像素单位，数值型不带px 必须
      backgroundColor: 'RGBA', // 背景颜色， 支持RGB 与 RGBA， 如果全透明，舞台背景色与网页背景色相同，如 ‘#FF0000’或 ‘#FF000000’ 必须
      noDispatch: false, // 非必填，默认false，是否推送消息到远端，false为推送，true为不推送，加载远程文档时该字段应为true
      option: { // 非必填，画笔预设选项
        graphicType: VHDocSDK.GRAPHIC.PEN, // 选项请参考画笔预设值,
        stroke: '#000', // 颜色值
        strokeWidth: 4, // 正数 Number
      }
    }

    const options = merge.recursive({}, defaultOptions, customOptions)

    return this.instance.createBoard(options)
  }

  createDocument(customOptions) {
    console.log('create Document success!')
    let elId = this.instance.createUUID('document') // 容器id，必须用此方法创建，文档传入document，返回唯一id
    let defaultOptions = {
      id: customOptions.id,
      docId: customOptions.docId,
      elId, // div 容器 必须
      width: 200, // div 宽度，像素单位，数值型不带px 必须
      height: 200, // div 高度，像素单位，数值型不带px 必须，
      docId: 'yyy', // 文档id
      noDispatch: false, // 非必填，默认false，是否推送消息到远端，false为推送，true为不推送，加载远程文档时该字段应为true
      option: { // 非必填，画笔预设选项
        graphicType: VHDocSDK.GRAPHIC.PEN, // 选项请参考画笔预设值,
        stroke: '#000', // 颜色值
        strokeWidth: 4, // 正数 Number
      }
    }

    const options = merge.recursive({}, defaultOptions, customOptions)
    return this.instance.createDocument(options) // 返回promise
  }

  selectContainer(options) {
    this.instance.selectContainer(options)
    this.currentCid = options.id;
  }

  getContainerInfo(params) {
    return this.instance.getContainerInfo(params)
  }

  destroyContainer(val) {
    return this.instance.destroyContainer(val)
  }

  getVodAllCids() {
    return this.instance.getVodAllCids()
  }

  setRemoteData(item) {
    return this.instance.setRemoteData(item)
  }

  addChild(child) {
    return this.children.push(child)
  }

  zoomIn() {
    return this.instance.zoomIn()
  }

  zoomOut() {
    return this.instance.zoomOut()
  }

  zoomReset() {
    return this.instance.zoomReset()
  }

  cancelZoom() {
    return this.instance.cancelZoom()
  }

  move() {
    return this.instance.move()
  }

  prevStep() {
    return this.instance.prevStep()
  }

  nextStep() {
    return this.instance.nextStep()
  }

  switchOnContainer(val) {
    return this.instance.switchOnContainer(val)
  }

  switchOffContainer(val) {
    return this.instance.switchOffContainer(val)
  }

  resetContainer() {
    return this.instance.resetContainer()
  }

  setPlayMode(mode) {
    return this.instance.setPlayMode(mode)
  }

  setSize(width, height, options) {
    return this.instance.setSize(width, height, options)
  }

  setControlStyle(style) {
    return this.instance.setControlStyle(style)
  }

  gotoPage(options) {
    return this.instance.gotoPage(options)
  }

  setPen(val) {
    return this.instance.setPen(val)
  }

  setEraser(val) {
    return this.instance.setEraser(val)
  }

  setStroke(options) {
    return this.instance.setStroke(options)
  }

  setStrokeWidth(options) {
    return this.instance.setStrokeWidth(options)
  }

  clear() {
    return this.instance.clear()
  }

  cancelDrawable() {
    return this.instance.cancelDrawable()
  }

  setHighlighters() {
    return this.instance.setHighlighters()
  }

  setText(val) {
    return this.instance.setText(val)
  }

  loadDoc(options) {
    return this.instance.loadDoc(options)
  }

  start(val, type) {
    return this.instance.start(val, type)
  }

  republish() {
    return this.instance.republish()
  }

  setRole(role) {
    return this.instance.setRole(role)
  }

  setAccountId(role) {
    return this.instance.setAccountId(role)
  }

  setEditable(editable) {
    return this.instance.setEditable(editable)
  }

  getThumbnailList(options) {
    return this.instance.getThumbnailList(options)
  }

  setSquare(options) {
    return this.instance.setSquare(options)
  }

  setCircle(options) {
    return this.instance.setCircle(options)
  }

  setSingleArrow(options) {
    return this.instance.setSingleArrow(options)
  }

  setDoubleArrow(options) {
    return this.instance.setDoubleArrow(options)
  }

  setBitmap(options) {
    return this.instance.setBitmap(options)
  }

  setIsoscelesTriangle(options) {
    return this.instance.setIsoscelesTriangle(options)
  }

  /**
   * @description 调用sdk方法
   * @param  {...any} args 
   */
  callPaasSDK() {
    const { key, ...args } = arguments
    if (!key) return console.error('没有指定调用的函数名')
    this.instance[key].call(this.instance[key], ...args)
  }
}