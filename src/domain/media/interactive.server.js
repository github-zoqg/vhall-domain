import { roomApi } from '../../request';
import { merge, sleep } from '../../utils';
import BaseServer from '../common/base.server';
import useRoomBaseServer from '../room/roombase.server';
import useGroupServer from '../group/StandardGroupServer';
import useMediaCheckServer from './mediaCheck.server';
import useMsgServer from '../common/msg.server';
import VhallPaasSDK from '@/sdk/index';
import useMicServer from './mic.server';
import interactive from '@/request/interactive';
import useMediaSettingServer from './mediaSetting.server';
import useInsertFileServer from './insertFile.server';
import useVideoPollingServer from './videoPolling.server';
import * as statusBase from '../common/status.base';
import * as statusConst from '../common/status.const';
import { report_interactive_stream_mute } from '@/utils/report'
class InteractiveServer extends BaseServer {
  constructor() {
    super();
    if (typeof InteractiveServer.instance === 'object') {
      return InteractiveServer.instance;
    }
    this.interactiveInstance = null; // 互动实例
    this.interactiveInstanceOptions = null; // 当前互动实例的参数
    this.state = {
      isInstanceInit: false, // 互动实例是否初始化完成
      localStream: {
        streamId: null, // 本地流id
        // videoMuted: false,
        // audioMuted: false,
        // attributes: {}
      },
      // remoteStreams: [], // 远端流数组
      streamListHeightInWatch: 0, // PC观看端流列表高度
      fullScreenType: false, // wap 全屏状态
      defaultStreamBg: false, //开始推流到成功期间展示默认图
      showPlayIcon: false, // 展示播放按钮
      isGroupDiscuss: false, // 分组是否继续讨论
      mainStreamId: null, // 当前主屏的流id
      mobileOnWheat: false, // V7.1.2版本需求，将wap的自动上麦操作移至platform层
      mediaPermissionDenied: false, // V7.1.2版本需求   分组活动+开启自动上麦，pc端观众，默认自动上麦
      initInteractiveFailed: false, // 初始化互动是否失败
      initRole: null, // 初始化互动的角色*
    };
    this.EVENT_TYPE = {
      INTERACTIVE_INSTANCE_INIT_SUCCESS: 'INTERACTIVE_INSTANCE_INIT_SUCCESS', // 互动初始化成功事件
      PROCEED_DISCUSSION: 'PROCEED_DISCUSSION' // 分组初始化继续讨论事件
    }

    this.abortStreams = []  // 自动播放失败的订阅流
    this.currentStreams = [] // 多次初始化sdk的时候 getRoomStreams 获取的流信息不准，初始化获取流一currentStreams
    InteractiveServer.instance = this;
    return this;
  }

  // 设置本地日志打印等级
  static setLogLevel(opt) {
    return VhallPaasSDK.modules.VhallRTC.setLogLevel(opt);
  }

  /**
   * 初始化互动实例
   * @param {Object} customOptions
   * @returns {Promise}
   */
  async init(customOptions = {}) {

    // 是否需要初始化互动
    const isNeedInit = await this._isNeedInteractive(customOptions);
    if (!isNeedInit) return Promise.resolve();
    // 这里判断上麦角色以及是否自动上麦
    const defaultOptions = await this._getDefaultOptions(customOptions);
    const options = merge.recursive({}, defaultOptions, customOptions);

    // 根据roomId和role判断是否需要销毁实例重新初始化
    const result = await this._isNeedReInit(options);
    if (!result) return Promise.resolve();

    // 更新互动实例参数
    this.interactiveInstanceOptions = options;

    console.log('%cVHALL-DOMAIN-互动初始化参数', 'color:blue', options, this.state.isGroupDiscuss);

    const { watchInitData } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state;
    const isGroupLeader = groupInitData.isInGroup && watchInitData.join_info.third_party_user_id == groupInitData.doc_permission

    return new Promise((resolve, reject) => {
      this.createInteractiveInstance(
        options,
        event => {
          this.state.initRole = options.role
          let streams = event.currentStreams.filter(stream => {
            try {
              if (stream.attributes && typeof stream.attributes == 'string') {
                stream.attributes = JSON.parse(stream.attributes);
              }
            } catch (error) {
            }
            // 不直接使用vhallrtc.getRoomStreams()是因为有时候初始化完(非刷新页面下)此值取值有问题
            let _muteObj = event.vhallrtc.getRoomStreams().find(s => s.streamId == stream.streamId)
            if (_muteObj) {
              stream.audioMuted = _muteObj.audioMuted
              stream.videoMuted = _muteObj.videoMuted
            }
            return stream;
          });

          // 拷贝streams
          this.currentStreams = [...streams]

          streams = streams.filter(stream => stream.streamType <= 2)
          console.log('[interactiveServer] streams----', streams)
          streams.forEach(stream => {

            useMicServer().updateSpeakerByAccountId(stream.accountId, stream)
          })
          if (this.state.isGroupDiscuss) {
            this.$emit(this.EVENT_TYPE.PROCEED_DISCUSSION)
          }
          this.$emit(this.EVENT_TYPE.INTERACTIVE_INSTANCE_INIT_SUCCESS);
          // 主持人或组长，设置旁路背景图
          if (watchInitData.join_info.role_name == 1 || isGroupLeader) {
            this.setBroadBackgroundImage()
          }
          resolve(event);
        },
        error => {
          this.state.initRole = null
          this.state.initInteractiveFailed = true
          reject(error);
        }
      );
    });
  }

  /**
   * 创建互动实例
   * @param {Object} options 创建实例的参数
   * @param {Function} success 创建成功的回调函数
   * @param {Function} fail 创建失败的回调函数
   * @returns
   */
  createInteractiveInstance(options, success, fail) {
    return VhallPaasSDK.modules.VhallRTC.createInstance(
      options,
      event => {
        // 互动实例
        this.interactiveInstance = event.vhallrtc;
        // 是否有互动实例置为true
        this.state.isInstanceInit = true
        console.log('%c[interactive server] 初始化互动实例完成', 'color:#0000FF', event)

        this._addListeners();
        success && success(event)
      }),
      error => { fail && fail(error) }
  }


  /**
   * 判断是否需要初始化互动实例
   */
  async _isNeedInteractive(options) {
    const { watchInitData } = useRoomBaseServer().state;
    const { isSpeakOn } = useMicServer().state;
    // 0. 观众，浏览器不支持SDK 不初始化互动，直接走旁路
    // 1. 非观众需要初始化互动
    // 2. 无延迟模式需要初始化互动（互动无延迟、分组）
    // 3. 普通互动上麦需要初始化互动

    if (watchInitData.join_info.role_name == 2 && (watchInitData.webinar.no_delay_webinar == 1 || [3, 6].includes(watchInitData.webinar.mode)) && !options?.videoPolling) {
      const res = await useMediaCheckServer().checkSystemRequirements()
      const supperSdk = res?.result || false;
      console.log('是否支持SDK', supperSdk)
      if (!supperSdk) {
        this.state.initInteractiveFailed = true
        return supperSdk
      } else {
        this.state.initInteractiveFailed = false
      }
    }

    // 助理条件较多，单独判断
    if (watchInitData.join_info.role_name == 3) {
      //start_type  1-web（默认）， 2-app，3-sdk，4-推拉流，5-定时，6-admin后台， 7-第三方OpenApi，8-windows客户端    0是未开播
      if ([2, 8].includes(+watchInitData.switch.start_type)) {
        // 客户端、APP 助理默认都是旁路流  -- 和产品确认
        if (watchInitData.webinar.no_delay_webinar == 1) {
          // 若是无延迟活动，则订阅
          return true
        }
        return false
      } else if (+watchInitData.switch.start_type == 4) {
        // 网页第三方  全是旁路，不初始化互动
        return false
      } else {
        return true
      }
    } else {
      return (
        watchInitData.join_info.role_name != 2 ||
        watchInitData.webinar.no_delay_webinar == 1 ||
        watchInitData.webinar.mode == 6 ||
        isSpeakOn || options?.videoPolling
      );
    }
  }

