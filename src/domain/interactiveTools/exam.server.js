/**
 * 考试服务
 * @returns
 */

import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import { exam as examApi } from '@/request/index.js'
import dayjs from 'dayjs';



function checkInitiated() {
  return (_, name, descriptor) => {
    const method = descriptor.value;
    descriptor.value = function(...args) {
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
      userCheckVo: {
        is_fill: null, // 是否需要填写表单 0.否 1.是
        is_answer: null // 是否已答题 0.否 1.是
      }
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
      return Promise.resolve(this.examInstance)
    } catch (e) {
      return Promise.reject(e);
    }
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

  // v1/fqa/app/user-info-form/check 观看端-答题前置条件检查
  @checkInitiated()
  checkExam(params) {
    this.examInstance.api.checkExam(params).then(res => {
      if (res.code === 200) {
        this.state.userCheckVo = res.data;
      }
      return res;
    }).catch(err => {
      return err;
    });
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
