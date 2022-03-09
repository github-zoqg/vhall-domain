/**
 * 问卷模块(基于问卷SDK)
 */

import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import questionnaireApi from '../../request/questionnaire';
import useMsgServer from '../common/msg.server';

const QUESTIONNAIRE_PUSH = 'questionnaire_push'; // 推送消息
class QuestionnaireServer extends BaseServer {
  constructor(opts = {}) {
    super();
    console.log('QuestionnaireServer QuestionnaireServer');
    this._uploadUrl = opts.uploadUrl;
    this._creatSelector = opts.creatSelector;
    // this._prevSelector = opts.prevSelector;
    this._mode = opts?.mode || null; // watch观看端 or live发起端
    this._paasSDKInstance = null;
    this.useRoomBaseServer = useRoomBaseServer();
    this.intiPaasQuestionnaireServerSDK(opts);
    this.state = {
      iconVisible: false, // icon 是否显示
      dotVisible: false, // 小红点是否显示
      lastQuestionnaireId: ''
    }
    if (opts.mode === 'watch') {
      this.checkIconStatus()
    }
  }
  /**
   * @description 初始化问卷服务sdk
   */
  intiPaasQuestionnaireServerSDK(opts = {}) {
    const { watchInitData } = this.useRoomBaseServer.state;
    const { interact, join_info } = watchInitData;
    this._paasSDKInstance = new VHall_Questionnaire_Service({
      auth: {
        app_id: interact.paas_app_id,
        third_party_user_id: join_info.third_party_user_id,
        access_token: interact.paas_access_token
      },
      notify: true,
      uploadUrl: this._uploadUrl,
      iphoneNumber: ''
    });
    if (opts.mode === 'watch') {
      this.initWatchEvent();
    } else {
      this.initLiveEvent();
    }
    useMsgServer().$onMsg('ROOM_MSG', msg => {
      console.log('问卷server监听', msg);
      switch (msg.data.event_type || msg.data.type) {
        //【分组创建/新增完成】
        case QUESTIONNAIRE_PUSH:
          console.log('问卷消息', msg);
          this.state.dotVisible = true
          this.state.iconVisible = true
          this.state.lastQuestionnaireId = msg.data.questionnaire_id
          this.$emit(QUESTIONNAIRE_PUSH, msg.data);
          break;
      }
    });
  }
  initLiveEvent() {
    this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.CREATE, data => {
      this.$emit(VHall_Questionnaire_Const.EVENT.CREATE, data);
    });
    this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.UPDATE, async data => {
      const extension = JSON.parse(data.extension);
      const relt = await this.editQuestionnaire(data, extension.playback_filling);
      this.$emit(VHall_Questionnaire_Const.EVENT.UPDATE, relt);
    });
    this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.ERROR, data => {
      this.$emit(VHall_Questionnaire_Const.EVENT.ERROR, data);
      // console.log('问卷错误', data);
    });
  }
  initWatchEvent() {
    this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.SUBMIT, async data => {
      const res = await this.submitQuestion(data);
      this.$emit(VHall_Questionnaire_Const.EVENT.SUBMIT, res);
    });
    this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.ERROR, data => {
      this.$emit(VHall_Questionnaire_Const.EVENT.ERROR, data);
      console.log('问卷错误', data);
    });
  }
  /**
   * @description 渲染问卷的视图(编辑)
   */
  renderCreatQuestionnaire(selector, id = '') {
    document.querySelector(selector).innerHTML = '';
    this._paasSDKInstance.renderPageEdit(selector, id);
  }

  /**
   * @description 渲染问卷的视图(观看端和预览)
   */
  renderQuestionnaire4Watch(selector, id) {
    document.querySelector(selector).innerHTML = '';
    this._paasSDKInstance.renderPagePC(selector, id);
  }
  /**
   * @description 渲染问卷的视图(wap)
   */
  renderQuestionnaire4Wap(selector, id) {
    document.querySelector(selector).innerHTML = '';
    this._paasSDKInstance.renderPageH5(selector, id);
    // this._paasSDKInstance.renderPagePC(selector, id);
  }
  /**
   * @description 条件查询问卷列表
   */
  queryQuestionnaireList(params) {
    const { watchInitData } = this.useRoomBaseServer.state;
    const { webinar, interact } = watchInitData;
    return questionnaireApi.queryQuestionnaireList({
      webinar_id: webinar.id,
      room_id: interact.room_id,
      ...params
    });
  }

  // 推送问卷
  publishQuestionnaire(surveyId) {
    const { watchInitData } = this.useRoomBaseServer.state;
    const { interact } = watchInitData;
    return new Promise((resolve, reject) => {
      questionnaireApi.publishQuestionnaire({
        room_id: interact.room_id,
        survey_id: surveyId
      }).then(res => {
        if (res.code === 200) {
          // 防止首次推送后没有发布
          this._paasSDKInstance.$http(VHall_Questionnaire_Const.HTTP.PUBLISH_QUESTIONNAIRE, surveyId).then(() => {
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        } else {
          reject(res)
        }
      }).catch(error => {
        reject(error)
      })
    })

  }
  /**
   * @description 删除问卷
   */
  deleteQuestionnaire(surveyId) {
    const { watchInitData } = this.useRoomBaseServer.state;
    const { webinar, interact } = watchInitData;
    return questionnaireApi.deleteQuestionnaire({
      webinar_id: webinar.id,
      room_id: interact.room_id,
      survey_ids: surveyId
    });
  }
  /**
   * @description 编辑问卷
   */
  editQuestionnaire(params, playback_filling) {
    const { watchInitData } = this.useRoomBaseServer.state;
    const { webinar, interact, join_info } = watchInitData;
    return questionnaireApi.editQuestionnaire({
      survey_id: params.id,
      title: params.title,
      description: params.description,
      img_url: params.imgUrl,
      playback_filling: playback_filling,
      user_id: join_info.user_id || join_info.third_party_user_id,
      webinar_id: webinar.id,
      room_id: interact.room_id
    });
  }
  /**
   * @description 推送问卷的回调处理
   */
  handlerQuestionnairePush() { }
  // 提交问卷
  async submitQuestion(opt) {
    const { naire_id, data, answer } = opt;
    const quesData = {};
    // vss数据
    opt.report &&
      opt.report.length > 0 &&
      opt.report.forEach(item => {
        switch (item.style) {
          case 'name':
            quesData.real_name = item.value;
            quesData.real_name_source = 'SURVEY';
            break;
          case 'area':
            quesData.address = item.value;
            break;
          case 'industry':
            quesData.industry = item.value;
            break;
          case 'education':
            quesData.education_level = item.value;
            break;
          case 'company':
            quesData.company = item.value;
            break;
          case 'phone':
            quesData.phone = item.value;
            break;
          case 'email':
            quesData.email = item.value;
            break;
          case 'birthday':
            quesData.birthday = item.value;
            break;
          case 'position':
            quesData.position = item.value;
            break;
          case 'sex':
            quesData.sex = item.value == '男' ? 'M' : 'W';
            break;
        }
      });
    const { watchInitData } = this.useRoomBaseServer.state;
    const { webinar, interact, join_info } = watchInitData;
    return await questionnaireApi.submitQuestionnaire({
      survey_id: naire_id,
      answer_id: data,
      visit_id: sessionStorage.getItem('visitorWatchId') || '',
      vss_token: this.accessToken,
      extend: JSON.stringify(quesData),
      res: answer,
      room_id: interact.room_id,
      webinar_id: webinar.id,
      user_id: join_info.user_id || join_info.third_party_user_id
    });
  }

  /**
   * @description 保存问卷(合并方法)
   */
  async saveQuestionnaire(data, isShare = false) {
    const { watchInitData } = this.useRoomBaseServer.state;
    const { interact, join_info, webinar } = watchInitData;
    let relt = Promise.resolve(true);
    if (isShare) {
      if (join_info.role_name === 1) {
        relt = await questionnaireApi.copyMainQuestionnaire({
          survey_id: data.id
        });
      } else {
        relt = await questionnaireApi.copyQuestionnaire({
          webinar_id: webinar.id,
          room_id: interact.room_id,
          survey_id: data.id
        });
      }
    }
    relt = await this.createLiveQuestion(data);
    return relt;
  }
  /**
   * @description 创建直播间的问卷
   */
  createLiveQuestion(data) {
    const extension = JSON.parse(data.extension);
    const { watchInitData } = this.useRoomBaseServer.state;
    const { webinar, interact, join_info } = watchInitData;
    return questionnaireApi.createLiveQuestion({
      title: data.title,
      survey_id: data.id,
      description: data.description,
      img_url: data.imgUrl,
      playback_filling: extension.playback_filling,
      room_id: interact.room_id,
      webinar_id: webinar.id,
      user_id: join_info.user_id || join_info.third_party_user_id
    });
  }
  /**
   * 检查用户是否已提交文件
   */
  checkAnswerStatus(surveyId) {
    const { watchInitData } = this.useRoomBaseServer.state;
    const { webinar } = watchInitData;
    return questionnaireApi.checkAnswerStatus({
      survey_id: surveyId,
      webinar_id: webinar.id,
    });
  }
  /**
   * 检查问卷图标的状态
   */
  checkIconStatus() {
    this.getLastSurvey().then(res => {
      const questionId = res?.data?.questionId;
      this.state.lastQuestionnaireId = questionId
      if (questionId) {
        this.state.iconVisible = true;
        this.checkAnswerStatus(questionId).then(response => {
          if (response.data) {
            this.state.dotVisible = true;
          }
          console.log('checkAnswerStatus', this.state)
        });
      }
    })
  }

  getLastSurvey(index = 0) {
    const { watchInitData } = this.useRoomBaseServer.state;
    const { interact, switch: _switch } = watchInitData;
    return questionnaireApi.getLastSurvey({
      room_id: interact.room_id,
      playback_filling: index,
      start_time: _switch.start_time,
      end_time: _switch.end_time
    });
  }

  setDotVisible(visivle) {
    this.state.dotVisible = visivle
  }
}

export default function useQuestionnaireServer(opts) {
  if (!QuestionnaireServer.instance) {
    QuestionnaireServer.instance = new QuestionnaireServer(opts)
  }
  return QuestionnaireServer.instance
}
