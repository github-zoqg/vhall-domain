import VhallPaasSDK from '@/sdk/index.js';
import BaseServer from '@/domain/common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useMsgServer from '@/domain/common/msg.server.js';
import useUserServer from '@/domain/user/userServer.js';
import { textToEmojiText } from '@/utils/emoji';
import { player } from '../../request/index';
import { merge } from '../../utils';
import { getPlatform } from '@/utils/http';
class PlayerServer extends BaseServer {
  constructor(options) {
    // // 创建单例之外的额外的实例
    if (options.extra) {
      super();
      this.playerInstance = null; //播放器实例
      this.state = {
        isPlaying: false,
        markPoints: [],
        isBarrage: false,
        type: 'live', // live or vod
        voice: 60
      };
      return this;
    }

    if (typeof PlayerServer.instance === 'object') {
      return PlayerServer.instance;
    }
    super();
    this.playerInstance = null; //播放器实例
    this.state = {
      isPlaying: false,
      markPoints: [],
      isBarrage: false,
      type: 'live', // live or vod
      voice: 60,
      isSmallPlayer: false
    };

    PlayerServer.instance = this;
    return this;
  }
  //初始化播放器实例
  init(customOptions = {}) {
    const defaultOptions = this._getDefaultOptions();
    const options = merge.recursive({}, defaultOptions, customOptions);
    return new Promise(resolve => {
      VhallPlayer.createInstance(
        options,
        //创建播放器成功回调
        event => {
          console.log(options, '??wo自动播放参数')
          this.playerInstance = event.vhallplayer;
          this.state.markPoints = event.markPoints;
          this.openControls(false);
          this.openUI(false);

          this._addPlayerListeners();
          resolve(event);
        },
        //创建播放器失败成功回调
        e => {
          console.log(options, '???shibao失败')
          throw new Error(e.message);
        }
      );
    });
  }

  setType(type = 'live') {
    this.state.type = type;
  }

  play() {
    return this.playerInstance.play();
  }

  pause() {
    return this.playerInstance.pause();
  }

  //获取播放器状态
  getIsPause() {
    return this.playerInstance.getIsPause();
  }

  isPause() {
    return this.playerInstance.isPause();
  }

  getQualitys() {
    return this.playerInstance.getQualitys();
  }

  getCurrentQuality() {
    return this.playerInstance.getCurrentQuality();
  }

  setQuality(item) {
    return this.playerInstance.setQuality(item);
  }

  enterFullScreen(onFail = () => { }) {
    return this.playerInstance.enterFullScreen(onFail);
  }

  exitFullScreen(onFail = () => { }) {
    return this.playerInstance.exitFullScreen(onFail);
  }

  //播放器是否是全屏
  isFullscreen() {
    return this.playerInstance.isFullscreen()
  }

  //设置静音
  setMute(isMute, onFail = () => { }) {
    return this.playerInstance.setMute(isMute, onFail);
  }

  //获取音量
  getVolume() {
    return this.playerInstance.getVolume();
  }

  //获取当前网络状态
  getNetworkState() {
    return this.playerInstance.getNetworkState();
  }

  //视频截图
  videoScreenshot() {
    return this.playerInstance.videoScreenshot()
  }

  //设置音量
  setVolume(val, onFail = () => { }) {
    this.state.voice = val;
    return this.playerInstance.setVolume(val, onFail);
  }

  getDuration(onFail = () => { }) {
    return this.playerInstance.getDuration(onFail);
  }

  getCurrentTime(onFail = () => { }) {
    return this.playerInstance.getCurrentTime(onFail);
  }

  setCurrentTime(val, onFail = () => { }) {
    return this.playerInstance.setCurrentTime(val, onFail);
  }

  //设置seek限制
  setLimitSeek(opt, onFail = () => { }) {
    return this.playerInstance.setLimitSeek(opt, onFail);
  }

