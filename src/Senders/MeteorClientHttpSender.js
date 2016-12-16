/**
 * @fileOverview Meteor Client HTTP Sender class.
 */

import SenderBase from "./SenderBase";
import NullFn from "../NullFn";

/**
 * MeteorClientHttpSender send data from the client to the server over HTTP.
 *
 * @extends SenderBase
 */
const MeteorClientHttpSender = class extends SenderBase {
  /**
   * @constructor
   *
   * @param {ProcessorBase[]} processors
   *   Processors to be applied by this sender instead of globally.
   * @param {String} loggerUrl
   *   The absolute URL of the logger server. Usually /logger on the Meteor app.
   */
  constructor(processors = [], loggerUrl) {
    super(processors);

    if (!Meteor || !Meteor.isClient) {
      throw new Error("MeteorClientHttpSender is only meant for Meteor client side.");
    }
    if (typeof HTTP === "undefined") {
      throw new Error("MeteorClientHttpSender needs the Meteor http package to be active.");
    }

    this.http = HTTP;
    this.loggerUrl = loggerUrl;
    this.requestHeaders = {
      "Content-Type": "application/json"
    };
  }

  send(level, message, context) {
    const processedContext = super.send(level, message, context);
    let data = { level, message };
    if (typeof processedContext !== "undefined") {
      data.context = processedContext;
    }

    let options = {
      data,
      headers: this.requestHeaders
    };
    this.http.post(this.loggerUrl, options, NullFn);
    return processedContext;
  }
};

export default MeteorClientHttpSender;
