/**
 * 抽奖服务
 * @returns
 */
export default function useLotteryServer() {
    let state = {};

    // /v3/vss/lottery/add 「发起抽奖」
    function pushLottery() {}

    // /v3/vss/lottery/end 「结束抽奖」
    function finishLottery() {}

    // /v3/vss/lottery/post/get-prize-list 「展示获奖列表」
    function getPrizeList() {}

    // /v3/vss/lottery/update-user-status 「设置中奖人数」
    function setWinnerNumbers() {}

    // /v3/vss/lottery/search 「预设中奖人」
    function setDefaultWinner() {}

    // /v3/vss/lottery/search 「设置可重复中奖」
    function setRepeatableWin() {}

    // /v3/vss/lottery/award/check 「聊天内点击」
    function resultCheck() {}

    // /v3/vss/lottery/check 「点击抽奖图标」
    function check() {}

    // /v3/vss/lottery/users-get 「设置是否公布中奖结果」
    function setPublishResult() {}

    // /v3/vss/lottery/watch/get-draw-prize-info 「填写信息采集表单，中奖用户」
    function getDrawPrizeInfo() {}

    // /v3/vss/lottery/award
    function getAwardInfo() {}

    // /v4/lottery/count 「获取在线人数」
    function getLotteryCount() {}

    // msg:暂缺

    return {
        state,
        pushLottery,
        finishLottery,
        getPrizeList,
        setWinnerNumbers,
        setDefaultWinner,
        setRepeatableWin,
        resultCheck,
        check,
        setPublishResult,
        getDrawPrizeInfo,
        getAwardInfo,
        getLotteryCount,
    };
}
