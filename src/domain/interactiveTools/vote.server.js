/**
 * 投票服务
 * @returns
 */
export default function useVoteServer() {
  let state = {};

  // /v4/vote/list 「投票列表、资料库列表」
  function getVoteList() {}

  // api.vhallyun.com/sdk/v2/form/create 「创建投票 - sdk」
  function createVote() {}

  // /v4/vote/copy 「从资料库拷贝」
  function copyVote() {}

  // v4/vote/publish 「主持人发布投票」
  function publishVote() {}

  // api.vhallyun.com/sdk/v2/form/get 「编辑、预览 投票细节 - sdk」
  function getVoteDetail() {}

  // v4/vote/vote-finish 「结束投票」
  function finishVote() {}

  // v4/vote/vote-push 「发布投票结果」
  function pushVote() {}

  // v4/vote/delete 「删除投票」
  function deleteVote() {}

  // v4/vote/answer 「提交回复投票」
  function answerVote() {}

  // msg:暂缺

  return {
    state,
    getVoteList,
    createVote,
    copyVote,
    publishVote,
    getVoteDetail,
    finishVote,
    pushVote,
    deleteVote,
    answerVote
  };
}
