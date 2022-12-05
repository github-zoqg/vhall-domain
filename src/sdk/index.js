import paasSdk from './lib/paas-sdk.js';
import saasSdk from './lib/saas-sdk.js';
import loadjs from 'loadjs';

// paasSdk、SaasSdk的配置
export const ALLSDKCONFIG = Object.assign({}, paasSdk, saasSdk);
class VhallPaasSDK {

  static modules = {}
  /**
   * sdk 加载并执行
   */
  static init(plugins, questionnaireNoDefer) {
    // 'report', 'base'是必须sdk, 如果plugins为空，则默认加载'chat', 'doc', 'player', 'interaction'这4个sdk
    let sdks = ['report', 'base'].concat(plugins || ['chat', 'doc', 'player', 'interaction']);
    // 去重
    sdks = [...new Set(sdks)];
    //问卷配置是否延迟加载
    if (questionnaireNoDefer) {
      ALLSDKCONFIG['questionnaire'].defer = false
    }
    // 筛选出配置了 defer:true 的sdk
    const deferSdks = [];
    for (let i = sdks.length - 1; i >= 0; i--) {
      const key = sdks[i];
      if (ALLSDKCONFIG[key] && ALLSDKCONFIG[key].defer) {
        deferSdks.unshift(key); // 加入到deferSdks数组中
        sdks.splice(i, 1); //从 sdks 中去除该项
      }
    }
    if (deferSdks.length) {
      // deferSdks的处理：延迟下载，延迟执行
      setTimeout(() => {
        for (const k of deferSdks) {
          loadjs(ALLSDKCONFIG[k].url, k, {
            async: false,
            success: function () { },
            error: function (pathsNotFound) { },
            before: function (path, scriptEl) {
              scriptEl.defer = true;
              document.body.appendChild(scriptEl);
              /* return `false` to bypass default DOM insertion mechanism */
              return false;
            }
          });
        }
      })
    }

    // 返回加载sdk的promise数组
    const sdkArr = []
    for (const k of sdks) {
      if (ALLSDKCONFIG[k] && ALLSDKCONFIG[k].url) {
        if (!loadjs.isDefined(k)) {
          sdkArr.push(loadjs(ALLSDKCONFIG[k].url, k, { returnPromise: true }));
        }
      }
    }
    return sdkArr;
  }

  /**
   * 加载report sdk 的单独处理
   * 初始化room时，依赖report sdk前置，需要调用此方法
   */
  static async loadReportSdk() {
    if (!loadjs.isDefined("report")) {
      // report sdk未定义过，直接加载
      return await loadjs(saasSdkCfg['report'].url, "report", { returnPromise: true });
    } else if (!window.ITextbookLog) {
      // report sdk已经定义过,但是未执行完毕，需要等待执行完毕后继续
      return await new Promise((resolve, reject) => {
        loadjs.ready("report", {
          success: function () {
            resolve();
          },
          error: function (depsNotFound) {
            reject(depsNotFound);
          },
        });
      })
    } else {
      return Promise.resolve();
    }
  }
}
window.VhallPaasSDK = VhallPaasSDK
export default VhallPaasSDK;
