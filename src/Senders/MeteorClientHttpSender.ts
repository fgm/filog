/** global: HTTP, Meteor */

/**
 * @fileOverview Meteor Client HTTP Sender class.
 */

import NullFn from "../NullFn";
import { SenderBase } from "./SenderBase";

/**
 * MeteorClientHttpSender send data from the client to the server over HTTP.
 *
 * @extends SenderBase
 */
const MeteorClientHttpSender = class extends SenderBase {
  public http: typeof HTTP;
  public requestHeaders: { [key: string]: string };

  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {String} loggerUrl
   *   The absolute URL of the logger server. Usually /logger on the Meteor app.
   */
  constructor(public loggerUrl: string) {
    super();
    if (typeof Meteor === "undefined" || !Meteor.isClient) {
      throw new Error("MeteorClientHttpSender is only meant for Meteor client side.");
    }
    if (typeof HTTP === "undefined") {
      throw new Error("MeteorClientHttpSender needs the Meteor http package to be active.");
    }

    this.http = HTTP;
    this.requestHeaders = {
      "Content-Type": "application/json",
    };
  }

  /** @inheritDoc */
  public send(level: number, message: string, context: object): void {
    const data = { level, message, context: {} };
    if (typeof context !== "undefined") {
      data.context = context;
    }

    const options = {
      data,
      headers: this.requestHeaders,
    };
    this.http.post(this.loggerUrl, options, NullFn);
  }
};

export default MeteorClientHttpSender;
