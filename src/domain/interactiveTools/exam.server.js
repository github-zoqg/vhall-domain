/**
 * 考试服务
 * @returns
 */



import BaseServer from '../common/base.server';
import useMsgServer from '../common/msg.server';
import useRoomBaseServer from '../room/roombase.server';
import { exam } from '@/request/index.js'
import dayjs from 'dayjs';
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
      userCheckVo: {
        is_fill: null, // 是否需要填写表单 0.否 1.是
        is_answer: null // 是否已答题 0.否 1.是
      }, // 观看端-是否作答状态
    }
    this.init();
  }
  async init() {
    console.log(window.ExamTemplateServer)
    const { watchInitData } = useRoomBaseServer().state;
    console.log("--------->", watchInitData)
    // await exam.getExamToken({ webinar_id: watchInitData.webinar.id })
    console.log("ExamTemplateServer", window.ExamTemplateServer)
    this.ExamInstance = new window.ExamTemplateServer({})
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

  // /v1/fqa/app/paper/get-push-list 观看端-快问快答 获取推送快问快答列表
  getExamPublishList(params) {
    this.ExamInstance.api.getExamPublishList(params).then(res => {
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
