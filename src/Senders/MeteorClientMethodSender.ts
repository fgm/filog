/** global: Meteor */

/**
 * @fileOverview Meteor Client Method Sender class.
 */

import { Logger } from "../Loggers/Logger";
import { SenderBase } from "./SenderBase";

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
    if (typeof Meteor === "undefined" || !Meteor.isClient) {
      throw new Error("MeteorClientMethodSender is only meant for Meteor client side.");
    }
  }

  /** @inheritDoc */
  public send(level: number, message: string, context: object): void {
    const data = { level, message, context: {} };
    if (typeof context !== "undefined") {
      data.context = context;
    }

    Meteor.call(Logger.METHOD, data);
  }
};

export default MeteorClientMethodSender;
