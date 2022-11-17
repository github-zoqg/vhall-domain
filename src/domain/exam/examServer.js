import BaseServer from '../common/base.server';

class ExamServer extends BaseServer {

  constructor(options) {
    this.state = {

    }
  }





}



export default function useExamServer(options = {}) {
  if (!useExamServer.instance) {
    new useExamServer.instance = new ExamServer(options)
  }
  return useExamServer.instance
}
