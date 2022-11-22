/**
 * 考试服务
 * @returns
 */

import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import { exam } from '@/request/index.js'
import dayjs from 'dayjs';



function checkInitiated() {
  return (_, name, descriptor) => {
    const method = descriptor.value;
    descriptor.value = function (...args) {
      if (!this.ExamInstance) {
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
      this.$emit('initiated') // 派发自己初始化完成(只需要知道已完成  不需要过程)
      return Promise.resolve(this.examInstance)
    }
    try {
      // console.log(window.ExamTemplateServer)
      //FIXME: mock  互动token,后期删除
      // sessionStorage.setItem('interact-token', localStorage.getItem('interact-token') || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqaWQiOjIwOTkxNDgsInVpZCI6MTY0MjI5MjksInZpZCI6IiIsInRwdWlkIjoiMTY0MjI5MjkiLCJ3aWQiOjU0MzU0OTI3Miwicm9vbV9pZCI6Imxzc182ODNjNzQwYiIsImN0IjoxNjY5MDg4ODEzfQ.k3mzcL4nN95R3PptE_6hqvek9MA-vG0izh-z-qpklRM')
      const { watchInitData, examInfo } = useRoomBaseServer().state;
      let examToken = ''
      if (watchInitData?.join_info?.role_name != 1) {
        examToken = examInfo
      } else {
        const { data: accountInfo } = await exam.getExamToken({ webinar_id: watchInitData.webinar.id }) //发起端
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
      this.$emit('initiated') // 派发自己初始化完成
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
    const data = {
      ...params,
      // source_id: webinar_id, // 活动id
      source_id: 543549272, // 活动id
      source_type: 1,
    }
    return this.examInstance.api.getExamList(data)
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
