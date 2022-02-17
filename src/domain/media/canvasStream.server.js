import mediaSetting from './mediaSetting.server';
class CanvasStreamServer {
  constructor(options) {
    if (typeof CanvasStreamServer.instance === 'object') {
      return CanvasStreamServer.instance;
    }

    this.canvasData = {
      width: 1280,
      height: 720
    };

    // dom
    this.canvasDom = options.canvasDom;
    this.canvasImgDom = options.canvasImgDom;
    this.canvasStreamInterval = null;

    this.mediaSettingData = new mediaSetting();
    this.getRealImgErr = false; // 真实图片设置是否错误
  }

  async checkImgStream() {
    let isPushType = this.mediaSettingData.state.videoType === 'pictrue';
    if (isPushType) {
      if (this.mediaSettingData.state.canvasImgUrl) {
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
          this.canvasData.width = this.canvasDom.width = _img.width;
          this.canvasData.height = this.canvasDom.height = _img.height;
          resolve();
        };
      } catch (error) {
        this.getRealImgErr = true;
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
      c2d.drawImage(this.canvasImgDom, 0, 0, this.canvasData.width, this.canvasData.height);
    }, 1000);
  }

  // 获取图片track
  getCanvasStream() {
    if (this.getRealImgErr) {
      return null;
    }
    return this.canvasDom.captureStream().getVideoTracks()[0] || null;
  }
}

export default function useCanvasStreamServer(options) {
  if (!CanvasStreamServer.instance) {
    CanvasStreamServer.instance = new CanvasStreamServer(options);
  }

  return CanvasStreamServer.instance;
}