  /**
   * 获取默认初始化参数
   */
  async _getDefaultOptions(options) {
    const { watchInitData, interactToolStatus, skinInfo } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state;

    // 如果是在小组中，取小组中的互动id和房间id初始化互动实例
    const roomId = groupInitData.isInGroup
      ? groupInitData.group_room_id
      : watchInitData.interact.room_id;
    const inavId = groupInitData.isInGroup ? groupInitData.inav_id : watchInitData.interact.inav_id;
    const token = groupInitData.isInGroup
      ? groupInitData.access_token
      : watchInitData.interact.paas_access_token;

    // 获取互动实例角色
    const role = await this._getInteractiveRole(options);

    const isGroupLeader = groupInitData.isInGroup && watchInitData.join_info.third_party_user_id == groupInitData.doc_permission
    const defaultOptions = {
      appId: watchInitData.interact.paas_app_id, // 互动应用ID，必填
      inavId, // 互动房间ID，必填
      roomId, // 如需开启旁路，必填。
      accountId: watchInitData.join_info.third_party_user_id, // 第三方用户ID，必填
      token, // access_token，必填
      mode:
        watchInitData.webinar.no_delay_webinar == 1
          ? VhallPaasSDK.modules.VhallRTC.MODE_LIVE
          : VhallPaasSDK.modules.VhallRTC.MODE_RTC, //应用场景模式，选填，可选值参考下文【应用场景类型】。支持版本：2.3.1及以上。
      role, //用户角色，选填，可选值参考下文【互动参会角色】。当mode为rtc模式时，不需要配置role。支持版本：2.3.1及以上。
      attributes: '', // String 类型
      autoStartBroadcast: watchInitData.join_info.role_name == 1 || isGroupLeader, // 是否开启自动旁路 Boolean 类型   主持人默认开启true v2.3.5版本以上可用
      broadcastConfig:
        watchInitData.join_info.role_name == 1 || isGroupLeader
          ? {
            adaptiveLayoutMode:
              VhallPaasSDK.modules.VhallRTC[useMediaSettingServer().state.layout] ||
              VhallRTC[sessionStorage.getItem('layout')] ||
              VhallPaasSDK.modules.VhallRTC.CANVAS_ADAPTIVE_LAYOUT_TILED_MODE, // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
            profile: VhallPaasSDK.modules.VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1, // 旁路直播视频质量参数
            paneAspectRatio: VhallPaasSDK.modules.VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9, //旁路混流窗格指定高宽比。  v2.3.2及以上
            precastPic: false, // 选填，当旁路布局模板未填满时，剩余的窗格默认会填充系统默认小人图标。可配置是否显示此图标。
            border: {
              // 旁路边框属性
              width: 2,
              color: '0x1a1a1a'
            }
          }
          : {}, // 自动旁路   开启旁路直播方法所需参数
      otherOption: watchInitData.report_data
    };
    // 设置旁路背景颜色
    let skinJsonPc = {}
    if (skinInfo?.skin_json_pc && skinInfo.skin_json_pc != 'null') {
      skinJsonPc = JSON.parse(skinInfo.skin_json_pc);
    }

    if ((watchInitData.join_info.role_name == 1 || interactToolStatus.doc_permission == watchInitData.join_info.third_party_user_id) && interactToolStatus?.videoBackGroundMap?.videoBackGroundColor) {
      let color = interactToolStatus.videoBackGroundMap.videoBackGroundColor.replace('#', '0x');
      defaultOptions.broadcastConfig.backgroundColor = color;
      defaultOptions.broadcastConfig.border.color = color;
    } else if (isGroupLeader && skinJsonPc?.videoBackGroundColor) {
      let color = skinJsonPc?.videoBackGroundColor.replace('#', '0x');
      defaultOptions.broadcastConfig.backgroundColor = color;
      defaultOptions.broadcastConfig.border.color = color;
    }
    console.log('初始化互动options', defaultOptions)
    return defaultOptions;
  }

  /**
   * 获取初始化互动sdk实例的角色
   * @returns {String}}
   */
  async _getInteractiveRole(opts) {
    const { watchInitData, interactToolStatus } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state
    const micServer = useMicServer()


    // 如果在麦上，设为 HOST
    this.state.isGroupDiscuss = false
    if (micServer.getSpeakerStatus() || opts.videoPolling) {
      if (useMediaCheckServer().state.deviceInfo.device_status === 2 && !opts.videoPolling) {
        // 若设备为2   不允许则直接下麦
        await micServer.speakOff()
      } else {
        console.log('继续讨论的状态', opts?.isSwitchStart)
        if (opts.hasOwnProperty('isSwitchStart') && !opts.isSwitchStart && micServer.getSpeakerStatus()) {
          this.state.isGroupDiscuss = true
        } else {
          this.state.isGroupDiscuss = false
        }
      }
      if (useMediaCheckServer().state.deviceInfo.device_status == 0 && !opts.videoPolling) {
        let _flag = await useMediaCheckServer().getMediaInputPermission({ isNeedBroadcast: false })
        if (!_flag) {
          await useMicServer().speakOff()
        }
      }
      return VhallPaasSDK.modules.VhallRTC.ROLE_HOST;
    }

    // 如果不是无延迟直播，不需要设置role，默认设为 AUDIENCE
    if (watchInitData.webinar.no_delay_webinar == 0) {
      return VhallPaasSDK.modules.VhallRTC.ROLE_AUDIENCE;
    }

    // 自动上麦 + 未开启禁言 + 未开启全体禁言 + 不是因为被下麦或者手动下麦去初始化互动
    // 被下麦或者手动下麦 会在 disconnect_success 里去调用init方法
    const banned = groupInitData.isInGroup ? (groupInitData.is_banned == 1 ? true : false) : (interactToolStatus.is_banned == 1 ? true : false); //1禁言 0取消禁言
    const allBanned = interactToolStatus.all_banned == 1 ? true : false;
    console.table([
      { name: 'device_status', val: useMediaCheckServer().state.deviceInfo.device_status },
      { name: 'auto_speak', val: interactToolStatus.auto_speak },
      { name: 'isInGroup', val: groupInitData.isInGroup },
      { name: 'is_banned', val: banned },
      { name: 'isSpeakOffToInit', val: micServer.state.isSpeakOffToInit },
      { name: 'role_name', val: watchInitData.join_info.role_name },
      { name: 'chatServer_banned', val: banned },
      { name: 'chatServer_allBanned', val: allBanned }])

    let autoSpeak = false

    // 记录状态，初始化互动时为false,调用speakOn成功后 设置为true
    this.state.autoSpeak = false
    let device_status = useMediaCheckServer().state.deviceInfo.device_status
    if ((+device_status != 2)) {
      if (interactToolStatus.auto_speak == 1) {
        if (groupInitData.isInGroup) {
          autoSpeak =
            !banned &&
            !micServer.state.isSpeakOffToInit &&
            watchInitData.join_info.role_name != 3
        } else {
          autoSpeak =
            !banned &&
            !allBanned &&
            !micServer.state.isSpeakOffToInit &&
            watchInitData.join_info.role_name != 3
        }
        console.log('[interactive server] auto_speak 1', autoSpeak)
      } else {
        // 不自动上麦时，如果为组长，需要自动上麦
        autoSpeak =
          groupInitData.isInGroup && groupInitData.doc_permission == watchInitData.join_info.third_party_user_id
        console.log('[interactive server] auto_speak 0', autoSpeak)
      }

      // 主持人 + 当前主讲师是主持人 + 不在小组内 不受autospeak影响    fix: 助理解散小组后，主持人回到主直播间受autospeak影响不上麦及推流问题   无需判断是否为分组活动,原因如下： 若是无延迟活动，设备禁用会让下麦，这时候刷新应能自动上麦的
      if (!autoSpeak && watchInitData.join_info.role_name == 1 && interactToolStatus.doc_permission == watchInitData.join_info.third_party_user_id && !groupInitData.isInGroup) {
        autoSpeak = true
      }
    }


    if (autoSpeak) {
      // 获取当前最大上麦人数currentMaxOnMicNums 和 当前的在麦人数currentOnMicNums    在麦人数>=最大上麦人数，则不再调用上麦接口
      let currentMaxOnMicNums = watchInitData.webinar?.inav_num || 1
      let currentOnMicNums = 0
      groupInitData.isInGroup ? currentOnMicNums = groupInitData.speaker_list?.length : currentOnMicNums = interactToolStatus.speaker_list?.length
      console.log(`[interactiveServer]----currentOnMicNums: ${currentOnMicNums}---currentMaxOnMicNums: ${currentMaxOnMicNums}`)
      if (currentOnMicNums >= currentMaxOnMicNums) {
        if (watchInitData.join_info.role_name != 2) {
          return VhallPaasSDK.modules.VhallRTC.ROLE_HOST;
        }
        return VhallPaasSDK.modules.VhallRTC.ROLE_AUDIENCE
      }

      // 依据V7.1.2需求   分组活动 + pc端 + 观众 + 未超出最大上麦人数 => 获取设备权限
      if (watchInitData.webinar.mode == 6 && !useMsgServer().isMobileDevice() && watchInitData.join_info.role_name == 2) {
        let _flag = await useMediaCheckServer().getMediaInputPermission({ isNeedBroadcast: false })
        if (!_flag) {
          this.state.mediaPermissionDenied = true
          return VhallPaasSDK.modules.VhallRTC.ROLE_AUDIENCE
        }
      }

      // 依据V7.1.2需求   将wap的分组活动自动上麦逻辑移至platform侧    分组活动 + wap + 自动上麦 + 观众 + 未超出最大上麦人数
      if (watchInitData.webinar.mode == 6 && useMsgServer().isMobileDevice() && watchInitData.join_info.role_name == 2) {
        this.state.mobileOnWheat = true // platform侧依据此进行加载初始化互动实例并上麦
        // 此处增加device_status 原因：分组直播中，切换wap观众小组，若是设备可用的时候，还是需要调用上麦接口的
        if (device_status != 1) {
          return VhallPaasSDK.modules.VhallRTC.ROLE_AUDIENCE
        }
      }
      // 调上麦接口判断当前人是否可以上麦
      const res = await micServer.userSpeakOn();
      console.log('[interactiveServer]----上麦接口响应', res)
      // 如果上麦成功，设为 HOST
      if (res.code == 200) {

        // 记录状态，在收到 vrtc_connect_success 消息后不再次初始化互动
        // 收到消息执行可能比 收到响应赋值 autoSpeak为true快，造成初始化2次互动，需要在收到消息执行时，延迟执行
        this.state.autoSpeak = true

        return VhallPaasSDK.modules.VhallRTC.ROLE_HOST;
      }
    } else {
      micServer.setSpeakOffToInit(false)
    }

    // 如果是主持人、嘉宾、助理，设为 HOST
    if (watchInitData.join_info.role_name != 2) {
      return VhallPaasSDK.modules.VhallRTC.ROLE_HOST;
    }

    // 如果是无延迟直播、不在麦、未开启自动上麦，设为 AUDIENCE
    return VhallPaasSDK.modules.VhallRTC.ROLE_AUDIENCE;
  }

