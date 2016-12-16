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
   * @param {ProcessorBase[]} processors
   *   Optional. Processors to be applied by this sender instead of globally.
   */
  constructor(processors = []) {
    super(processors);
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

    const processedContext = super.send(level, message, context);
    const method = methods[level].bind(console);
    method(LogLevel.Names[level], message, processedContext);
    return processedContext;
  }
};

export default ConsoleSender;
