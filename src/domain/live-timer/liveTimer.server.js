import { liveTimerApi } from '@/request/index.js';

export default function liveTimerServer() {
  function timerCreate(params) {
    return liveTimerApi.timerCreate(params);
  }
  function getTimerInfo(params) {
    return liveTimerApi.getTimerInfo(params);
  }
  function timerEdit(params) {
    return liveTimerApi.timerEdit(params);
  }
  return { timerCreate, getTimerInfo, timerEdit };
}
