import {meeting, entryformApi, user} from '@/request/index.js';
import roomBase from "@/request/roomBase.js";
import {setRequestHeaders} from "@/utils/http.js";

class KeyLoginServer {
  constructor() {
    if (typeof KeyLoginServer.instance === 'object') {
      return KeyLoginServer.instance;
    }
    this.state = {};
    KeyLoginServer.instance = this;
    return this;
  }

  //设置请求头(用于附加灰度id到请求头里)
  setHeaders(headers = {}) {
    setRequestHeaders(headers);
  }

  //获取活动信息
  getWebinarInfo(params = {}) {
    return roomBase.getWebinarInfo(params);
  }

  //获取灰度信息
  getGrayConfig(params = {}, header = {}) {
    return entryformApi.initGrayBefore(params);
  }

  //获取配置信息
  getConfigList(params = {}) {
    return meeting.getConfigList(params);
  }

  //口令登录
  roleLogin(params = {}) {
    return user.roleLogin(params);
  }
}

export default function useKeyLoginServer() {
  if (!KeyLoginServer.instance) {
    KeyLoginServer.instance = new KeyLoginServer();
  }
  return KeyLoginServer.instance;
}