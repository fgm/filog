/**
 * @fileOverview
 * Package exported constants.
 */
declare const Names: string[];
declare const EMERGENCY = 0;
declare const ALERT = 1;
declare const CRITICAL = 2;
declare const ERROR = 3;
declare const WARNING = 4;
declare const NOTICE = 5;
declare const INFORMATIONAL = 6;
declare const INFO = 6;
declare const DEBUG = 7;
declare enum Levels {
    EMERGENCY = 0,
    ALERT = 1,
    CRITICAL = 2,
    ERROR = 3,
    WARNING = 4,
    NOTICE = 5,
    INFORMATIONAL = 6,
    INFO = 6,
    DEBUG = 7
}
export { Names, Levels, EMERGENCY, ALERT, CRITICAL, ERROR, WARNING, NOTICE, INFO, INFORMATIONAL, DEBUG, };
