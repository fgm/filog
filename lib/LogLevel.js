"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @fileOverview Package exported constants.
 */

var Names = ["Emergency", "Alert", "Critical", "Error", "Warning", "Notice", "Informational", "Debug"];

var EMERGENCY = 0;
var ALERT = 1;
var CRITICAL = 2;
var ERROR = 3;
var WARNING = 4;
var NOTICE = 5;
var INFORMATIONAL = 6;
var INFO = 6;
var DEBUG = 7;

exports.default = {
  Names: Names,

  EMERGENCY: EMERGENCY,
  ALERT: ALERT,
  CRITICAL: CRITICAL,
  ERROR: ERROR,
  WARNING: WARNING,
  NOTICE: NOTICE,
  INFO: INFO,
  INFORMATIONAL: INFORMATIONAL,
  DEBUG: DEBUG
};