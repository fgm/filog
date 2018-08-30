/**
 * @fileOverview Console Sender class.
 *
 * Because this file is about actually using the console, it has to disable the
 * no-console rule.
 */
/* tslint:disable:no-console */

import * as LogLevel from "../LogLevel";
import SenderBase from "./SenderBase";

/**
 * ConsoleSender sends the log events it receives to the browser console.
 *
 * @extends SenderBase
 */
const ConsoleSender = class extends SenderBase {
  constructor() {
    super();
    if (!console) {
      throw new Error("Console sender needs a console object.");
    }
  }

  /** @inheritDoc */
  public send(level: LogLevel.Levels, message: string, context: object) {
    const methods = [
      console.error,
      console.error,
      console.error,
      console.error,
      console.warn,
      console.warn,
      console.info,
      console.log,
    ];

    const method = methods[level].bind(console);
    method(LogLevel.Names[level], message, context);
  }
};

export default ConsoleSender;