  //获取当前seek限制信息
  getLimitSeek(onFail = () => { }) {
    return this.playerInstance.getLimitSeek(onFail);
  }

  //设置循环状态
  setLoop(isLoop, onFail = () => { }) {
    return this.playerInstance.setLoop(isLoop, onFail);
  }

  //获取循环状态
  getLoop(onFail = () => { }) {
    return this.playerInstance.getLoop(onFail);
  }

  getUsableSpeed(onFail = () => { }) {
    return this.playerInstance.getUsableSpeed(onFail);
  }

  setPlaySpeed(val, onFail = () => { }) {
    return this.playerInstance.setPlaySpeed(val, onFail);
  }

  openControls(status) {
    return this.playerInstance.openControls(status);
  }

  openUI(status) {
    return this.playerInstance.openUI(status);
  }

  setResetVideo(val) {
    return this.playerInstance.setResetVideo(val);
  }

  setBarrageInfo(val) {
    return this.playerInstance.setBarrageInfo(val);
  }

  addBarrage(val, setting = {}, onFail = () => { }) {
    return this.playerInstance.addBarrage(val, setting, onFail);
  }

  toggleBarrage() {
    return this.playerInstance.toggleBarrage();
  }

  //开启弹幕显示
  openBarrage() {
    this.state.isBarrage = true;
    return this.playerInstance.openBarrage();
  }

  //关闭弹幕显示
  closeBarrage() {
    this.state.isBarrage = true;
    return this.playerInstance.closeBarrage();
  }

  //清除弹幕显示
  clearBarrage() {
    return this.playerInstance.clearBarrage();
  }

  toggleSubtitle() {
    return this.playerInstance.toggleSubtitle();
  }
  // 销毁实例
  destroy() {
    return this.playerInstance && this.playerInstance.destroy();
  }

  onPlayer(type, cb) {
    this.playerInstance.$on(type, cb);
  }

  emitPlayer(type, params) {
    this.playerInstance.$emit(type, params);
  }

