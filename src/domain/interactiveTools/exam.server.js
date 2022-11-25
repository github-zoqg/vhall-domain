/**
 * 考试服务
 * @returns
 */

import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import { exam as examApi } from '@/request/index.js'

function checkInitiated() {
  return (_, name, descriptor) => {
    const method = descriptor.value;
    descriptor.value = function (...args) {
      if (!this.examInstance) {
        console.error('ExamServer 未 init'); //FIXME: 调试完成后删掉
        return this.init().then(() => {
          return method.apply(this, args);
        })
      } else {
        console.warn('ExamServer 完成了 checkInitiated'); //FIXME: 调试完成后删掉
        return method.apply(this, args);
      }
    };
  };
}

class ExamServer extends BaseServer {
  constructor(options = {}) {
    super(options)
    this.state = {
      examWatchResult: {
        total: 0,
        list: []
      }, // 观看端-快问快答列表
      iconExecuteType: null, // 观看端-点击icon触发行为(answer.答题 score.查看个人成绩 miss.错过答题机会 other.不做任何处理)
      iconExecuteItem: null, // icon触发-单条快问快答对象
      dotVisible: false, // 是否展示小红点
      userCheckVo: {
        is_fill: null, // 是否需要填写表单 0.否 1.是
        is_answer: null // 是否已答题 0.否 1.是
      }
    }
    this.EVENT_TYPE = {
      EXAM_PAPER_SEND: 'paper_send', // 推送-快问快答
      EXAM_PAPER_SEND_RANK: 'paper_send_rank', // 公布-快问快答-成绩
      EXAM_PAPER_END: 'paper_end', // 快问快答-收卷
      EXAM_PAPER_AUTO_END: 'paper_auto_end', // 快问快答-自动收卷
      EXAM_PAPER_AUTO_SEND_RANK: 'paper_auto_send_rank', // 快问快答-自动公布成绩
      EXAM_ERROR: 'exam_error'
    }
  }
  async init() {
    if (this.examInstance instanceof ExamTemplateServer) {
      return Promise.resolve(this.examInstance)
    }
    try {
      const { watchInitData, examInfo } = useRoomBaseServer().state;
      let examToken = ''
      if (watchInitData?.join_info?.role_name != 1) {
        examToken = examInfo
      } else {
        const { data: accountInfo } = await examApi.getExamToken({ webinar_id: watchInitData.webinar.id }) //发起端
        examToken = accountInfo
      }
      const role = watchInitData?.join_info?.role_name != 1 ? 2 : 1
      this.examInstance = new window.ExamTemplateServer({
        role: role,
        accountInfo: {
          ...examToken,
          platform: 7
        }
      })
      this.listenMsg()
      return Promise.resolve(this.examInstance)
    } catch (e) {
      return Promise.reject(e);
    }
  }

  listenMsg() {
    // 房间消息
    useMsgServer().$onMsg('ROOM_MSG', rawMsg => {
      let temp = Object.assign({}, rawMsg);

      if (typeof temp.data !== 'object') {
        temp.data = JSON.parse(temp.data);
        temp.context = JSON.parse(temp.context);
      }
      // console.log(temp, '原始消息');
      const { type = '' } = temp.data || {};
      switch (type) {
        // 推送-快问快答
        case this.EVENT_TYPE.EXAM_PAPER_SEND:
          this.$emit(this.EVENT_TYPE.EXAM_PAPER_SEND, temp);
          break;
        // 公布-快问快答-成绩
        case this.EVENT_TYPE.EXAM_PAPER_SEND_RANK:
          this.$emit(this.EVENT_TYPE.EXAM_PAPER_SEND_RANK, temp);
          break;
        // 快问快答-收卷
        case this.EVENT_TYPE.EXAM_PAPER_END:
          this.$emit(this.EVENT_TYPE.EXAM_PAPER_END, temp);
          break;
        // 快问快答-自动收卷
        case this.EVENT_TYPE.EXAM_PAPER_AUTO_END:
          this.$emit(this.EVENT_TYPE.EXAM_PAPER_AUTO_END, temp);
          break;
        // 快问快答-自动公布成绩
        case this.EVENT_TYPE.EXAM_PAPER_AUTO_SEND_RANK:
          this.$emit(this.EVENT_TYPE.EXAM_PAPER_AUTO_SEND_RANK, temp);
          break;
        default:
          break;
      }
    });
  }

  @checkInitiated()
  mount(...args) {
    this.examInstance.mount(...args)
  }

  // 获取问卷列表
  @checkInitiated()
  getExamList(params) {
    const { watchInitData } = useRoomBaseServer().state;
    const data = {
      ...params,
      source_id: watchInitData?.webinar?.id, // 活动id
      source_type: 1,
    }
    return this.examInstance.api.getExamList(data)
  }

  // 复制问卷
  @checkInitiated()
  copyExam(examId) {
    const data = {
      id: examId
    }
    return this.examInstance.api.copyExam(data)
  }

  // 删除问卷
  @checkInitiated()
  delExam(examIds = []) {
    if (!Array.isArray(examIds)) {
      examIds = [examIds]
    }
    const data = {
      ids: examIds.join(',')
    }
    return this.examInstance.api.delExam(data)
  }

  // 推送问卷(化蝶)
  sendPushExam(examId) {
    const { watchInitData } = useRoomBaseServer().state;
    const data = {
      paper_id: examId,
      webinar_id: watchInitData?.webinar?.id,
      switch_id: watchInitData?.switch?.switch_id
    }
    return examApi.pushExam(data)
  }

