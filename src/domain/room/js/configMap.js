export const configMap = function (data) {
  const keyMap = {
    100001: 'ui.hide_logo_but_show_login',
    100002: 'ui.hide_live_helper',
    100003: 'ui.hide_favicon',
    100004: 'ui.hide_hostOnly',
    100005: 'ui.hide_share',
    // 100008: 发起端没用
    // 100008: 'ui.hide_guest_normal_userlist',
    // 100008: 'ui.hide_assistant_userlist',
    // 100009: ui.hide_host_userlist_nums/ui.hide_host_userlist_nums
    100009: 'ui.hide_host_nums',
    100010: 'ui.hide_handsUp',
    100011: 'close_assistant_flip_doc',
    100012: 'ui.hide_survey',
    100013: 'members_manager',
    100014: 'ui.hide_lottery',
    100015: 'comment_check',
    100016: 'ui.is_hide_qa_button',
    100017: 'disable_msg',
    100018: 'ui.show_redpacket',
    100019: 'webinar_notice',
    100020: 'cut_record',
    100021: 'ui.hide_live_end',
    100022: 'ui.hide_sign_in',
    100023: 'btn_thirdway',
    100024: 'is_interact_and_host',
    100025: 'is_interact',
    100026: 'is_membermanage',
    100027: 'rebroadcast',
    100028: 'virtual_user',
    100029: 'close_assistant_flip_doc',
    100030: 'hide-document',
    100033: 'waiting.video.file',
    100034: 'webinar.timer',
    100035: 'webinar.group',
  }
  let m = new Map()
  data.map(item => {
    m.set(keyMap[item], 1)
  })
  return JSON.stringify(_mapToObj(m))
}

function _mapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj
}
