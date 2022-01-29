/**
 * 考试服务
 * @returns
 */
export default function useExamServer() {
  // v2/exam/watch-list 「获取考试列表」
  function getExamList() {}

  // /console/exam/paper-create 「创建考试试卷」
  function createExamPaper() {}

  // /v2/exam/publish 「发布考试」
  function publishExam() {}

  // /v2/exam/grade-list 「获取批阅列表」
  function getGradeList() {}

  // /console/exam/stat 「考试统计」
  function getExamStat() {}

  // /v2/exam/answered-list 「查看试卷列表「考试中、已作答、已结束」」
  function getAnsweredList() {}

  // /v2/exam/answer 回复/填写 exam
  function answerExam() {}

  // msg:暂缺

  return {
    getExamList,
    createExamPaper,
    publishExam,
    getGradeList,
    getExamStat,
    getAnsweredList,
    answerExam
  };
}
