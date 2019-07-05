/** global: Meteor */

/**
 * @fileOverview Meteor Client Method Sender class.
 */

import { Logger } from "../Loggers/Logger";
import {ISender} from "./ISender";

/**
 * MeteorClientMethodSender send data from the client to the server over DDP.
 */
class MeteorClientMethodSender implements ISender {

  constructor() {
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
}

export {
  MeteorClientMethodSender,
};
