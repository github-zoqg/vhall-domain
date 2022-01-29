import $http from '@/utils/http.js';
import requestApi from "@/request/index.js";

const qaApi = requestApi.qa;

/**
 * 问答服务
 * @returns
 */
export default function useQaServer() {
  let state = {

  };


  function v3InitChatMess(params= {}) {
    return qaApi.list.v3InitChatMess(params).then(res => {
      console.log("qaApi v3InitChatMess--------->", res);
      return res;
    });
  }

  function v3GetQa(params = {}) {
    return requestApi.qa.list.v3GetQa(params);
  }

  function v3CloseQa(params = {}) {
    return requestApi.qa.list.v3CloseQa(params);
  }

  function v3GetQaNum(params = {}) {
    return requestApi.qa.list.v3CloseQa(params);
  }

  function v3ReplayUserQu(params = {}) {
    return requestApi.qa.list.v3CloseQa(params);
  }

  function getAutherQa(params = {}) {
    return requestApi.qa.list.v3CloseQa(params);
  }

  function sendPrivateMsg(params = {}) {
    return requestApi.qa.list.v3CloseQa(params);
  }

  function v3GetTextReply(params = {}) { }

  function v3Revoke(params = {}) { }

  function v3GetPrivateList(params = {}) { }

  function v3GetPrivCon(params = {}) { }

  function v3SetUser(params = {}) { }

  return {
    state,
    v3InitChatMess,
    v3GetQa,
    v3CloseQa,
    v3GetQaNum,
    v3ReplayUserQu,
    getAutherQa,
    sendPrivateMsg,
    v3GetTextReply,
    v3Revoke,
    v3GetPrivateList,
    v3GetPrivCon,
    v3SetUser
  };
}