  getPlayerConfig(params = {}) {
    return player.getPlayerConfig(params).then(res => {
      return res;
    });
  }
  // 播放器触发章节事件
  emitChapterTimeUpdate(time) {
    this.$emit('chapter_time_update', time);
  }
  // 播放器注册事件监听
  _addPlayerListeners() {
    const msgServer = useMsgServer();
    const roomBaseServer = useRoomBaseServer()
    const platform = getPlatform()
    if (platform != 18) {
      // 弹幕
      msgServer.$onMsg('CHAT', msg => {
        // msg.data.target_id: 不能是私聊，只有聊天输入的信息才是弹幕
        if (this.state.isBarrage && !msg.data.target_id) {
          // 表情转化为图片，非文字
          if (msg.data.type == 'text') {
            //表情处理
            this.addBarrage(textToEmojiText(msg.data.barrageTxt))
          }
        }
      });
    }
    // 结束直播
    msgServer.$onMsg('ROOM_MSG', msg => {
      // live_over 结束直播
      if (msg.data.type == 'live_over') {
        this.$emit('live_over', msg.data);
      }
      // 分组直播 没有结束讨论 直接结束直播
      if (msg.data.type == 'group_switch_end') {
        if (msg.data.over_type) {
          this.$emit('live_over', msg.data);
        }
      }
      // live_start:开始直播
      if (msg.data.type == 'live_start') {
        this.$emit('live_start', msg.data);
      }

      if (msg.data.type === 'pay_success') {
        this.$emit('pay_success', msg.data);
      }
    });

    // 单点登录逻辑
    roomBaseServer.$on('ROOM_SIGNLE_LOGIN', () => {
      setTimeout(() => {
        // 播放器销毁
        this.destroy()
      }, 2000)
    })

    // 视频加载完成
    this.playerInstance.on(VhallPlayer.LOADED, e => {
      this.$emit(VhallPlayer.LOADED, e);
    });

    // 播放时间改变时触发
    this.playerInstance.on(VhallPlayer.TIMEUPDATE, e => {
      this.$emit(VhallPlayer.TIMEUPDATE, e);
    });

    //自动播放失败
    this.playerInstance.on(VhallPlayer.AUTOPLAY_FAILED, e => {
      this.$emit(VhallPlayer.AUTOPLAY_FAILED, e);
    });

    // 开始播放时触发
    this.playerInstance.on(VhallPlayer.PLAY, e => {
      this.$emit(VhallPlayer.PLAY, e);
    });

    // 暂停时触发
    this.playerInstance.on(VhallPlayer.PAUSE, e => {
      this.$emit(VhallPlayer.PAUSE, e);
    });

    // 播放器出错
    this.playerInstance.on(VhallPlayer.ERROR, e => {
      this.$emit(VhallPlayer.ERROR, e);
    });

    // 视频播放完毕
    this.playerInstance.on(VhallPlayer.ENDED, e => {
      this.$emit(VhallPlayer.ENDED, e);
    });

    // 视频卡顿
    this.playerInstance.on(VhallPlayer.LAG_REPORT, e => {
      this.$emit(VhallPlayer.LAG_REPORT, e);
    });

    // 视频卡顿恢复时触发
    this.playerInstance.on(VhallPlayer.LAG_RECOVER, e => {
      this.$emit(VhallPlayer.LAG_RECOVER, e);
    });

    // 当前清晰度改变时触发
    this.playerInstance.on(VhallPlayer.DEFINITION_CHANGE, e => {
      this.$emit(VhallPlayer.DEFINITION_CHANGE, e);
    });

    //全屏状态改变
    this.playerInstance.on(VhallPlayer.FULLSCREEN_CHANGE, e => {
      this.$emit(VhallPlayer.FULLSCREEN_CHANGE, e);
    });

    // 当前时间改变，点播当前播放时间被改变时触发
    this.playerInstance.on(VhallPlayer.CURRENTTIME_CHANGE, e => {
      this.$emit(VhallPlayer.CURRENTTIME_CHANGE, e);
    });

    // 循环状态改变	点播循环状态被改变时触发
    this.playerInstance.on(VhallPlayer.LOOP_CHANGE, e => {
      this.$emit(VhallPlayer.LOOP_CHANGE, e);
    });

    // 静音状态改变	静音状态被改变时触发
    this.playerInstance.on(VhallPlayer.MUTE_CHANGE, e => {
      this.$emit(VhallPlayer.MUTE_CHANGE, e);
    });

    // 倍速改变	倍速被改变时触发
    this.playerInstance.on(VhallPlayer.RATE_CHANGE, e => {
      this.$emit(VhallPlayer.RATE_CHANGE, e);
    });

    // 声音改变	声音被改变时触发
    this.playerInstance.on(VhallPlayer.VOLUME_CHANGE, e => {
      this.$emit(VhallPlayer.VOLUME_CHANGE, e);
    });

    // 视频正在播放中
    this.playerInstance.on(VhallPlayer.PLAYING, e => {
      this.$emit(VhallPlayer.PLAYING, e);
    });

    // 视频加载中	点播视频加载中时触发
    this.playerInstance.on(VhallPlayer.PROGRESS, e => {
      this.$emit(VhallPlayer.PROGRESS, e);
    });

    // 视频元数据加载完成
    this.playerInstance.on(VhallPlayer.LOADEDMETADATA, e => {
      this.$emit(VhallPlayer.LOADEDMETADATA, e);
    });

    // 开启弹幕
    this.playerInstance.on(VhallPlayer.OPEN_BARRAGE, e => {
      this.$emit(VhallPlayer.OPEN_BARRAGE, e);
    });

    // 关闭弹幕
    this.playerInstance.on(VhallPlayer.CLOSE_BARRAGE, e => {
      this.$emit(VhallPlayer.CLOSE_BARRAGE, e);
    });

    // 清空弹幕
    this.playerInstance.on(VhallPlayer.CLEAR_BARRAGE, e => {
      this.$emit(VhallPlayer.CLEAR_BARRAGE, e);
    });

    // 开启字幕
    this.playerInstance.on(VhallPlayer.OPEN_SUBTITLE, e => {
      this.$emit(VhallPlayer.OPEN_SUBTITLE, e);
    });

    // 关闭字幕
    this.playerInstance.on(VhallPlayer.CLOSE_SUBTITLE, e => {
      this.$emit(VhallPlayer.CLOSE_SUBTITLE, e);
    });

    // 切换字幕文件
    this.playerInstance.on(VhallPlayer.SUBTITLE_CHANGED, e => {
      this.$emit(VhallPlayer.SUBTITLE_CHANGED, e);
    });

    // 开启直播字幕
    this.playerInstance.on(VhallPlayer.LIVESUBTITLE_OPENED, e => {
      this.$emit(VhallPlayer.LIVESUBTITLE_OPENED, e);
    });

    // 关闭直播字幕
    this.playerInstance.on(VhallPlayer.LIVESUBTITLE_CLOSED, e => {
      this.$emit(VhallPlayer.LIVESUBTITLE_CLOSED, e);
    });
  }