  // 是否需要重新初始化互动实例
  async _isNeedReInit(options) {
    // 1. 如果当前不存在互动实例，需要重新初始化互动sdk
    // 2. 如果是房间id发生了变化，需要重新初始化互动sdk
    // 3. 如果是角色发生了变化，需要重新初始化互动sdk
    // 4. 如果销毁互动sdk失败，return false
    // 5. 嘉宾不重新初始化实例
    if (!this.interactiveInstance) {
      return true;
    }

    const { watchInitData: { join_info: { role_name } } } = useRoomBaseServer().state;
    if (role_name == 4) {
      return false;
    }

    if (
      options.roomId !== this.interactiveInstanceOptions.roomId ||
      options.role !== this.interactiveInstanceOptions.role
    ) {
      const err = await this.destroy();
      return !err;
    }
  }

  /**
   * 销毁实例
   * @returns {Promise}}
   */
  destroy() {
    if (!this.interactiveInstance) {
      return Promise.reject('互动实例不存在')
    }
    return this.interactiveInstance
      .destroyInstance()
      .then(() => {
        this.interactiveInstance = null;
        // 是否有互动实例置为true
        this.state.isInstanceInit = false;
        /**
         * 非无延迟互动直播，观众端销毁实例前，派发EVENT_INSTANCE_DESTROY事件（兼容SDK升级2.3.11 移除window.vhallrtc.destroyInstance() 派发EVENT_REMOTESTREAM_REMOVED事件）
         */
        this.$emit('EVENT_INSTANCE_DESTROY')
        // 在这清空所有streamId会导致出现网络异常占位图
        useMicServer().removeAllApeakerStreamId()
        this._clearLocalStream()
        this.abortStreams = []
      }).then(() => {
        console.log('[interactiveServer]----互动sdk销毁成功');

      })
      .catch(err => {
        console.log('[interactiveServer]----互动sdk销毁失败', err);
        return Promise.reject(err);
      });
  }

