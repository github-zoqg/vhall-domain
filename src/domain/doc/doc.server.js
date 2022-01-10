import { doc as docApi } from '../../request/index.js';
import BaseServer from '../common/base.server';
class DocServer extends BaseServer {
  constructor() {
    if (typeof useDocServer.instance === 'object') {
      return useDocServer.instance;
    }
    super();
    this.state = {
      docInstance: null
    };
  }

  on(type, cb) {
    if (!this.state.docInstance) return;
    this.state.docInstance.$on(type, cb);
  }

  destroy(isAutoDestroyMsg) {
    return this.state.docInstance.destroy(isAutoDestroyMsg);
  }

  init(options) {
    // const { state: roomInitGroupServer } = contextServer.get('roomInitGroupServer');
    // console.log('create doc', roomInitGroupServer.vhallSaasInstance.createDoc);
    // return roomInitGroupServer.vhallSaasInstance
    //   .createDoc(options)
    //   .then(instance => {
    //     this.state.docInstance = instance;
    //     return instance;
    //   })
    //   .catch(e => {
    //     return e;
    //   });
  }

  createBoard(options) {
    return this.state.docInstance.createBoard(options);
  }

  createDocument(options) {
    return this.state.docInstance.createDocument(options);
  }

  selectContainer(options) {
    console.log('select container:', option);
    return this.state.docInstance.selectContainer(option);
  }

  switchOnContainer(val) {
    return this.state.docInstance.switchOnContainer(val);
  }

  switchOffContainer(val) {
    return this.state.docInstance.switchOffContainer(val);
  }

  resetContainer() {
    return this.state.docInstance.resetContainer();
  }

  async getContainerInfo(options) {
    return this.state.docInstance.getContainerInfo(options);
  }

  destroyContainer(val) {
    return this.state.docInstance.destroyContainer(val);
  }

  getVodAllCids(val) {
    return this.state.docInstance.getVodAllCids(val);
  }

  setRemoteData(item) {
    return this.state.docInstance.setRemoteData(item);
  }

  zoomIn() {
    return this.state.docInstance.zoomIn();
  }

  zoomOut() {
    return this.state.docInstance.zoomOut();
  }

  zoomReset() {
    return this.state.docInstance.zoomReset();
  }

  cancelZoom() {
    return this.state.docInstance.cancelZoom();
  }

  move() {
    return this.state.docInstance.move();
  }

  prevStep() {
    return this.state.docInstance.prevStep();
  }

  nextStep() {
    return this.state.docInstance.nextStep();
  }

  setPlayMode(mode) {
    return this.state.docInstance.setPlayMode(mode);
  }

  setSize(width, height, options) {
    return this.state.docInstance.setSize(width, height, options);
  }

  createUUID(type) {
    return this.state.docInstance.createUUID(type);
  }

  setControlStyle(style) {
    return this.state.docInstance.setControlStyle(style);
  }

  gotoPage(options) {
    return this.state.docInstance.gotoPage(options);
  }

  setPen(val) {
    return this.state.docInstance.setPen(val);
  }

  setEraser(val) {
    return this.state.docInstance.setEraser(val);
  }

  setStroke(options) {
    return this.state.docInstance.setStroke(options);
  }

  setStrokeWidth(options) {
    return this.state.docInstance.setStrokeWidth(options);
  }

  clear() {
    return this.state.docInstance.clear();
  }

  setSquare(options) {
    return this.state.docInstance.setSquare(options);
  }

  setSingleArrow(options) {
    return this.state.docInstance.setSingleArrow(options);
  }

  setDoubleArrow(options) {
    return this.state.docInstance.setDoubleArrow(options);
  }

  setCircle(options) {
    return this.state.docInstance.setCircle(options);
  }

  setBitmap(options) {
    return this.state.docInstance.setBitmap(options);
  }

  setIsoscelesTriangle(options) {
    return this.state.docInstance.setIsoscelesTriangle(options);
  }

  cancelDrawable() {
    return this.state.docInstance.cancelDrawable();
  }

  setHighlighters() {
    return this.state.docInstance.setHighlighters();
  }

  setText(val) {
    return this.state.docInstance.setText(val);
  }

  loadDoc(options) {
    return this.state.docInstance.loadDoc(options);
  }

  start(val, type) {
    return this.state.docInstance.start(val, type);
  }

  republish() {
    return this.state.docInstance.republish();
  }

  setRole(role) {
    return this.state.docInstance.setRole(role);
  }

  setAccountId(role) {
    return this.state.docInstance.setAccountId(role);
  }

  setEditable(editable) {
    return this.state.docInstance.setEditable(editable);
  }

  getThumbnailList(options) {
    return this.state.docInstance.getThumbnailList(options);
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
export default function useDocServer() {
  return new DocServer();
}
