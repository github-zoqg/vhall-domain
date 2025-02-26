/**
 * 问卷模块(基于问卷SDK)
 */
import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import questionnaireApi from '../../request/questionnaire';
import useMsgServer from '../common/msg.server';
import { renderHTML } from '../../utils';
class QuestionnaireServer extends BaseServer {
  constructor(opts = {}) {
    super();
    this._uploadUrl = opts.uploadUrl;
    this._creatSelector = opts.creatSelector;
    this._paasSDKInstance = null;
    this.state = {
      iconVisible: false, // icon 是否显示
      dotVisible: false, // 小红点是否显示
      lastQuestionnaireId: '', // 最后一个问卷id
      QuestionList: null,
      alias: '',
      resdyState: false//是否初始化完成
    }

    this.EVENT_TYPE = {
      QUESTIONNAIRE_PUSH: 'questionnaire_push',
      QUESTIONNAIRE_READY: 'questionnaire_ready',
      QUESTIONNAIRE_CREATE: 'questionnaire_create',
      QUESTIONNAIRE_UPDATE: 'questionnaire_update',
      QUESTIONNAIRE_SUBMIT: 'questionnaire_submit',
      QUESTIONNAIRE_ERROR: 'questionnaire_error'
    }

    useMsgServer().$onMsg('ROOM_MSG', async msg => {
      switch (msg.data.event_type || msg.data.type) {
        case 'questionnaire_push':
          console.log('问卷消息', msg);
          const questionnaireId = msg.data.questionnaire_id
          this.state.lastQuestionnaireId = questionnaireId
          !this.state.iconVisible && this.changeIconShowNum(true)
          this.state.iconVisible = true
          this.$emit(this.EVENT_TYPE.QUESTIONNAIRE_PUSH, msg.data);
          break;
      }
    });
  }

  /**
   * 初始化
   * @param {Object} customOptions
   * @returns {Promise}
   */
  init(opts = {}) {
    if (this._paasSDKInstance) {
      // 问卷sdk已经实例化过
      // console.log('问卷sdk已经初始化过，不需要重复初始化');
      return;
    }
    const { watchInitData } = useRoomBaseServer().state;
    const { interact, join_info } = watchInitData;
    // 初始化问卷服务SDK
    this._paasSDKInstance = new VHall_Questionnaire_Service({
      auth: {
        app_id: interact.paas_app_id,
        third_party_user_id: join_info.third_party_user_id,
        access_token: interact.paas_access_token
      },
      notify: true,
      uploadUrl: this._uploadUrl,
      iphoneNumber: '',
      showVhPrivacy: (opts && opts.mode == 'watch' && opts.showVhPrivacy) || false // 如果是观看页，展示隐私协议，否则隐藏
    });
    // 初始化问卷相关事件
    this._initEvent(opts.mode);
  }