  /**
   * 注册事件监听
   */
  _addListeners() {
    // -------------------------互动sdk内部消息--------------------------------------------
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_JOIN, e => {
      // 用户加入房间事件
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_JOIN, e);
    });

    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_LEAVE, e => {
      // 用户离开房间事件
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_LEAVE, e);
    });

    // 远端流加入事件
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_ADD, e => {
      // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
      try {
        e.data.attributes = e.data.attributes && typeof e.data.attributes === 'string' ? JSON.parse(e.data.attributes) : e.data.attributes;
      } catch (error) {
        console.log('error', error)
      }

      // if (this.state.remoteStreams.find(s => s.streamId == e.data.streamId)) {
      //   return
      // }
      try {
        if (this.state.localStream.streamId) {
          console.log('远端流加入事件，调整分辨率-t', this.getVideoProfile())
          this.setVideoProfile({
            streamId: this.state.localStream.streamId, profile: VhallRTC[this.getVideoProfile()]
          })
        }
      } catch (error) {
        console.log('远端流加入事件，调整分辨率', error)
      }
      if (e.data.streamType === 2) {
        let params = {
          streamId: e.data.streamId,
          audioMuted: e.data.stream.initMuted.audio,
          videoMuted: e.data.stream.initMuted.video,
          attributes: e.data.attributes
        }
        useMicServer().updateSpeakerByAccountId(e.data.accountId, params)

        // const remoteStream = {
        //   ...e.data,
        //   audioMuted: e.data.stream.initMuted.audio,
        //   videoMuted: e.data.stream.initMuted.video
        // };
        // this.state.remoteStreams.push(remoteStream);
      }
      console.log('[interactiveServer]--------流加入事件----', e);

      this.$emit('EVENT_REMOTESTREAM_ADD', e);
    });

    // 远端流离开事件,自己的流删除事件收不到
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_REMOVED, async e => {
      console.log('[interactiveServer]--------流退出事件----', e);

      try {
        if (this.state.localStream.streamId) {
          console.log('远端流离开事件，调整分辨率-t', this.getVideoProfile())
          this.setVideoProfile({
            streamId: this.state.localStream.streamId, profile: VhallRTC[this.getVideoProfile()]
          })
        }
      } catch (error) {
        console.log('远端流离开事件，调整分辨率', error)
      }

      if (e.data.streamType === 2) {
        let params = {
          streamId: '',
        }
        // let res = await this.unSubscribeStream(e.data.streamId)
        useMicServer().updateSpeakerByAccountId(e.data.accountId, params)
      }
      this.$emit('EVENT_REMOTESTREAM_REMOVED', e);
    });

    const msgServer = useMsgServer();
    const { watchInitData } = useRoomBaseServer().state;
    const third_party_user_id = watchInitData?.join_info?.third_party_user_id;
    // 房间信令异常断开事件
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_ROOM_EXCDISCONNECTED, e => {
      this.$emit('EVENT_ROOM_EXCDISCONNECTED', e);
    });

    // 远端流音视频状态改变事件
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_MUTE, e => {
      console.log('[interactiveServer]-------远端流音视频状态改变事件----', e);
      report_interactive_stream_mute({
        event: e,
        speakerList: useMicServer()?.state?.speakerList && JSON.stringify(useMicServer().state.speakerList)
      })
      let params = {
        audioMuted: e.data.muteStream.audio,
        videoMuted: e.data.muteStream.video
      }
      useMicServer().updateSpeakerByStreamId(e.data.streamId, params)


      this.$emit('EVENT_REMOTESTREAM_MUTE', e);
    });
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_REMOTESTREAM_FAILED, e => {
      // 本地推流或订阅远端流异常断开事件
      console.log('[interactiveServer]-------流异常事件----', e);


      if (e.data.streamType === 2) {
        let params = {
          streamId: '',
        }
        // let res = await this.unSubscribeStream(e.data.streamId)
        useMicServer().updateSpeakerByAccountId(e.data.accountId, params)
      }
      this.$emit('EVENT_REMOTESTREAM_FAILED', e);
    });

    // 本地流采集停止事件(处理拔出设备和桌面共享停止时)
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_END, async e => {
      console.log('[interactiveServer]-------本地流断开----', third_party_user_id, e);
      if (e.data?.streamType != 3 && third_party_user_id === e.data?.accountId) {
        // 非桌面共享时设置设ti备不可用  / 若在麦上，下麦( 线上逻辑 )
        await useMediaCheckServer().setDevice({ status: 2, send_msg: 1 }); //send_msg： 传 0 不会发消息，不传或传 1 会发这个消息
        // 2:视频直播，无下麦操作
        if (watchInitData.webinar.mode != 2) {
          useMicServer().speakOff()
        }
      }
      this.$emit('EVENT_STREAM_END', e);
    });

    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_STUNK, e => {
      // 本地流视频发送帧率异常事件
      console.log('EVENT_STREAM_STUNK_MSG', e)
      this.$emit('EVENT_STREAM_STUNK', e);
      // this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_STUNK, e);
    });
    // 摄像头设备变更事件
    /**
     * this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_CAMERA_CHANGED, e => {
      const selectedVideoDeviceId = sessionStorage.getItem('selectedVideoDeviceId')
      if (e.data?.changeInfo) {
        let i = e.data.changeInfo.findIndex(el => {
          return el.deviceId === selectedVideoDeviceId
        })
        console.log('EVENT_CAMERA_CHANGED', i, selectedVideoDeviceId, e)
        if (i != -1) {
          // video
          this.$emit('media_device_change', e);
        }
      }
    });

    // 麦克风设备变更事件
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_MICROPHONE_CHANGED, e => {
      const selectedAudioDeviceId = sessionStorage.getItem('selectedAudioDeviceId')
      if (e.data?.changeInfo) {
        let i = e.data.changeInfo.findIndex(el => {
          return el.deviceId === selectedAudioDeviceId
        })
        console.log('EVENT_MICROPHONE_CHANGED', i, selectedAudioDeviceId, e)
        if (i != -1) {
          this.$emit('media_device_change', e);
        }
      }
    });
    */
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_DEVICE_CHANGE, e => {
      // 新增设备或移除设备时触发
      this.$emit(VhallPaasSDK.modules.VhallRTC.EVENT_DEVICE_CHANGE, e);
    });
    this.interactiveInstance.on(VhallPaasSDK.modules.VhallRTC.EVENT_STREAM_PLAYABORT, e => {
      // 订阅流--  自动播放失败
      this.abortStreams.push(e.data)
      console.log('[interactiveServer]-----自动播放失败---------', e)
      this.$emit('EVENT_STREAM_PLAYABORT', e);
    });

    // 主讲人切换，调整分辨率
    useRoomBaseServer().$on('VRTC_SPEAKER_SWITCH', async (msg) => {
      if (this.state.localStream.streamId) {
        console.log('主讲人切换，调整分辨率', msg, this.getVideoProfile())
        this.setVideoProfile({
          streamId: this.state.localStream.streamId, profile: VhallRTC[this.getVideoProfile()]
        })
      }
    })
    // -------------------------房间业务消息--------------------------------------------


    msgServer.$onMsg('ROOM_MSG', msg => {
      const { speakerList } = useMicServer().state
      const localSpeaker = speakerList.find(speaker => speaker.accountId == third_party_user_id)
      if (localSpeaker) {
        if (
          msg.data.type == 'vrtc_frames_forbid' && // 业务关闭摄像头消息
          msg.data.target_id == localSpeaker.accountId
        ) {
          // 本地流关闭视频
          this.muteVideo({
            streamId: localSpeaker.streamId,
            isMute: true
          });
          // 业务消息不需要透传到ui层,ui层通过远端流音视频状态改变事件更新ui状态
          this.$emit('vrtc_frames_forbid', msg)
        } else if (
          msg.data.type == 'vrtc_frames_display' && // 业务开启摄像头消息
          msg.data.target_id == localSpeaker.accountId
        ) {
          // 本地流开启视频
          this.muteVideo({
            streamId: localSpeaker.streamId,
            isMute: false
          });
          this.$emit('vrtc_frames_display', msg);
        } else if (
          msg.data.type == 'vrtc_mute' && // 业务关闭麦克风消息
          msg.data.target_id == localSpeaker.accountId
        ) {
          // 本地流关闭音频
          this.muteAudio({
            streamId: localSpeaker.streamId,
            isMute: true
          });
          this.$emit('vrtc_mute', msg);
        } else if (
          msg.data.type == 'vrtc_mute_cancel' && // 业务开启麦克风消息
          msg.data.target_id == localSpeaker.accountId
        ) {
          // 本地流开启音频
          this.muteAudio({
            streamId: localSpeaker.streamId,
            isMute: false
          });
          this.$emit('vrtc_mute_cancel', msg);
        }
      }
      if (msg.data.type === 'vrtc_big_screen_set' &&  // 设置主画面
        this.state.localStream.streamId) {
        console.log('设置主画面-调整分辨率', msg, this.getVideoProfile())
        this.setVideoProfile({
          streamId: this.state.localStream.streamId, profile: VhallRTC[this.getVideoProfile()]
        })
      }
      if (msg.data.type === 'live_over') {
        // 直播结束
        this.setStreamListHeightInWatch(0);
        this.$emit('live_over')
      }
    });
  }

  /**
   * 创建本地流
   * @param {Object} options
   * @return {Promise} - 创建成功后的 promise
   */
  createLocalStream(options = {}) {
    return this.interactiveInstance
      .createStream(options)
      .catch(err => {
        console.error('[interactiveServer] 查看创建流失败', err)
        if (err?.data?.error?.msg?.message === 'Permission denied') {
          err.name = 'NotAllowed'
          return Promise.reject(err);
        }
        if (err?.name && (err.name == 'NotReadableError' || err.name == 'SecurityError' || err.name == 'NotAllowedError')) {
          err.name = 'NotAllowed'
          return Promise.reject(err)
        }
        // 创建失败重试三次
        if (InteractiveServer._createLocalStreamRetryCount >= 3) {
          InteractiveServer._createLocalStreamRetryCount = 0;
          return Promise.reject(err);
        }
        InteractiveServer._createLocalStreamRetryCount
          ? InteractiveServer._createLocalStreamRetryCount++
          : (InteractiveServer._createLocalStreamRetryCount = 1);
        return this.createLocalStream(options);
      });
  }

  /**
   * 创建摄像头视频流
   * @param {Object} options
   * @return {Promise}
   */
  createLocalVideoStream(options = {}) {
    const {
      watchInitData,
      interactToolStatus,
      isWebinarMode,
      attributes,
      roleName
    } = statusBase.getBaseInfo();

    let defaultOptions = {
      videoNode: options.videoNode, // 必填，传入本地视频显示容器ID
      audio: true, // 选填，是否采集音频设备，默认为true
      video: !isWebinarMode, // 选填，是否采集视频设备，默认为true
      audioDevice: options.audioDevice || sessionStorage.getItem('selectedAudioDeviceId'), // 选填，指定的音频设备id，默认为系统缺省
      videoDevice: !isWebinarMode
        ? options.videoDevice || sessionStorage.getItem('selectedVideoDeviceId')
        : null, // 选填，指定的视频设备id，默认为系统缺省
      profile:
        VhallRTC[this.getVideoProfile()] ||
        VhallRTC[options.profile] ||
        VhallRTC[interactToolStatus.definition] ||
        VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
      streamType: statusConst.STREAM_TYPE_VOICE_VIDEO, //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享，5为视频轮巡。
      attributes: JSON.stringify({
        ...attributes,
        role: roleName // app端字段不统一，过渡方案，待字段统一后可删除
      }) //选填，自定义信息，支持字符串类型
    };

    // 如果当前用户在上麦列表中，mute 状态需要从上麦列表中获取，否则默认开启
    const speakerValue = statusBase.getSpeakerValue();
    if (speakerValue) {
      defaultOptions.mute = { ...speakerValue };
    }

    // 音频直播静音video
    if (isWebinarMode) {
      defaultOptions.mute && (defaultOptions.mute.video = true);
      !defaultOptions.mute && (defaultOptions.mute = { video: true });
    }

    // 处理插播中的麦克风状态
    defaultOptions = this.handleInsertFileMicStatus(defaultOptions)

    const params = merge.recursive({}, defaultOptions, options);

    return this.createLocalStream(params).then(data => {
      this.updateSpeakerByAccountId(data, defaultOptions, watchInitData)
      return data
    }).catch(e => {
      return Promise.reject(e)
    })
  }

  /**
   * 创建视频轮巡视频流
   * @param {Object} options
   * @return {Promise}
   */
  createVideoPollingStream(options = {}) {
    const {
      interactToolStatus,
      isWebinarMode,
      attributes,
      roleName
    } = statusBase.getBaseInfo();

    let defaultOptions = {
      videoNode: options.videoNode, // 必填，传入本地视频显示容器ID
      audio: false, // 选填，是否采集音频设备，默认为true
      video: !isWebinarMode, // 选填，是否采集视频设备，默认为true
      // audioDevice: options.audioDevice || sessionStorage.getItem('selectedAudioDeviceId'), // 选填，指定的音频设备id，默认为系统缺省
      videoDevice: !isWebinarMode
        ? options.videoDevice || sessionStorage.getItem('selectedVideoDeviceId')
        : null, // 选填，指定的视频设备id，默认为系统缺省
      profile:
        VhallRTC[this.getVideoProfile()] ||
        VhallRTC[options.profile] ||
        VhallRTC[interactToolStatus.definition] ||
        VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
      streamType: statusConst.STREAM_TYPE_VOICE_TURNING, //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享，5为视频轮巡。
      mixOption: {
        // 选填，指定此本地流的音频和视频是否加入旁路混流。支持版本：2.3.2及以上。
        mixVideo: false, // 视频是否加入旁路混流
        mixAudio: false  // 音频是否加入旁路混流
      },
      attributes: JSON.stringify({
        ...attributes,
        role: roleName
      }) //选填，自定义信息，支持字符串类型
    };

    const params = merge.recursive({}, defaultOptions, options);

    return this.createLocalStream(params).then(data => {
      useVideoPollingServer().setlocalPollingInfo(data)
      return data
    }).catch(e => {
      return Promise.reject(e)
    })
  }

  /**
   * 获取分辨率
   */
  getVideoProfile() {
    console.log('[interactiveServer]-------获取分辨率---')
    const { interactToolStatus, watchInitData } = useRoomBaseServer().state;
    const third_party_user_id = watchInitData?.join_info?.third_party_user_id;
    const { groupInitData } = useGroupServer().state
    // 当前演示者或当前主讲人可重新旁路布局
    /**
     * let isHost = interactToolStatus.doc_permission == third_party_user_id
      || interactToolStatus.main_screen == third_party_user_id; // 主讲人或主画面

    if (groupInitData.isInGroup) {
      isHost = (groupInitData.doc_permission && groupInitData.doc_permission == third_party_user_id) ||
        (groupInitData.main_screen && groupInitData.main_screen == third_party_user_id)
    }*/
    const isHost = groupInitData.isInGroup ?
      (groupInitData.main_screen && groupInitData.main_screen == third_party_user_id) :
      interactToolStatus.main_screen == third_party_user_id; // 主画面

    const remoteStream = this.getRoomStreams();
    if (!remoteStream || !remoteStream.length) {
      if (isHost) {
        profile = statusConst.formatDefinition('720');
      } else {
        profile = statusConst.formatDefinition('360');
      }
      console.log('[interactiveServer]-------分辨率计算结果---', profile)
      return profile
    }
    const onlineLength = remoteStream.filter(item => item.streamType == 2).length;
    let profile;

    if (onlineLength >= 0 && onlineLength <= 6) {
      if (isHost) {
        profile = statusConst.formatDefinition('720');
      } else {
        profile = statusConst.formatDefinition('360');
      }
    } else if (onlineLength > 6 && onlineLength <= 11) {
      if (isHost) {
        profile = statusConst.formatDefinition('720');
      } else {
        profile = statusConst.formatDefinition('240');
      }
    } else {
      if (isHost) {
        profile = statusConst.formatDefinition('540');
      } else {
        profile = statusConst.formatDefinition('180');
      }
    }
    console.log('[interactiveServer]-------分辨率计算结果---', profile)
    return profile;
  }

  // 创建本地音频流
  createLocalAudioStream(options = {}, addConfig = {}) {
    return this.interactiveInstance.createLocalAudioStream(options, addConfig);
  }

  // 创建图片推流
  createLocalPhotoStream(options = {}, addConfig = {}) {
    const { watchInitData } = useRoomBaseServer().state;

    const { groupInitData } = useGroupServer().state

    const { interactToolStatus } = useRoomBaseServer().state;

    const isGroupLeader = groupInitData.isInGroup && watchInitData.join_info.third_party_user_id == groupInitData.doc_permission

    const roleName = isGroupLeader ? 20 : watchInitData.join_info.role_name
    let defaultOptions = {
      video: false,
      audio: true,
      videoContentHint: 'detail',
      profile:
        VhallRTC[this.getVideoProfile()] ||
        VhallRTC[options.profile] ||
        VhallRTC[interactToolStatus.definition] ||
        VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
      mute: {
        audio: watchInitData.webinar.mode == 6 ? true : false
      },
      attributes: JSON.stringify({
        roleName: roleName,
        accountId: watchInitData.join_info.third_party_user_id,
        nickname: watchInitData.join_info.nickname
      }) //选填，自定义信息，支持字符串类型
    };
    // 当前用户是否在上麦列表中
    const isOnMicObj = interactToolStatus.speaker_list.find(
      item => item.account_id == watchInitData.join_info.third_party_user_id
    );

    // 如果当前用户在上麦列表中，mute 状态需要从上麦列表中获取，否则默认开启
    if (isOnMicObj) {
      defaultOptions.mute = {
        audio: !isOnMicObj.audio,
        video: !isOnMicObj.video
      };
    }

    // 处理插播中的麦克风状态
    defaultOptions = this.handleInsertFileMicStatus(defaultOptions)

    const params = merge.recursive({}, defaultOptions, options, addConfig);
    console.log('创建图片推流参数', params)
    return this.createLocalStream(params).then(data => {
      this.updateSpeakerByAccountId(data, defaultOptions, watchInitData)
      return data
    }).catch(e => {
      return Promise.reject(e)
    })
  }


  /**
   * 描述 wap创建流   wap创建时，不能指定设备ID，只能使用facingMode参数
   * @date 2022-03-22
   * @param {any} options={}  默认配置
   * @param {any} addConfig={}  追加config配置
   * @returns {any}
   */
  async createWapLocalStream(options = {}, addConfig = {}) {
    const {
      watchInitData,
      interactToolStatus,
      attributes
    } = statusBase.getBaseInfo();

    let defaultOptions = {
      video: true,
      audio: true,
      facingMode: options.facingMode || 'user',
      profile:
        VhallRTC[this.getVideoProfile()] ||
        VhallRTC[options.profile] ||
        VhallRTC[interactToolStatus.definition] ||
        VhallRTC.RTC_VIDEO_PROFILE_1080P_16x9_H, // 选填，视频质量参数，可选值参考文档中的[互动流视频质量参数表]
      streamType: statusConst.STREAM_TYPE_VOICE_VIDEO, //选填，指定互动流类型，当需要自定义类型时可传值。如未传值，则底层自动判断： 0为纯音频，1为纯视频，2为音视频，3为屏幕共享。,
      attributes: JSON.stringify(attributes)
    };


    // 如果当前用户在上麦列表中，mute 状态需要从上麦列表中获取，否则默认开启
    const speakerValue = statusBase.getSpeakerValue();
    if (speakerValue) {
      defaultOptions.mute = { ...speakerValue };
    }

    // 处理插播中的麦克风状态
    defaultOptions = this.handleInsertFileMicStatus(defaultOptions)

    const params = merge.recursive({}, defaultOptions, options, addConfig);
    return await this.createLocalStream(params).then(data => {
      this.updateSpeakerByAccountId(data, defaultOptions, watchInitData)
      return data
    }).catch(e => {
      return Promise.reject(e)
    })
  }

  /**
   * 描述   更新 speaklist相关数据
   * @date 2022-03-22
   * @param {any} data  创建流成功返回的信息
   * @param {any} defaultOptions 创建流传的参数
   * @param {any} watchInitData useRoomBaseServer().state
   * @returns {any}
   */
  updateSpeakerByAccountId(data, defaultOptions, watchInitData) {
    try {
      let params = {
        streamId: data.streamId,
        audioMuted: defaultOptions.mute?.audio || false,
        videoMuted: defaultOptions.mute?.video || false
      }
      // 更新speakList
      useMicServer().updateSpeakerByAccountId(watchInitData.join_info.third_party_user_id, params)

      this.state.localStream = {
        streamId: data.streamId
      }

      // 派发本地流更新事件
      this.$emit(this.EVENT_TYPE.INTERACTIVE_LOCAL_STREAM_UPDATE, this.state.localStream)
    } catch (e) {
      console.error('updateSpeakerByAccountId__speaker_list error', e)
    }
  }

  // 销毁本地流
  destroyStream(options = {}) {
    return this.interactiveInstance.destroyStream({ streamId: options?.streamId || this.state.localStream.streamId })
      .then(res => {
        // 如果是销毁本地上麦流，清空上麦流参数
        if (!options.streamId || options.streamId == this.state.localStream.streamId) {
          this._clearLocalStream();
        }
        return res;
      }).catch(error => {
        // 如果是销毁本地上麦流，清空上麦流参数
        if (!options.streamId || options.streamId == this.state.localStream.streamId) {
          this._clearLocalStream();
        }
        console.error('destroyStream', error)
        return Promise.reject(error)
      });
  }

  // 无缝切换本地流
  switchStream(opt) {
    return new Promise((resolve, reject) => {
      let mediaSetting = useMediaSettingServer().state;

      let { streamId, type } = opt;
      if (!streamId || (type != 'video' && type != 'audio')) {
        reject({ code: '', msg: '参数异常' });
      }

      let deviceId = null;
      if (type == 'video') {
        deviceId = mediaSetting.video;
      } else if (type == 'audio') {
        deviceId = mediaSetting.audioInput;
      }
      if (!deviceId) {
        reject({ code: '', msg: 'deviceId未传值' });
      }
      const defaultPa = {
        streamId: streamId, // 必填，本地流ID
        type: type, // 必填，支持'video'和'audio'，分别表示视频设备和音频设备
        deviceId: deviceId // 必填，设备ID，可通过getDevices()方法获取。
      };
      window.vhallReportForProduct?.toStartReporting(110163, 110164, { ...defaultPa });
      return this.interactiveInstance.switchDevice(defaultPa);
    });
  }

  // 推送本地流到远端
  publishStream(options = {}) {
    if (!this.interactiveInstance) {
      return Promise.reject({ code: '' })
    }
    const streamId = options.streamId || this.state.localStream.streamId;
    return this.interactiveInstance
      .publish({ streamId })
      .then(data => {
        window.vhallReportForProduct?.report(110183, { report_extra: { streamId } });
        return data;
      }).catch(error => {
        window.vhallReportForProduct?.report(110184, { report_extra: { streamId } });
        console.error('publishStream', error)
        return Promise.reject(error)
      })
  }

  /**
   * 取消推送到远端的流
   * @param {Object} options
   * @returns {Promise}
   */
  unpublishStream(options = {}) {
    const streamId = options.streamId || this.state.localStream.streamId;
    return this.interactiveInstance
      .unpublish({ streamId })
      .then(res => {
        // 如果是销毁本地上麦流，清空上麦流参数
        if (!options.streamId || options.streamId == this.state.localStream.streamId) {
          this._clearLocalStream();
        }
        window.vhallReportForProduct?.report(110185, { report_extra: { streamId } });
        return res;
      }).catch(error => {
        // 如果是销毁本地上麦流，清空上麦流参数
        if (!options.streamId || options.streamId == this.state.localStream.streamId) {
          this._clearLocalStream();
        }
        window.vhallReportForProduct?.report(110186, { report_extra: { streamId } });
        console.error('unpublishStream', error)
        return Promise.reject(error)
      })
  }

  /**
   * 清空本地流参数
   */
  _clearLocalStream() {
    this.state.localStream = {
      streamId: null, // 本地流id
      // videoMuted: false,
      // audioMuted: false,
      // attributes: {}
    };
  }

  /**
   * 订阅远端流
   * @param {Object} options -- streamId:订阅的流id videoNode: 页面显示的容器 mute: 远端流的音视频 dual: 大小流 0小流 1大流
   * @returns {Promise} - 订阅成功后的promise 回调
   */
  subscribe(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.retrySubScribeNum) {
        this.retrySubScribeNum = 0
      }
      this.interactiveInstance.subscribe(options).then(res => {
        this.retrySubScribeNum = 0
        resolve(res)
      }).catch(async (e) => {
        console.log('[interactiveServer]   订阅失败-----> ', e, options)
        if (this.retrySubScribeNum > 3) {
          this.retrySubScribeNum = 0
          reject(e)
          return
        }
        await sleep(500);
        this.retrySubScribeNum++
        this.subscribe(options)
      })
    })
  }

  // 取消订阅远端流
  unSubscribeStream(streamId) {
    return this.interactiveInstance.unsubscribe({ streamId });
  }

  /**
   * 开启旁路
   * @param {Object} options --  layout: 旁路布局  profile: 旁路直播视频质量参数 paneAspectRatio:旁路混流窗格指定高宽比 border: 旁路边框属性
   * @returns {Promise} - 开启旁路后的promise回调
   */
  startBroadCast(options = {}) {
    const defaultOptions = {
      layout: VhallPaasSDK.modules.VhallRTC.CANVAS_ADAPTIVE_LAYOUT_GRID_MODE, // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
      profile: VhallPaasSDK.modules.VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1, // 旁路直播视频质量参数
      paneAspectRatio: VhallPaasSDK.modules.VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9, //旁路混流窗格指定高宽比。  v2.3.2及以上
      border: {
        // 旁路边框属性
        width: 2,
        color: '0x1a1a1a'
      }
    };

    const params = merge.recursive({}, defaultOptions, options);

    // 如果有 adaptiveLayoutMode 就不传 layout
    if (params.adaptiveLayoutMode !== undefined || params.adaptiveLayoutMode !== null) {
      delete params.layout;
    }

    return this.interactiveInstance.startBroadCast(params).catch(async err => {
      // 开启失败重试三次
      if (InteractiveServer._startBroadCastRetryCount >= 3) {
        InteractiveServer._startBroadCastRetryCount = 0;
        return Promise.reject(err);
      }
      // 等待 1s 重试
      await sleep(1000);
      InteractiveServer._startBroadCastRetryCount
        ? InteractiveServer._startBroadCastRetryCount++
        : (InteractiveServer._startBroadCastRetryCount = 1);
      return this.startBroadCast(options);
    });
  }

  // 停止旁路
  stopBroadCast() {
    return this.interactiveInstance.stopBroadCast();
  }

  // 移除旁路背景图片
  removeBroadBackgroundImage() {
    return this.interactiveInstance.removeBroadBackgroundImage()
  }

  // 设置旁路背景图片
  setBroadBackgroundImage(options = {}) {

    const { watchInitData, interactToolStatus, skinInfo } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state;
    const isGroupLeader = groupInitData.isInGroup && watchInitData.join_info.third_party_user_id == groupInitData.doc_permission
    let skinJsonPc = {}

    if (skinInfo?.skin_json_pc && skinInfo.skin_json_pc != 'null') {
      skinJsonPc = JSON.parse(skinInfo.skin_json_pc);
    }

    let defaultOptions = {
      backgroundImage: '',  //必填,背景图片的url地址，设置后旁路背景区域将显示为背景图
      cropType: 2,  //必填,背景图片填充模式， 0等比缩放至画布; 1裁剪图片和画布宽高比一致，再缩放至画布; 2直接拉伸填满画布（默认）
    }
    // 主持人||主讲人
    if ((watchInitData.join_info.role_name == 1 || interactToolStatus.doc_permission == watchInitData.join_info.third_party_user_id) && interactToolStatus?.videoBackGroundMap?.videoBackGround) {
      defaultOptions.backgroundImage = interactToolStatus.videoBackGroundMap?.videoBackGround
    } else if (isGroupLeader && skinJsonPc?.videoBackGround) {
      defaultOptions.backgroundImage = skinJsonPc?.videoBackGround
    }

    const params = merge.recursive({}, defaultOptions, options);

    if (params.backgroundImage) {
      return this.interactiveInstance.setBroadBackgroundImage(params)
    } else if (watchInitData.join_info.role_name == 1 || isGroupLeader) {
      return this.removeBroadBackgroundImage()
    } else {
      return Promise.reject('无效的背景图片')
    }
  }

  // 获取插播和桌面共享的流信息
  getDesktopAndIntercutInfo(isUseCurrentStreams = false) {
    if (!this.interactiveInstance) return
    let streamList = this.interactiveInstance.getRoomStreams();

    if (isUseCurrentStreams) {
      streamList = [...this.currentStreams]
    }
    try {
      streamList = streamList.map(stream => ({
        ...stream,
        attributes: stream.attributes && typeof stream.attributes == 'string' ? JSON.parse(stream.attributes) : stream.attributes
      }));
    } catch (error) {
      console.log('error', error)
    }

    // 此处默认插播和桌面共享不共存，只会返回一个
    let stream = streamList.find(stream => stream.streamType === 3 || stream.streamType === 4);
    return stream;
  }
  // 重新旁路布局
  async resetLayout() {
    const role_name = useRoomBaseServer().state.watchInitData.join_info.role_name;
    const { watchInitData } = useRoomBaseServer().state;
    const third_party_user_id = watchInitData?.join_info?.third_party_user_id;
    const { interactToolStatus } = useRoomBaseServer().state;
    const { groupInitData } = useGroupServer().state
    // 当前演示者或当前主讲人可重新旁路布局
    let allow = false
    if (groupInitData.isInGroup) {
      allow = (groupInitData.presentation_screen && groupInitData.presentation_screen == third_party_user_id) || (groupInitData.doc_permission && groupInitData.doc_permission == third_party_user_id)
    } else {
      allow = (interactToolStatus.presentation_screen && interactToolStatus.presentation_screen == third_party_user_id) || (interactToolStatus.doc_permission && interactToolStatus.doc_permission == third_party_user_id)
    }
    if (role_name == 1) {
      allow = true;
    }
    console.log('重新旁路布局-resetLayout-1-1-1-1', allow)
    if (!allow) return;

    const stream = this.getDesktopAndIntercutInfo();



    window.vhallReportForProduct?.toReport(110239, { report_extra: { stream } });
    // 如果有桌面共享或插播
    if (stream) {
      await this.setBroadCastScreen(stream.streamId)
        .then(() => {
          console.log('[interactiveServer]----动态设置旁路主屏幕成功', stream.streamId);
        })
        .catch(e => {
          console.error('[interactiveServer]----动态设置旁路主屏幕失败', e);
        });
    } else {
      await this.setBroadCastScreen()
    }

    if (stream) {
      useMediaSettingServer().state.layout = VhallRTC.CANVAS_LAYOUT_PATTERN_GRID_1 || 'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE'
      // 一人铺满布局
      await this.setBroadCastLayout({ layout: VhallRTC.CANVAS_LAYOUT_PATTERN_GRID_1 });
    } else {
      if (groupInitData.isInGroup) return;
      // 自适应布局
      const res = await useRoomBaseServer().getInavToolStatus();
      const type = res.code == 200 && res.data.layout ? res.data.layout : useMediaSettingServer().state.layout;
      console.log('自适应布局模式====', type)
      const adaptiveLayoutMode = VhallRTC[type];
      window.vhallReportForProduct?.toReport(110240, { report_extra: { broadCastAdaptiveLayoutMode: res } });
      await this.setBroadCastAdaptiveLayoutMode({ adaptiveLayoutMode });
    }

  }

  // 动态配置指定旁路布局模板
  setBroadCastLayout(options = {}) {
    console.log('动态配置指定旁路布局模板参数', options)
    return this.interactiveInstance.setBroadCastLayout(options).then(res => {
      console.log('配置指定旁路布局成功', res)
    }).catch(error => {
      console.error('配置指定旁路布局失败', error)
    });
  }
  // 配置旁路布局自适应模式
  setBroadCastAdaptiveLayoutMode(options = {}) {
    console.log('配置布局自适应模式参数', options)
    return this.interactiveInstance.setBroadCastAdaptiveLayoutMode(options).then(() => {
      console.log('配置布局自适应模式成功')
    }).catch(error => {
      console.error('配置布局自适应模式失败', error)
    });
  }

  // 动态配置旁路主屏
  setBroadCastScreen(streamId) {
    console.log('动态配置旁路主屏', streamId)
    const speakerList = useMicServer().state.speakerList
    const mainScreenStream = speakerList.find(item => {
      return item.accountId === useRoomBaseServer().state.interactToolStatus.main_screen
    })
    const mainScreenStreamId = streamId || (mainScreenStream && mainScreenStream.streamId) || this.state.localStream.streamId
    if (mainScreenStreamId == this.state.mainStreamId) return Promise.resolve();
    return this.interactiveInstance
      .setBroadCastScreen({ mainScreenStreamId }).then(res => {
        console.log('动态配置旁路主屏-success', res)
        this.state.mainStreamId = mainScreenStreamId
      })
      .catch(async err => {
        // 设置失败重试三次
        if (InteractiveServer._setBroadCastScreenRetryCount >= 3) {
          InteractiveServer._setBroadCastScreenRetryCount = 0;
          return Promise.reject(err);
        }
        // 等待 50ms 重试
        await sleep(50);
        InteractiveServer._setBroadCastScreenRetryCount
          ? InteractiveServer._setBroadCastScreenRetryCount++
          : (InteractiveServer._setBroadCastScreenRetryCount = 1);
        return this.setBroadCastScreen(streamId);
      });
  }
  // 播放自动播放失败的流
  playAbortStreams() {
    this.abortStreams.forEach(stream => {
      this.interactiveInstance.play({ streamId: stream.streamId }).then(() => { });
    });
    this.abortStreams = []
  }
  // 获取全部音视频列表
  getDevices() {
    return this.interactiveInstance.getDevices();
  }

  // 获取摄像头列表
  getCameras() {
    return this.interactiveInstance.getCameras();
  }

  // 获取麦克风列表
  getMicrophones() {
    return this.interactiveInstance.getMicrophones();
  }

  // 获取扬声器列表
  getSpeakers() {
    return this.interactiveInstance.getSpeakers();
  }

  // 获取设备的分辨率
  getVideoConstraints(deviceId = '') {
    return this.interactiveInstance.getVideoConstraints(deviceId);
  }

  // 配置本地流视频质量参数
  setVideoProfile(options = {}) {
    return this.interactiveInstance.setVideoProfile(options);
  }

  // 是否支持桌面共享
  isScreenShareSupported() {
    return this.interactiveInstance.isScreenShareSupported();
  }

  // 获取上下行丢包率
  getPacketLossRate() {
    return this.interactiveInstance.getPacketLossRate();
  }

  /**
   * 获取流上下行丢包率
   * @param {Object} options streamId: 流id
   * @returns {Promise}
   */
  getStreamPacketLoss(options = {}) {
    return this.interactiveInstance.getStreamPacketLoss(options);
  }

  // 获取房间总的流信息(本地流加远端流)
  getRoomInfo() {
    return this.interactiveInstance.getRoomInfo();
  }

  /**
   * 获取流音频级别
   * @param {Object} options streamId: 流id
   * @returns {Pormise}
   */
  getAudioLevel(options = {}) {
    return this.interactiveInstance.getAudioLevel(options);
  }

  // 获取流的mute状态
  getStreamMute(streamId) {
    return this.interactiveInstance.getStreamMute(streamId);
  }

  // 获取当前流的信息,返回一个数组
  currentStreams() {
    return this.interactiveInstance.currentStreams;
  }

  // 设置主屏
  setMainScreen(data = {}) {
    return interactive.setMainScreen(data);
  }

  // 设置主讲人
  setSpeaker(data = {}) {
    return interactive.setSpeaker(data);
  }
  // 设置桌面共享最大化
  setDesktop(data = {}) {
    return interactive.setDesktop(data);
  }

  // 设置（麦克风-1 摄像头-2）
  setRoomDevice(data = {}) {
    return interactive.setRoomDevice(data);
  }

  // 订阅流列表
  getRoomStreams() {
    if (!this.interactiveInstance) return;
    return this.interactiveInstance.getRoomStreams();
  }

  /**
   * 互动流进入全屏
   * @param {Object} options   streamId:"123456789123456789",  // 流ID vNode: 'xxx', // 选填 以ID为结点的Dom
   * @returns {Promise} code 611035为全屏异常
   */
  setStreamFullscreen(options = {}) {
    return this.interactiveInstance.setStreamFullscreen(options);
  }

  /**
   * 互动流退出全屏
   * @param {Object} options   streamId:"123456789123456789",  // 流ID vNode: 'xxx', // 选填 以ID为结点的Dom
   * @returns {Promise} code 611035为全屏异常
   */
  exitStreamFullscreen(options = {}) {
    return this.interactiveInstance.exitStreamFullscreen(options);
  }

  /**
   * 设置大小流
   * @param {Object} options streamId:"", // 远端流Id，必填  dual:1   // 双流订阅选项， 0 为小流， 1为大流 必填。
   * @returns {Promise}
   */
  setDual(options = {}) {
    return this.interactiveInstance.setDual(options);
  }

  /**
   * 改变视频的禁用和启用
   * @param {Object} options
   * @returns {Promise}
   */
  muteVideo(options = {}) {
    return this.interactiveInstance.muteVideo(options).then(data => {
      return data;
    });
  }

  /**
   * 改变音频的禁用和启用
   * @param {Object} options
   * @returns {Promise}
   */
  muteAudio(options = {}) {
    return this.interactiveInstance.muteAudio(options).then(data => {
      return data;
    });
  }

  /**
   * 设置房间音视频设备状态
   * @param {Object} params
   * @returns {Promise}
   */
  setDeviceStatus(params = {}) {
    const watchInitData = useRoomBaseServer().state.watchInitData;
    const defaultParams = {
      room_id: watchInitData.interact.room_id,
      broadcast: 1
    };
    const retParams = merge.recursive({}, defaultParams, params);
    return roomApi.activity.setDeviceStatus(retParams);
  }

  /**
   * 设置PC观看端流列表高度
   * @param {Number} val 0, 80
   */
  setStreamListHeightInWatch(val) {
    this.state.streamListHeightInWatch = val;
  }

  /**
   * 描述：播放
   * @date 2022-03-23
   * @param {any} opt Object {streamId: xxx}
   * @returns {any} promise
   */
  setPlay(opt) {
    return this.interactiveInstance.play(opt);
  }

  /**
   * 描述：暂停
   * @date 2022-03-23
   * @param {any} opt Object {streamId: xxx}
   * @returns {any} promise
   */
  setPause(opt) {
    return this.interactiveInstance.pause(opt);
  }


  /**
   * 初始化本地流的时候，处理插播情况的麦克风状态
   * @param {Object} options 初始化本地流的参数
   * @returns {Object} options 根据插播状态处理过的本地流参数
   */
  handleInsertFileMicStatus(options) {
    // 如果存在插播流，需要静音推流，并保存当前人的麦克风状态
    if (useInsertFileServer().getInsertFileStream()) {
      // 备份麦克风状态
      useInsertFileServer().state.oldMicMute = options.mute.audio
      if (!options.mute.audio) {
        const { watchInitData } = useRoomBaseServer().state;
        // 设置静音
        this.setDeviceStatus({
          device: 1,
          status: 0,
          receive_account_id: watchInitData.join_info.third_party_user_id
        })
      }
      // 设置流静音
      options.mute.audio = true
    }
    return options
  }

  // 云导播初始化互动使用
  // 初始化活动基本功能
  async baseInit() {
    const { watchInitData } = useRoomBaseServer().state;
    const options = {
      appId: watchInitData.interact.paas_app_id, // 互动应用ID，必填
      inavId: watchInitData.interact.inav_id, // 互动房间ID，必填
      roomId: watchInitData.interact.room_id, // 如需开启旁路，必填。
      accountId: watchInitData.join_info.third_party_user_id, // 第三方用户ID，必填

      token: watchInitData.interact.paas_access_token, // access_token，必填
      // mode:
      //   watchInitData.webinar.no_delay_webinar == 1
      //     ? VhallPaasSDK.modules.VhallRTC.MODE_LIVE
      //     : VhallPaasSDK.modules.VhallRTC.MODE_RTC, //应用场景模式，选填，可选值参考下文【应用场景类型】。支持版本：2.3.1及以上。
      role: "administrator", //用户角色，选填，可选值参考下文【互动参会角色】。当mode为rtc模式时，不需要配置role。支持版本：2.3.1及以上。
      attributes: '', // String 类型
      autoStartBroadcast: true, // 是否开启自动旁路 Boolean 类型   主持人默认开启true v2.3.5版本以上可用
      broadcastConfig: {
        adaptiveLayoutMode:
          VhallPaasSDK.modules.VhallRTC[useMediaSettingServer().state.layout] ||
          VhallRTC[sessionStorage.getItem('layout')] ||
          VhallPaasSDK.modules.VhallRTC.CANVAS_ADAPTIVE_LAYOUT_TILED_MODE, // 旁路布局，选填 默认大屏铺满，一行5个悬浮于下面
        profile: VhallPaasSDK.modules.VhallRTC.BROADCAST_VIDEO_PROFILE_1080P_1, // 旁路直播视频质量参数
        paneAspectRatio: VhallPaasSDK.modules.VhallRTC.BROADCAST_PANE_ASPACT_RATIO_16_9, //旁路混流窗格指定高宽比。  v2.3.2及以上
        precastPic: false, // 选填，当旁路布局模板未填满时，剩余的窗格默认会填充系统默认小人图标。可配置是否显示此图标。
        border: {
          // 旁路边框属性
          width: 2,
          color: '0x1a1a1a'
        }
      },
      otherOption: watchInitData.report_data
    }

    this.interactiveInstanceOptions = options;

    console.log('%cVHALL-DOMAIN-云导播互动初始化参数', 'color:blue', options);

    return new Promise((resolve, reject) => {
      VhallPaasSDK.modules.VhallRTC.createInstance(
        options,
        event => {
          // 互动实例
          this.interactiveInstance = event.vhallrtc;
          this._addListeners();

          // 是否有互动实例置为true
          this.state.isInstanceInit = true
          console.log('%c[interactive server] 云导播初始化互动实例完成', 'color:#0000FF', event)
          resolve(event);
        },
        error => {
          reject(error);
        }
      );
    });
  }
}

export default function useInteractiveServer() {
  return new InteractiveServer();
}
