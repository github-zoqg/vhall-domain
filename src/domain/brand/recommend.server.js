import BaseServer from '../common/base.server.js';
import { recommendApi } from '@/request';

class RecommendServer extends BaseServer {
  constructor() {
    if (typeof RecommendServer.instance === 'object') {
      return RecommendServer.instance;
    }

    super();
  }

  queryAdsList(data = {}) {
    return recommendApi.queryAdsList(data)
  }
}

export default function useRecommendServer() {
  if (!useRecommendServer.instance) {
    useRecommendServer.instance = new RecommendServer();
  }

  return useRecommendServer.instance;
}
