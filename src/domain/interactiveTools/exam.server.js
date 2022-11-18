/**
 * 考试服务
 * @returns
 */



import BaseServer from '../common/base.server';

class ExamServer extends BaseServer {
  constructor(options = {}) {
    super(options)
    console.log("🚀 ~ file: examServer.js ~ line 6 ~ ExamServer ~ constructor ~ options", options)
    this.server = new window.ExamTemplateServer();
    console.log("🚀 ~ file: exam.server.js ~ line 14 ~ ExamServer ~ constructor ~ ExamTemplateServer", ExamTemplateServer)
    console.log("🚀 ~ file: exam.server.js ~ line 14 ~ ExamServer ~ constructor ~ server", this.server)
    this.state = {

    }
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
