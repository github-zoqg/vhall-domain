import request from '@/utils/http.js';
import env from './env';

// 获取资料库文档列表
const getSharedDocList = (params = {}) => {
  const url =
    env.doc === 'v3'
      ? '/v3/interacts/document/get-shared-document-list'
      : '/v4/im-whiteboard/document/get-shared-document-list';
  return request({
    url,
    method: 'GET',
    params: params
  });
};

// 获取当前活动下文档列表
const getWebinarDocList = (params = {}) => {
  const url =
    env.doc === 'v3'
      ? '/v3/interacts/document/get-webinar-document-list'
      : '/v4/im-whiteboard/document/get-webinar-document-list';
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 同步文档
const syncDoc = (params = {}) => {
  const url =
    env.doc === 'v3'
      ? '/v3/interacts/document/clone-from-shared-document'
      : '/v4/im-whiteboard/document/document-bind';
  return request({
    url,
    method: 'POST',
    data: params
  });
};

// 删除文档(多选)
const delDocList = (params = {}) => {
  const url =
    env.doc === 'v3'
      ? '/v3/interacts/document/batch-remove-reference'
      : '/v4/im-whiteboard/document/batch-detele'; // 控制台
  return request({
    url,
    method: 'POST',
    data: params
  });
};

export default {
  getSharedDocList,
  getWebinarDocList,
  syncDoc,
  delDocList
};
