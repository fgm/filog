/**
 * @fileOverview Package exported constants.
 */

const Names = [
  "Emergency",
  "Alert",
  "Critical",
  "Error",
  "Warning",
  "Notice",
  "Informational",
  "Debug",
];

const EMERGENCY = 0;
const ALERT = 1;
const CRITICAL = 2;
const ERROR = 3;
const WARNING = 4;
const NOTICE = 5;
const INFORMATIONAL = 6;
const INFO = 6;
const DEBUG = 7;

enum Levels {
  EMERGENCY,
  ALERT,
  CRITICAL,
  ERROR,
  WARNING,
  NOTICE,
  INFORMATIONAL = 6,
  INFO = 6,
  DEBUG,
}

export {
  Names,
  Levels,

  EMERGENCY,
  ALERT,
  CRITICAL,
  ERROR,
  WARNING,
  NOTICE,
  INFO,
  INFORMATIONAL,
  DEBUG,
};
