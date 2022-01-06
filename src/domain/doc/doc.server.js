import contextServer from '@/domain/common/context.server.js';
import requestApi from '../../request/index.js';
const docApi = requestApi.doc;
export default function useDocServer() {
  if (contextServer.has('docServer')) {
    return contextServer.get('docServer');
  }
  const state = {
    docInstance: null
  };

  function on(type, cb) {
    if (!state.docInstance) return;
    state.docInstance.$on(type, cb);
  }

  function destroy(isAutoDestroyMsg) {
    return state.docInstance.destroy(isAutoDestroyMsg);
  }

  function init(options) {
    const { state: roomInitGroupServer } = contextServer.get('roomInitGroupServer');
    console.log('create doc', roomInitGroupServer.vhallSaasInstance.createDoc);
    return roomInitGroupServer.vhallSaasInstance
      .createDoc(options)
      .then(instance => {
        state.docInstance = instance;
        return instance;
      })
      .catch(e => {
        return e;
      });
  }

  function createBoard(options) {
    return state.docInstance.createBoard(options);
  }

  function createDocument(options) {
    return state.docInstance.createDocument(options);
  }

  function selectContainer(options) {
    console.log('select container:', option);
    return state.docInstance.selectContainer(option);
  }

  function switchOnContainer(val) {
    return state.docInstance.switchOnContainer(val);
  }

  function switchOffContainer(val) {
    return state.docInstance.switchOffContainer(val);
  }

  function resetContainer() {
    return state.docInstance.resetContainer();
  }

  async function getContainerInfo(options) {
    return state.docInstance.getContainerInfo(options);
  }

  function destroyContainer(val) {
    return state.docInstance.destroyContainer(val);
  }

  function getVodAllCids(val) {
    return state.docInstance.getVodAllCids(val);
  }

  function setRemoteData(item) {
    return state.docInstance.setRemoteData(item);
  }

  function zoomIn() {
    return state.docInstance.zoomIn();
  }

  function zoomOut() {
    return state.docInstance.zoomOut();
  }

  function zoomReset() {
    return state.docInstance.zoomReset();
  }

  function cancelZoom() {
    return state.docInstance.cancelZoom();
  }

  function move() {
    return state.docInstance.move();
  }

  function prevStep() {
    return state.docInstance.prevStep();
  }

  function nextStep() {
    return state.docInstance.nextStep();
  }

  function setPlayMode(mode) {
    return state.docInstance.setPlayMode(mode);
  }

  function setSize(width, height, options) {
    return state.docInstance.setSize(width, height, options);
  }

  function createUUID(type) {
    return state.docInstance.createUUID(type);
  }

  function setControlStyle(style) {
    return state.docInstance.setControlStyle(style);
  }

  function gotoPage(options) {
    return state.docInstance.gotoPage(options);
  }

  function setPen(val) {
    return state.docInstance.setPen(val);
  }

  function setEraser(val) {
    return state.docInstance.setEraser(val);
  }

  function setStroke(options) {
    return state.docInstance.setStroke(options);
  }

  function setStrokeWidth(options) {
    return state.docInstance.setStrokeWidth(options);
  }

  function clear() {
    return state.docInstance.clear();
  }

  function setSquare(options) {
    return state.docInstance.setSquare(options);
  }

  function setSingleArrow(options) {
    return state.docInstance.setSingleArrow(options);
  }

  function setDoubleArrow(options) {
    return state.docInstance.setDoubleArrow(options);
  }

  function setCircle(options) {
    return state.docInstance.setCircle(options);
  }

  function setBitmap(options) {
    return state.docInstance.setBitmap(options);
  }

  function setIsoscelesTriangle(options) {
    return state.docInstance.setIsoscelesTriangle(options);
  }

  function cancelDrawable() {
    return state.docInstance.cancelDrawable();
  }

  function setHighlighters() {
    return state.docInstance.setHighlighters();
  }

  function setText(val) {
    return state.docInstance.setText(val);
  }

  function loadDoc(options) {
    return state.docInstance.loadDoc(options);
  }

  function start(val, type) {
    return state.docInstance.start(val, type);
  }

  function republish() {
    return state.docInstance.republish();
  }

  function setRole(role) {
    return state.docInstance.setRole(role);
  }

  function setAccountId(role) {
    return state.docInstance.setAccountId(role);
  }

  function setEditable(editable) {
    return state.docInstance.setEditable(editable);
  }

  function getThumbnailList(options) {
    return state.docInstance.getThumbnailList(options);
  }

  // 获取文档列表(资料库所有文档)
  function getAllDocList(params) {
    return docApi.getAllDocList(params);
  }

  // 获取文档列表(当前活动下)
  function getWebinarDocList(params) {
    return docApi.getWebinarDocList(params);
  }

  // 获取文档详情
  function getDocDetail(params) {
    return docApi.getDocDetail(params);
  }

  // 同步文档
  function syncDoc(params) {
    return docApi.syncDoc(params);
  }

  // 删除文档(多选)
  function delDocList(params) {
    return docApi.delDocList(params);
  }

  return {
    state,
    init,
    on,
    destroy,
    getVodAllCids,
    createBoard,
    createDocument,
    selectContainer,
    getContainerInfo,
    destroyContainer,
    setRemoteData,
    zoomIn,
    zoomOut,
    zoomReset,
    move,
    prevStep,
    nextStep,
    setPlayMode,
    setSize,
    createUUID,
    setControlStyle,
    gotoPage,
    cancelZoom,
    switchOnContainer,
    switchOffContainer,
    resetContainer,
    setPen,
    setEraser,
    setStroke,
    setStrokeWidth,
    setSquare,
    setCircle,
    setSingleArrow,
    setDoubleArrow,
    setIsoscelesTriangle,
    clear,
    cancelDrawable,
    setHighlighters,
    setText,
    loadDoc,
    start,
    republish,
    setRole,
    setAccountId,
    setEditable,
    getThumbnailList,
    getAllDocList,
    getWebinarDocList,
    getDocDetail,
    syncDoc,
    delDocList
  };
}
