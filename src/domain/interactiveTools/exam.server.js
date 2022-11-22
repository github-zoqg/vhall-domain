/**
 * 考试服务
 * @returns
 */



import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import { exam } from '@/request/index.js'
class ExamServer extends BaseServer {
  constructor(options = {}) {
    super(options)
    this.state = {
      userCheckVo: {
        is_fill: null, // 是否需要填写表单 0.否 1.是
        is_answer: null // 是否已答题 0.否 1.是
      }
    }
    this.init()
  }
  async init() {
    console.log(window.ExamTemplateServer)
    const { watchInitData, examInfo } = useRoomBaseServer().state;
    let examToken = ''
    if (watchInitData.join_info.role_name != 1) {
      examToken = examInfo
    } else {
      const res = await exam.getExamToken({ webinar_id: watchInitData.webinar.id })
      examToken = res?.data
    }
    examToken.platform = 17
    console.log("ExamTemplateServer", window.ExamTemplateServer)
    //发卷人or答卷人
    const role = watchInitData.join_info.role_name != 1 ? 2 : 1
    this.ExamInstance = new window.ExamTemplateServer(role, examToken)
  }

  getExamList() { }

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
  checkExam(params) {
    this.ExamInstance.api.checkExam(params).then(res => {
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



// export default function useExamServer() {
// v2/exam/watch-list 「获取考试列表」
function getExamList() { }

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
