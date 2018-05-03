/**
 * @fileOverview Meteor Client Method Sender class.
 */

import SenderBase from "./SenderBase";
import Logger from "../Logger";

/**
 * MeteorClientMethodSender send data from the client to the server over DDP.
 *
 * @extends SenderBase
 */
const MeteorClientMethodSender = class extends SenderBase {
  /**
   * @constructor
   *
   * @param {String} loggerUrl
   *   The absolute URL of the logger server. Usually /logger on the Meteor app.
   */
  constructor() {
    super();
    if (!Meteor || !Meteor.isClient) {
      throw new Error("MeteorClientMethodSender is only meant for Meteor client side.");
    }
  }

  send(level, message, context) {
    let data = { level, message };
    if (typeof context !== "undefined") {
      data.context = context;
    }

    Meteor.call(Logger.METHOD, data);
  }
};

export default MeteorClientMethodSender;

