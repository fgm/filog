import SenderBase from './SenderBase';
import NullFn from '../NullFn';

export default class MeteorClientHttpSender extends SenderBase {
  /**
   * @constructor
   *
   * @param {String} loggerUrl
   *   The absolute URL of the logger server. Usually /logger on the Meteor app.
   */
  constructor(loggerUrl) {
    super();
    if (!Meteor || !Meteor.isClient) {
      throw new Error('MeteorClientHttpSender is only meant for Meteor client side.');
    }
    if (!HTTP) {
      throw new Error('MeteorClientHttpSender needs the Meteor http package to be active.');
    }

    this.http = HTTP;
    this.loggerUrl = loggerUrl;
    this.requestHeaders = {
      'Content-Type': 'application/json'
    };
  }

  send(level, message, context) {
    let data = { level, message };
    if (typeof context !== 'undefined') {
      data.context = context;
    }

    let options = {
      data,
      headers: this.requestHeaders
    };
    this.http.post(this.loggerUrl, options, NullFn);
  }
}