  // 收卷
  sendCollectExam(examId) {
    const { watchInitData } = useRoomBaseServer().state;
    const data = {
      paper_id: examId,
      webinar_id: watchInitData?.webinar?.id
    }
    return examApi.collectExam(data)
  }

  // 公布
  sendPublishExam(examId) {
    const { watchInitData } = useRoomBaseServer().state;
    const data = {
      paper_id: examId,
      webinar_id: watchInitData?.webinar?.id
    }
    return examApi.publishExam(data)
  }

  // 问卷统计数据
  @checkInitiated()
  getExamSummary(examId) {
    const data = {
      paper_id: examId
    }
    return this.examInstance.api.getExamPaperSummary(data)
  }

  // 问卷排行榜
  @checkInitiated()
  getExamRankList(params) {
    return this.examInstance.api.getExamUserPerformances(params)
  }

  // /console/exam/paper-create 「创建考试试卷」
  createExamPaper() { }

  // /v2/exam/publish 「发布考试」
  publishExam() { }

  // /v2/exam/grade-list 「获取批阅列表」
  getGradeList() { }

  // /console/exam/stat 「考试统计」
  getExamStat() { }

  // /v2/exam/answered-list 「查看试卷列表「考试中、已作答、已结束」」
  getAnsweredList() { }

  // /v2/exam/answer 回复/填写 exam
  answerExam() { }

  // /v1/fqa/app/paper/get-push-list 观看端-快问快答 获取推送快问快答列表
  @checkInitiated()
  getExamPublishList(params) {
    const { watchInitData } = useRoomBaseServer().state;
    const data = {
      source_id: watchInitData?.webinar?.id, // 活动ID
      source_type: 1, // 类型：活动1
      switch_id: watchInitData?.switch?.switch_id,
      ...params
    }
    this.examInstance?.api?.getExamPublishList(data).then(res => {
      if (res.code === 200 && res.data) {
        this.state.examWatchResult = {
          list: res.data,
          total: res.data.length
        }
      } else {
        this.state.examWatchResult = {
          total: 0,
          list: []
        }
      }
      return res;
    }).catch(err => {
      this.state.examWatchResult = {
        total: 0,
        list: []
      }
      return err;
    });
  }

  // 判断icon触发动作类型
  @checkInitiated()
  setExecuteIconEvents() {
    // 过滤数组：未作答 且  答题未超时（开启了限时答题） 或者 未作答（未开启限时答题）
    let arr = this.state.examWatchResult.list.filter(item => {
      return (
        (item.limit_time_switch == 1 && item.status == 0 && item.is_end == 0) ||
        item.status == 0
      );
    });
    // 如果只有一份，直接进入到当前答题
    if (arr.length == 1) {
      this.state.iconExecuteType = 'answer';
      this.state.iconExecuteItem = arr[0];
    } else if (this.state.examWatchResult.total == 0) {
      let item = this.state.examWatchResult.list[0];
      this.state.iconExecuteItem = item;
      if (item.status == 1) {
        // 已作答，已答题，直接查看个人成绩
        this.state.iconExecuteType = 'score';
      } else if (item.limit_time_switch == 1 && item.is_end == 1) {
        // 限时答题 & 已超时 & 未作答，toast提示 “很遗憾，您已错过本次答题机会！”
        this.state.iconExecuteType = 'miss';
      }
    } else {
      this.state.iconExecuteType = 'other';
      this.state.iconExecuteItem = null;
    }
  }

  // 是否展示小红点
  setExamWatchDotVisible(visible) {
    this.state.dotVisible = visible
  }

  // v1/fqa/app/user-info-form/check 观看端-答题前置条件检查
  @checkInitiated()
  checkWebinarExam(params) {
    const { watchInitData } = useRoomBaseServer().state;
    const data = {
      source_type: 1,
      source_id: watchInitData?.webinar?.id,
      ...params
    }
    this.examInstance.api.checkExam(data).then(res => {
      if (res.code === 200) {
        this.state.userCheckVo = res.data;
      }
      return res;
    }).catch(err => {
      return err;
    });
  }

  // /v1/fqa/app/paper/get-preview-info 观看端-预览快问快答
  @checkInitiated()
  getExamPreviewInfo(params) {
    return this.examInstance.api.getExamPreviewInfo(params);
  }

  // 【观看端】获取榜单信息
  getSimpleRankList(params) {
    const { watchInitData } = useRoomBaseServer().state;
    const data = {
      paper_id: params.paper_id,
      webinar_id: watchInitData?.webinar?.id,
      pos: params.pos,
      limit: params.limit
    }
    return examApi.getSimpleRankList(data)
  }
}

export default function useExamServer(options = {}) {
  if (!useExamServer.instance) {
    useExamServer.instance = new ExamServer(options)
  }
  return useExamServer.instance
}

// /console/exam/paper-create 「创建考试试卷」
function createExamPaper() { }

// /v2/exam/publish 「发布考试」
function publishExam() { }

// /v2/exam/grade-list 「获取批阅列表」
function getGradeList() { }

// /console/exam/stat 「考试统计」
function getExamStat() { }

// /v2/exam/answered-list 「查看试卷列表「考试中、已作答、已结束」」
function getAnsweredList() { }

// /v2/exam/answer 回复/填写 exam
function answerExam() { }

//   // msg:暂缺

//   return {
//     getExamList,
//     createExamPaper,
//     publishExam,
//     getGradeList,
//     getExamStat,
//     getAnsweredList,
//     answerExam
//   };
// }
