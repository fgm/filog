/**
 * @fileOverview Console Sender class.
 *
 * Because this file is about actually using the console, it has to disable the
 * no-console rule.
 */
/* tslint:disable:no-console */

import * as LogLevel from "../LogLevel";
import {ISender} from "./ISender";
import { SenderBase } from "./SenderBase";

/**
 * ConsoleSender sends the log events it receives to the browser console.
 *
 * @extends SenderBase
 */
const ConsoleSender = class extends SenderBase implements ISender {
  constructor() {
    super();
    // Checkint "if (!(console instanceof Console)" compiles, but fails to
    // execute during tests, which run in Node.JS in which Console is not a type
    // but only the name of the console constructor. Since checking
    // console.constructor.name is liable to fail in minified code, we need a
    // weaker check.
    if (typeof console === "undefined" || console === null || typeof console !== "object") {
      throw new Error("Console sender needs a console object.");
    }
    ["log", "info", "warn", "error"].forEach((method) => {
      if (typeof console[method as keyof Console] === "undefined") {
        throw new Error(`Console is missing method ${method}.`);
      }
      if (console[method as keyof Console].constructor.name !== "Function") {
        throw new Error(`Console property method ${method} is not a function.`);
      }
    });
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
