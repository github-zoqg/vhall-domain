import BaseServer from '@/domain/common/base.server';

class MediaStaticMicrophoneServer extends BaseServer {
  constructor() {
    if (typeof MediaStaticMicrophoneServer.instance === 'object') {
      return MediaStaticMicrophoneServer.instance;
    }
    super();
    this.state = {
      rafID: null,
      analyserNode: null,
      width: 0
    };

    MediaStaticMicrophoneServer.instance = this;
    return this;
  }

  init(audioId) {

    const _this = this;

    if (this.state.rafID) {
      this.cancelAnalyserUpdates();
    }
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!navigator.getUserMedia) {
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    }
    if (!navigator.cancelAnimationFrame) {
      navigator.cancelAnimationFrame =
        navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    }
    if (!navigator.requestAnimationFrame) {
      navigator.requestAnimationFrame =
        navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
    }
    navigator.getUserMedia(
      { audio: { deviceId: audioId } },
      stream => {
        _this.stream = stream;
        const audioContext = new AudioContext();
        _this.inputPoint = audioContext.createGain();
        _this.audioInput = audioContext.createMediaStreamSource(stream);
        _this.audioInput.connect(_this.inputPoint);

        _this.state.analyserNode = audioContext.createAnalyser();
        _this.state.analyserNode.fftSize = 1024;
        _this.inputPoint.connect(_this.state.analyserNode);

        //  播放
        _this.scriptNode = audioContext.createScriptProcessor(1024, 1, 1);
        _this.audioInput.connect(_this.scriptNode);
        _this.scriptNode.connect(audioContext.destination);
        _this.scriptNode.onaudioprocess = () => {
          _this.state.rafID = window.requestAnimationFrame(_this.updateAnalysers.bind(_this));
        };
      },
      e => {
        console.error(e);
      }
    );
  }
  updateAnalysers() {
    if (!this.state.analyserNode) return;
    const freqByteData = new Uint8Array(this.state.analyserNode.frequencyBinCount);
    this.state.analyserNode.getByteFrequencyData(freqByteData);
    let magnitude = 0;
    for (let j = 0; j < this.state.analyserNode.frequencyBinCount; j++) {
      magnitude += freqByteData[j];
    }
    // console.log(magnitude / this.state.analyserNode.frequencyBinCount, 9900)
    this.state.width = magnitude / this.state.analyserNode.frequencyBinCount;
    this.$emit('output_level', this.state.width);
  }

  /**
   * 销毁采集麦克风实例
   *
   * @function cancelAnalyserUpdates
   */
  cancelAnalyserUpdates() {

    if (!this.inputPoint) return
    window.cancelAnimationFrame(this.state.rafID);
    this.inputPoint.disconnect();
    this.audioInput.disconnect();
    this.scriptNode.disconnect();
    this.state.rafID = null;
    this.inputPoint = null;
    this.audioInput = null;
    this.state.analyserNode = null;
    this.zeroGain = null;
    this.stream.getTracks().forEach(trackInput => {
      console.log('[interactiveServer]  look stop -5');
      trackInput.stop();
    });
  }

  /**
   * 设置音频输入源
   *
   * @function setAudioInput
   * @param {String} deviceId 音频设备ID
   */
  async setAudioInput(deviceId) {

    const mediaOptions = { audio: { deviceId: deviceId } };
    const stream = await navigator.mediaDevices.getUserMedia(mediaOptions);
    stream.getTracks().forEach(trackInput => {
      console.log('[interactiveServer]  look stop -4');
      trackInput.stop();
    });
    this.init(deviceId);
  }
}

export default function useMediaStaticMicrophoneServer() {
  if (!useMediaStaticMicrophoneServer.instance) {
    useMediaStaticMicrophoneServer.instance = new MediaStaticMicrophoneServer();
  }

  return useMediaStaticMicrophoneServer.instance;
}
