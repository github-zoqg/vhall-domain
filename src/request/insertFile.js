import $http from '@/utils/http.js';
import contextServer from '@/domain/common/context.server.js';

// 获取插播文件列表
const getInsertFileList = (params = {}) => {
  const { state } = contextServer.get('roomBaseServer');

  const retParmams = {
    webinar_id: params.webinarId || state.watchInitData.webinar.id,
    is_no_check: params.is_no_check || 1,
    pos: params.pos || 0,
    limit: params.limit || 10,
    get_no_trans: params.get_no_trans || 1
  };
  if (params.name) {
    retParmams.name = params.name;
  }

  return $http({
    url: '/v3/webinars/waiting-file/get-list',
    type: 'POST',
    data: retParmams
  });
};

// 删除插播文件
const deleteInsertFile = (params = {}) => {
  return $http({
    url: '/v3/webinars/waiting-file/deletes',
    type: 'POST',
    data: params
  });
};

const insertFile = {
  getInsertFileList,
  deleteInsertFile
};

export default insertFile;
