/**
 * 礼物服务
 * @returns
 */
export default function useGiftServer() {
    let state = {};

    // /v3/interacts/gift/get-webinar-using-gift-list
    function getGiftList() {}

    // /v3/interacts/gift/send-gift 「赠送礼物」
    function sendGift() {}

    // /v3/interacts/gift/create-webinar-gift 「创建礼物」
    function createGift() {}

    // msg:暂缺

    return { state, getGiftList, sendGift, createGift };
}
