import { mountSDK } from '@/utils/loader.js';
import paasSdk from './lib/paas-sdk.js';
class VhallPaasSDK {
  static loadStatus = 'loading';
  //初始化成功回调
  static initSuccessHooks = [];
  //初始化失败回调用
  static initErrorHooks = [];
  static modules = {};
  //加载pass-sdk
  static init(options = { plugins: [] }) {
    this.loadSdk(options.plugins);
    return this;
  }
  static async loadSdk(plugins) {
    const sdklist = ['report', 'base', ...plugins].map(item => {
      return mountSDK(paasSdk[item]);
    });
    try {
      const loadres = await Promise.all(sdklist);
      this.loadStatus = 'success';
      loadres.forEach(item => {
        item && (this.modules[item] = window[item]);
      });
      //消费注册成功的回调，并返回注册成功的模块
      while (this.initSuccessHooks.length > 0) {
        this.initSuccessHooks.splice(0, 1)[0](this.modules);
      }
    } catch (error) {
      this.loadStatus = 'failed';
      //消费注册失败的回调
      while (this.initErrorHooks.length > 0) {
        this.initErrorHooks.splice(0, 1)[0]();
      }
      console.error('加载vhall-pass-sdk失败', error);
    }
  }
  //注册加载成功回调
  static onSuccess(callback) {
    if (this.loadStatus === 'success') {
      callback(this.modules);
      return this;
    }
    this.initSuccessHooks.push(callback);
    return this;
  }
  //注册加载失败回调
  static OnError(callback) {
    if (this.loadStatus === 'failed') {
      callback(this);
      return this;
    }
    this.initErrorHooks.push(callback);
    return this;
  }
}
export default VhallPaasSDK;
