import $http from '@/utils/http.js';
// import contextServer from "@/domain/common/context.server.js"

// 获取文档列表(资料库所有文档)
const getAllDocList = (params = {}) => {
  return $http({
    url: '/v3/interacts/document/get-shared-document-list',
    type: 'GET',
    data: params
  });
};

// 获取文档列表(当前活动下)
const getWebinarDocList = (params = {}) => {
  return $http({
    url: '/v3/interacts/document/get-webinar-document-list',
    type: 'POST',
    data: params
  });
};

// 获取文档详情
const getDocDetail = (params = {}) => {
  return $http({
    url: '/v3/interacts/document/get-shared-document-list',
    type: 'GET',
    data: params
  });
};

// 同步文档
const syncDoc = (params = {}) => {
  return $http({
    url: '/v3/interacts/document/clone-from-shared-document',
    type: 'GET',
    data: params
  });
};

// 删除文档(多选)
const delDocList = (params = {}) => {
  return $http({
    url: '/v3/interacts/document/batch-remove-reference',
    type: 'POST',
    data: params
  });
};

export default {
  getAllDocList,
  getWebinarDocList,
  getDocDetail,
  syncDoc,
  delDocList
};
