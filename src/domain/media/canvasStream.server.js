import useMediaSettingServer from './mediaSetting.server';
class CanvasStreamServer {
  constructor() {
    if (typeof CanvasStreamServer.instance === 'object') {
      return CanvasStreamServer.instance;
    }

    // dom
    this.canvasDom = null;
    this.canvasImgDom = null;

    this.state = {
      canvasSize: {
        width: 1280,
        height: 720
      },
      getRealImgErr: false, // 真实图片设置是否错误
      canvasStreamInterval: null
    };
  }

  init(options) {
    // dom
    this.canvasDom = options.canvasDom;
    this.canvasImgDom = options.canvasImgDom;
  }

  setCanvasSize(options) {
    options.width && (this.state.canvasSize.width = options.width);
    options.height && (this.state.canvasSize.height = options.height);
  }

  async checkImgStream() {
    const { videoType, canvasImgUrl } = useMediaSettingServer().state;
    if (videoType === 'picture') {
      if (canvasImgUrl) {
        // 非默认图片
        await this.getRealImg();
      }
      this.setCanvasStream();
    }
  }

  // 获取真实的图片宽高
  getRealImg() {
    return new Promise((resolve, reject) => {
      try {
        let _img = new Image();
        _img.src = this.mediaSettingData.state.canvasImgUrl;
        this.canvasImgDom.src = _img.src;
        _img.onload = () => {
          this.state.canvasSize.width = this.canvasDom.width = _img.width;
          this.state.canvasSize.height = this.canvasDom.height = _img.height;
          resolve();
        };
      } catch (error) {
        this.state.getRealImgErr = true;
        reject(error);
      }
    });
  }

  // 设置canvas流
  setCanvasStream() {
    const c2d = this.canvasDom.getContext('2d');
    if (this.canvasStreamInterval) {
      clearInterval(this.canvasStreamInterval);
    }

    this.canvasStreamInterval = setInterval(() => {
      c2d.drawImage(
        this.canvasImgDom,
        0,
        0,
        this.state.canvasData.width,
        this.state.canvasData.height
      );
    }, 1000);
  }

  // 获取图片track
  getCanvasStream() {
    if (this.state.getRealImgErr) {
      return null;
    }
    return this.canvasDom.captureStream().getVideoTracks()[0] || null;
  }
}

export default function useCanvasStreamServer() {
  if (!CanvasStreamServer.instance) {
    CanvasStreamServer.instance = new CanvasStreamServer();
  }

  return CanvasStreamServer.instance;
}
