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
      // 默认canvas宽高大小
      canvasSize: {
        width: 1280,
        height: 720
      },
      getRealImgErr: false, // 真实图片设置是否错误
      canvasStreamInterval: null // 图片绘制canvas的定时器
    };
  }

  /**
   * 描述 初始化canvas相关Dom
   * @date 2022-03-23
   * @param {any} options IMG 和 Canvas Dom
   * @returns {any} 无
   */
  init(options) {
    this.canvasDom = options.canvasDom;
    this.canvasImgDom = options.canvasImgDom;
  }

  /**
   * 描述 设置canvas的大小
   * @date 2022-03-23
   * @param {any} options
   * @returns {any}
   */
  setCanvasSize(options) {
    options.width && (this.state.canvasSize.width = options.width);
    options.height && (this.state.canvasSize.height = options.height);
  }

  /**
   * 描述： 检查活动 推流类型(videoType) 取真实图片地址(canvasImgUrl)
   * @date 2022-03-23
   * @returns {any}
   */
  async checkImgStream() {
    const { videoType, canvasImgUrl } = useMediaSettingServer().state;
    if (videoType === 'picture') {
      if (canvasImgUrl) {
        await this.getRealImg();
      }
      this.setCanvasStream();
    }
  }

  /**
   * 描述：获取真实的图片宽高
   * @date 2022-03-23
   * @returns {any}
   */
  getRealImg() {
    const { canvasImgUrl } = useMediaSettingServer().state;
    return new Promise((resolve, reject) => {
      try {
        let _img = new Image();
        _img.src = canvasImgUrl;
        this.canvasImgDom.src = _img.src;
        _img.onload = () => {
          // 如果图片的尺寸是奇数，需要转换成偶数
          // http://wiki.vhallops.com/pages/viewpage.action?pageId=301727746
          this.state.canvasSize.width = this.canvasDom.width = _img.width % 2 === 1 ? _img.width + 1 : _img.width;
          this.state.canvasSize.height = this.canvasDom.height = _img.height % 2 === 1 ? _img.height + 1 : _img.height;
          resolve();
        };
      } catch (error) {
        this.state.getRealImgErr = true;
        reject(error);
      }
    });
  }

  /**
   * 描述：图片进行canvas绘制
   * @date 2022-03-23
   * @returns {any}
   */
  setCanvasStream() {
    const c2d = this.canvasDom.getContext('2d');
    if (this.canvasStreamInterval) {
      clearInterval(this.canvasStreamInterval);
    }
    c2d.drawImage(
      this.canvasImgDom,
      0,
      0,
      this.state.canvasSize.width,
      this.state.canvasSize.height
    );
    this.canvasStreamInterval = setInterval(() => {
      c2d.drawImage(
        this.canvasImgDom,
        0,
        0,
        this.state.canvasSize.width,
        this.state.canvasSize.height
      );
    }, 200);
  }

  /**
   * 描述  获取图片track
   * @date 2022-03-23
   * @returns {any} 返回Canvas的track
   */
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
