/**
 * 挂件
 * @returns
 */
export default function usePendantServer() {
  let state = {};

  // /v4/pendant/default-fixed 「获取固定挂件」
  function getDefaultFixedPendant() {}

  // /v4/pendant/list-push-pendant 「」
  function getPendantList() {}

  // /v4/pendant/push-screen
  function pushPendant() {}

  // msg:暂缺

  return { state, getDefaultFixedPendant, getPendantList, pushPendant };
}
