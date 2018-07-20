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
    if (typeof console === "undefined" || console === null || typeof console !== "object") {
      throw new Error("Console sender needs a console object.");
    }
    ["log", "info", "warn", "error"].forEach((method) => {
      if (typeof console[method] === "undefined") {
        throw new Error(`Console is missing method ${method}.`);
      }
      if (console[method].constructor.name !== "Function") {
        throw new Error(`Console property method ${method} is not a function.`);
      }
    });
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
    method(LogLevel.Names[level], message, context);
  }
};

export default ConsoleSender;
