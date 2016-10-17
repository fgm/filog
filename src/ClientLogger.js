import Logger from './Logger';

const nullFn = () => null;

class ClientLogger extends Logger {
  /**
   * @constructor
   *
   * @param {Object} http
   *   The Meteor HTTP service.
   * @param {String} loggerUrl
   *   The absolute URL of the logger server. Usually /logger on the Meteor app.
   */
  constructor(http, loggerUrl) {
    super();
    this.http = http;
    this.loggerUrl = loggerUrl;
    this.requestHeaders = {
      'Content-Type': 'application/json'
    };
  }

  log(level, message, context) {
    let data = { level, message };
    if (typeof context !== 'undefined') {
      data.context = context;
    }
    data.context = this.processors.reduce((accu, current, processorIndex, processors) => {
      const result = Object.assign(accu, processors[processorIndex].process(context));
      return result;
    });

    let options = {
      data,
      headers: this.requestHeaders
    };
    this.http.post(this.loggerUrl, options, nullFn);
  }
}

export default ClientLogger;
