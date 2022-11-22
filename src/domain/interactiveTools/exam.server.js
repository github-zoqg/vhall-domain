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
      }, // 观看端-是否作答状态
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
        const { data: accountInfo } = await exam.getExamToken({ webinar_id: 706175892 }) //发起端
        examToken = accountInfo
        examToken = {
          app_id: "eyJ0eXAF",
          csd_token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50X3R5cGUiOjEsImFjY291bnRfaWQiOiIxNjQyMjY4MCIsImV4cCI6Ijg2NDAwIiwiaWF0IjoxNjY4OTIyNjc1LCJwbGF0Zm9ybSI6MTd9.lLRvfNUEnsJwhFvdrW4cvGq1TRkJNhqziMX753ws35k",
          biz_permission_key: "068074a1142cd176af1fe3f5718021ec",
        };
      }
      examToken = {
        app_id: "eyJ0eXAF",
        csd_token:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50X3R5cGUiOjEsImFjY291bnRfaWQiOiIxNjQyMjY4MCIsImV4cCI6Ijg2NDAwIiwiaWF0IjoxNjY4OTIyNjc1LCJwbGF0Zm9ybSI6MTd9.lLRvfNUEnsJwhFvdrW4cvGq1TRkJNhqziMX753ws35k",
        biz_permission_key: "068074a1142cd176af1fe3f5718021ec",
      };
      // const role = watchInitData?.join_info?.role_name != 1 ? 2 : 1
      const role = 1
      this.examInstance = new window.ExamTemplateServer({
        role: role,
        source_type: 1,//渠道化蝶为1
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
      source_id: 863283088, // 活动id
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
  getExamPublishList(params) {
    this.examInstance?.api?.getExamPublishList(params).then(res => {
      if (res?.code === 200 && res?.data?.list?.length > 0) {
        // 第一步：数据格式化
        let resResult = res.data;
        let formatStrByMinute = (str) => {
          let hour = Math.floor(str / 60);
          let minute = str - hour * 60;
          return `${hour > 9 ? hour : `0${hour}`}:${minute > 9 ? minute : `0${minute}`}`;
        };
        resResult.list.map(item => {
          item.push_time_str = dayjs(item.push_time).format('HH:mm');
          item.limit_time_str =
            item.limit_time_switch == 1 ? formatStrByMinute(item.limit_time) : '';
        });
        this.state.examWatchResult = resResult;
        // 第二步：判断当前icon触发动作
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
  checkExam(params) {
    this.examInstance?.api?.checkExam(params).then(res => {
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
