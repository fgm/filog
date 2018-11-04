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
  /**
   * @constructor
   *
   * @param {Boolean} devMode
   *   Optional: Print only short logs, omitting the context. Defaults to false.
   */
  constructor(devMode = false) {
    super();
    if (!console) {
      throw new Error("Console sender needs a console object.");
    }

    this.devMode = devMode;
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
      console.log,
    ];

    const method = methods[level].bind(console);

    if (this.devMode) {
      method(LogLevel.Names[level], message);
    }
    else {
      method(LogLevel.Names[level], message, context);
    }
  }
};

export default ConsoleSender;