  _initEvent(mode) {
    if (mode === 'watch') {
      // 初始化观看端事件
      this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.SUBMIT, async data => {
        window.vhallReportForWatch?.report(170021, {
          survey_id: data.naire_id
        });
        const res = await this.submitQuestion(data);
        // 最后小红点以最后一个问卷的提交情况为准
        // if (data.naire_id == this.state.lastQuestionnaireId) {
        //   this.state.dotVisible = false
        // }
        this.$emit(this.EVENT_TYPE.QUESTIONNAIRE_SUBMIT, res);
      });
    } else {
      // 初始化发起端事件
      this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.CREATE, data => {
        this.$emit(this.EVENT_TYPE.QUESTIONNAIRE_CREATE, data);
      });
      this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.UPDATE, async data => {
        const extension = JSON.parse(data.extension);
        data.alias = this.state.alias;
        const relt = await this.editQuestionnaire(data, extension.playback_filling);
        this.$emit(this.EVENT_TYPE.QUESTIONNAIRE_UPDATE, relt, data);
      });
    }
    this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.ERROR, data => {
      this.$emit(this.EVENT_TYPE.QUESTIONNAIRE_ERROR, data);
      console.log('问卷错误', data);
    });
    this._paasSDKInstance.$on(VHall_Questionnaire_Const.EVENT.READY, data => {
      this.state.resdyState = true
      this.$emit(this.EVENT_TYPE.QUESTIONNAIRE_READY, data);
      console.log('问卷初始化完成', data);
    });
  }

  /**
   * @description 渲染问卷的视图(编辑)
   */
  renderCreatQuestionnaire(selector, id = '') {
    // document.querySelector(selector).innerHTML = '';
    renderHTML(document.querySelector(selector))
    this._paasSDKInstance.renderPageEdit(selector, id);
  }

  /**
   * @description 渲染问卷的视图(观看端和预览)
   */
  renderQuestionnaire4Watch(selector, id) {
    // document.querySelector(selector).innerHTML = '';
    renderHTML(document.querySelector(selector))
    this._paasSDKInstance.renderPagePC(selector, id);
  }

  /**
   * @description 渲染问卷的视图(wap)
   */
  renderQuestionnaire4Wap(selector, id) {
    // document.querySelector(selector).innerHTML = '';
    renderHTML(document.querySelector(selector))
    this._paasSDKInstance.renderPageH5(selector, id);
  }

  /**
   * @description 条件查询问卷列表
   */
  queryQuestionnaireList(params) {
    const { watchInitData } = useRoomBaseServer().state;
    const { webinar, interact } = watchInitData;
    return questionnaireApi.queryQuestionnaireList({
      webinar_id: webinar.id,
      room_id: interact.room_id,
      ...params
    });
  }

  // 推送问卷
  publishQuestionnaire(surveyId) {
    const { watchInitData } = useRoomBaseServer().state;
    const { interact } = watchInitData;
    return new Promise((resolve, reject) => {
      questionnaireApi.publishQuestionnaire({
        room_id: interact.room_id,
        survey_id: surveyId,
        switch_id: watchInitData.switch.switch_id
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
   * @description 复制问卷
   * @param opts { surveyId: 111, alias: '问卷展示名称'}
   */
  copyQuestionnaire(opts) {
    const { watchInitData } = useRoomBaseServer().state;
    const { webinar, interact } = watchInitData;
    const params = {
      webinar_id: webinar.id,
      room_id: interact.room_id,
      survey_id: opts.surveyId
    }
    if (opts.alias) {
      params.alias = opts.alias
    }
    return questionnaireApi.copyQuestionnaire(params);
  }

  /**
   * @description 删除问卷
   */
  deleteQuestionnaire(surveyId) {
    const { watchInitData } = useRoomBaseServer().state;
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
  editQuestionnaire(data, playback_filling) {
    const { watchInitData } = useRoomBaseServer().state;
    const { webinar, interact, join_info } = watchInitData;
    const extension = JSON.parse(data.extension);
    const params = {
      survey_id: data.id,
      title: data.title,
      description: data.description,
      img_url: data.imgUrl,
      playback_filling: playback_filling,
      user_id: join_info.user_id || join_info.third_party_user_id,
      webinar_id: webinar.id,
      room_id: interact.room_id,
      privacy_agreement: extension.openPrivacy ? 1 : 0,
    }
    if (data.alias) {
      params.alias = data.alias
    }
    data.detail.forEach(i => {
      if (i.detail && i.detail.format == 'phone') {
        params.phone_verification_switch = i.verification == 'Y' ? 1 : 0
      }
    })
    return questionnaireApi.editQuestionnaire(params);
  }

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
    const { watchInitData } = useRoomBaseServer().state;
    const { webinar, interact, join_info } = watchInitData;
    return await questionnaireApi.submitQuestionnaire({
      survey_id: naire_id,
      answer_id: data.id,
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
    const { watchInitData } = useRoomBaseServer().state;
    const { interact, join_info, webinar } = watchInitData;
    let relt = Promise.resolve(true);
    if (isShare) {
      if (join_info.role_name === 1) {
        const params = {
          survey_id: data.id
        }
        if (data.alias) {
          params.alias = data.alias
        }
        relt = await questionnaireApi.copyMainQuestionnaire(params);
      } else {
        const params = {
          webinar_id: webinar.id,
          room_id: interact.room_id,
          survey_id: data.id
        }
        if (data.alias) {
          params.alias = data.alias
        }
        relt = await questionnaireApi.copyOtherQuestionnaire(params);
      }
    }
    // console.log('当前data', data.alias)
    relt = await this.createLiveQuestion(data);
    return relt;
  }

  /**
   * @description 创建直播间的问卷
   */
  createLiveQuestion(data) {
    const extension = JSON.parse(data.extension);
    const { watchInitData } = useRoomBaseServer().state;
    const { webinar, interact, join_info } = watchInitData;
    const params = {
      title: data.title,
      survey_id: data.id,
      description: data.description,
      img_url: data.imgUrl,
      playback_filling: extension.playback_filling,
      room_id: interact.room_id,
      webinar_id: webinar.id,
      user_id: join_info.user_id || join_info.third_party_user_id,
      privacy_agreement: extension.openPrivacy ? 1 : 0,
    }
    if (data.alias) {
      params.alias = data.alias
    }
    data.detail.forEach(i => {
      if (i.detail && i.detail.format == 'phone') {
        params.phone_verification_switch = i.verification == 'Y' ? 1 : 0
      }
    })
    return questionnaireApi.createLiveQuestion(params);
  }

  /**
   * 检查用户是否已提交文件
   */
  checkAnswerStatus(surveyId) {
    const { watchInitData } = useRoomBaseServer().state;
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
      if (!res?.data) return false
      const questionId = res?.data?.questionId;
      this.state.lastQuestionnaireId = questionId
      if (questionId) {
        !this.state.iconVisible && this.changeIconShowNum(true)
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

  /**
   * 获取活动最后一个问卷
   */
  getLastSurvey() {
    const { watchInitData, configList } = useRoomBaseServer().state;
    const { interact, switch: _switch, webinar } = watchInitData;
    let playback_filling = 0
    if (configList['ui.hide_chat_history'] == 1) { // 打开admin此配置不请求接口
      return Promise.resolve({})
    } else {
      if (webinar.type == 5) {
        playback_filling = 1 // 回放时取配置了回放填写的问卷
      }
    }
    return questionnaireApi.getLastSurvey({
      room_id: interact.room_id,
      playback_filling,
      start_time: _switch.start_time,
      end_time: _switch.end_time
    });
  }

  // 小红点
  setDotVisible(visivle) {
    this.state.dotVisible = visivle
  }

  //活动问卷历史列表
  getSurveyList() {
    const { watchInitData } = useRoomBaseServer().state;
    return questionnaireApi.getSurveyList({
      room_id: watchInitData.interact.room_id,
      webinar_id: watchInitData.webinar.id,
      switch_id: watchInitData.switch.switch_id
    }).then(res => {
      if (res.code == 200) {
        this.state.QuestionList = res.data
        return res.data
      }
    });
  }

  // 设置问卷别名
  setAlias(data) {
    this.state.alias = data
  }

  // change wap右侧展示icon数量
  changeIconShowNum(status) {
    useRoomBaseServer().setShowIconNum(status)
  }
}

export default function useQuestionnaireServer(opts) {
  if (!QuestionnaireServer.instance) {
    QuestionnaireServer.instance = new QuestionnaireServer(opts)
  }
  return QuestionnaireServer.instance
}
