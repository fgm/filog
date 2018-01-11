"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Null function.
 *
 * Used to provide a short-circuit, like the NullSender replacement in
 * LeveledStrategy, or to provide a stub methods, as needed for the asynchronous
 * post in MeteorclientHttpSender.
 *
 * @see MeteorClientHttpSender#send
 * @see LeveledStrategy#customizeLogger
 *
 * @constructor
 */
var NullFn = function NullFn() {};

exports.default = NullFn;