  //获取默认初始化参数
  _getDefaultOptions() {
    const { watchInitData, configList } = useRoomBaseServer().state;
    // 初始化参数
    const defaultOptions = {
      appId: watchInitData.interact.paas_app_id, // 互动应用ID，必填
      accountId: watchInitData.join_info.third_party_user_id, // 第三方用户ID，必填
      token: watchInitData.interact.paas_access_token || '', // access_token，必填
      poster: '',
      type: this.state.type,
      autoplay: false,
      forceMSE: false,
      subtitleOption: {
        enable: true
      },
      // 强制卡顿切线
      thornOption: {
        enable: true
      },
      barrageSetting: {
        positionRange: [0, 1],
        speed: 15000,
        style: {
          fontSize: 16
        }
      },
      peer5Option: {
        open: configList['ui.browser_peer5'] == '1',
        customerId: 'ds6mupmtq5gnwa4qmtqf',
        fallback: true
      },
      marqueeOption: {
        text: '',
        enable: false
      },
      watermarkOption: {
        enable: false
      },
      liveOption: {
        defaultDefinition: ''
      },
      // pursueOption: {
      //   enable: false, // 默认 false
      //   mode: 'seek' // 追播模式 pursue：追播，seek：跳转。默认 pursue
      // }
    };
    if (!(watchInitData.rebroadcast && watchInitData.rebroadcast.id)) {
      // 播放器上报增加字段
      let reportExtra = watchInitData.report_data?.report_extra
      try {
        reportExtra = JSON.parse(watchInitData.report_data?.report_extra) || {};
        reportExtra.visitor_id = watchInitData.visitor_id;
        if (watchInitData?.join_info?.user_id !== 0) {
          reportExtra.user_id = watchInitData.join_info.user_id;
          const userServer = new useUserServer();
          if (userServer.state?.userInfo?.union_id) {
            reportExtra.sso_union_id = userServer.state?.userInfo?.union_id;
          }
        }
        reportExtra = JSON.stringify(reportExtra)
      } catch (e) {
        console.warn('播放器数据上报参数:', e);
      }
      defaultOptions.otherOption = {
        vid: watchInitData.report_data.vid, // hostId
        vfid: watchInitData.report_data.vfid,
        guid: watchInitData.report_data.guid,
        biz_id: watchInitData.webinar.id,
        report_extra: reportExtra
      }
    }
    return defaultOptions;
  }
  // 设置播放器大小
  setPlayerSize(data) {
    this.state.isSmallPlayer = data;
  }
}

export default function usePlayerServer(options = { extra: false }) {
  return new PlayerServer(options);
}
