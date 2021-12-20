/**
 * 定时器服务
 * @returns 
 */
export default function useTimerServer() {
    let state = {};

    // /v3/interacts/timer/create
    function createTimer() {}

    // /v3/interacts/timer/edit 「操作计时器」
    function editTimer() {}

    // base on editTimer 「？」「暂停timer」
    function pauseTimer() {}

    // base on editTimer 「？」「停止timer」
    function closeTimer() {}

    return { state, createTimer, editTimer, pauseTimer, closeTimer };
}
