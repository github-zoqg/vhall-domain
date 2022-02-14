import { giftsApi } from '@/request/index.js';

export default function useGiftsServer() {
  function queryGiftsList(params) {
    return giftsApi.queryGiftsList(params);
  }
  return { queryGiftsList };
}
