import contextServer from "@/domain/common/context.server.js";
import requestApi from "../../request/index.js";

const docApi = requestApi.doc;

export default function useDocServer() {
    const state = {
        docInstance: null
    };

    const on = (type, cb) => {
        if (!state.docInstance) return;
        state.docInstance.$on(type, cb);
    };

    const destroy = () => {
        return state.docInstance.destroy();
    };

    const init = (options) => {
        const { state: roomInitGroupServer } = contextServer.get(
            "roomInitGroupServer"
        );
        console.log(
            "create doc",
            roomInitGroupServer.vhallSaasInstance.createDoc
        );
        return roomInitGroupServer.vhallSaasInstance
            .createDoc(options)
            .then((instance) => {
                state.docInstance = instance;
                return instance;
            })
            .catch((e) => {
                return e;
            });
    };

    const createBoard = (options) => {
        return state.docInstance.createBoard(options);
    };

    const createDocument = (options) => {
        return state.docInstance.createDocument(options);
    };

    const selectContainer = (option) => {
        console.log("select container:", option);
        return state.docInstance.selectContainer(option);
    };

    const switchOnContainer = (val) => {
        return state.docInstance.switchOnContainer(val);
    };

    const switchOffContainer = (val) => {
        return state.docInstance.switchOffContainer(val);
    };

    const resetContainer = () => {
        return state.docInstance.resetContainer();
    };

    const getContainerInfo = async (options) => {
        return state.docInstance.getContainerInfo(options);
    };

    const destroyContainer = (val) => {
        return state.docInstance.destroyContainer(val);
    };

    const getVodAllCids = (val) => {
        return state.docInstance.getVodAllCids(val);
    };

    const setRemoteData = (item) => {
        return state.docInstance.setRemoteData(item);
    };

    const zoomIn = () => {
        return state.docInstance.zoomIn();
    };

    const zoomOut = () => {
        return state.docInstance.zoomOut();
    };

    const zoomReset = () => {
        return state.docInstance.zoomReset();
    };

    const cancelZoom = () => {
        return state.docInstance.cancelZoom();
    };

    const move = () => {
        return state.docInstance.move();
    };

    const prevStep = () => {
        return state.docInstance.prevStep();
    };

    const nextStep = () => {
        return state.docInstance.nextStep();
    };

    const setPlayMode = (mode) => {
        return state.docInstance.setPlayMode(mode);
    };

    const setSize = (width, height, options) => {
        return state.docInstance.setSize(width, height, options);
    };

    const createUUID = (type) => {
        return state.docInstance.createUUID(type);
    };

    const setControlStyle = (style) => {
        return state.docInstance.setControlStyle(style);
    };

    const gotoPage = (options) => {
        return state.docInstance.gotoPage(options);
    };

    const setPen = (val) => {
        return state.docInstance.setPen(val);
    };

    const setEraser = (val) => {
        return state.docInstance.setEraser(val);
    };

    const setStroke = (options) => {
        return state.docInstance.setStroke(options);
    };

    const setStrokeWidth = (options) => {
        return state.docInstance.setStrokeWidth(options);
    };

    const clear = () => {
        return state.docInstance.clear();
    };

    const setSquare = (options) => {
        return state.docInstance.setSquare(options)
    };

    const setSingleArrow = (options) => {
        return state.docInstance.setSquare(options)
    };

    const setDoubleArrow = (options) => {
        return state.docInstance.setSquare(options)
    };

    const setCircle = (options) => {
        return state.docInstance.setCircle(options)
    };

    const setBitmap = (options) => {
        return state.docInstance.setBitmap(options)
    };

    const setIsoscelesTriangle = (options) => {
        return state.docInstance.setIsoscelesTriangle(options)
    };

    const cancelDrawable = () => {
        return state.docInstance.cancelDrawable();
    };

    const setHighlighters = () => {
        return state.docInstance.setHighlighters();
    };

    const setText = (val) => {
        return state.docInstance.setText(val);
    };

    const loadDoc = (options) => {
        return state.docInstance.loadDoc(options);
    };

    const start = (val, type) => {
        return state.docInstance.start(val, type);
    };

    const republish = () => {
        return state.docInstance.republish();
    };

    const setRole = (role) => {
        return state.docInstance.setRole(role);
    };

    const setAccountId = (role) => {
        return state.docInstance.setAccountId(role);
    };

    const setEditable = (editable) => {
        return state.docInstance.setEditable(editable);
    };

    const getThumbnailList = (options) => {
        return state.docInstance.getThumbnailList(options);
    };
    // 获取文档列表(资料库所有文档)
    const getAllDocList = (params) => {
        return docApi.getAllDocList(params);
    };

    // 获取文档列表(当前活动下)
    const getWebinarDocList = (params) => {
        return docApi.getWebinarDocList(params);
    };

    // 获取文档详情
    const getDocDetail = (params) => {
        return docApi.getDocDetail(params);
    };

    // 同步文档
    const syncDoc = (params) => {
        return docApi.syncDoc(params);
    };

    // 删除文档(多选)
    const delDocList = (params) => {
        return docApi.delDocList(params);
    };

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
        getVodAllCids,
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
    }
}
