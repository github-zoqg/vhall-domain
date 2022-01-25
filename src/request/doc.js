import request from '@/utils/http.js';
// import contextServer from "@/domain/common/context.server.js"

// 获取文档列表(资料库所有文档)
const getAllDocList = (params = {}) => {
  return request({
    url: '/v3/interacts/document/get-shared-document-list',
    method: 'GET',
    data: params
  });
};

// 获取文档列表(当前活动下)
const getWebinarDocList = (params = {}) => {
  return request({
    url: '/v3/interacts/document/get-webinar-document-list',
    method: 'POST',
    data: params
  });
};

// 获取文档详情
const getDocDetail = (params = {}) => {
  return request({
    url: '/v3/interacts/document/get-shared-document-list',
    method: 'GET',
    data: params
  });
};

// 同步文档
const syncDoc = (params = {}) => {
  return request({
    url: '/v3/interacts/document/clone-from-shared-document',
    method: 'GET',
    data: params
  });
};

// 删除文档(多选)
const delDocList = (params = {}) => {
  return request({
    url: '/v3/interacts/document/batch-remove-reference',
    method: 'POST',
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
