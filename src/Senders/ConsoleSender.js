/**
 * @fileOverview Console Sender class.
 */
import LogLevel from "../LogLevel";
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
  send(level, message, context) {
    const methods = [
      console.error,
      console.error,
      console.error,
      console.error,
      console.warn,
      console.warn,
      console.info,
      console.log
    ];

    const method = methods[level].bind(console);
    method(LogLevel.Names[level], message, context);
  }
};

export default ConsoleSender;
