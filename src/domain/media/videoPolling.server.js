import BaseServer from '../common/base.server';
class VideoPollingServer extends BaseServer {
  constructor() {
    super();
    if (typeof VideoPollingServer.instance === 'object') {
      return VideoPollingServer.instance;
    }
    this.state = {
    };
    VideoPollingServer.instance = this;

    return this;
  }
}
export default function useVideoPollingServer() {
  return new VideoPollingServer();
}
