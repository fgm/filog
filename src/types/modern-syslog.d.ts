declare module "modern-syslog" {
  // tslint:disable-next-line
  export interface level {
    LOG_LEVEL0: number;
    LOG_LEVEL1: number;
    LOG_LEVEL2: number;
    LOG_LEVEL3: number;
    LOG_LEVEL4: number;
    LOG_LEVEL5: number;
    LOG_LEVEL6: number;
    LOG_LEVEL7: number;
    emergency: number;
    alert: number;
    critical: number;
    error: number;
    warning: number;
    notice: number;
    info: number;
    debug: number;
  }

  // tslint:disable-next-line
  export interface facility {
    kern: number;
    user: number;
    mail: number;
    daemon: number;
    auth: number;
    syslog: number;
    lpr: number;
    news: number;
    uucp: number;
    clock: number;
    authpriv: number;
    ftp: number;
    ntp: number;
    logaudit: number;
    logalert: number;
    cron: number;
    LOG_LOCAL0: number;
    LOG_LOCAL1: number;
    LOG_LOCAL2: number;
    LOG_LOCAL3: number;
    LOG_LOCAL4: number;
    LOG_LOCAL5: number;
    LOG_LOCAL6: number;
    LOG_LOCAL7: number;
  }

  // tslint:disable-next-line
  export interface option {
    LOG_PID: number;
  }

  // Facilities
  export const LOG_KERN = 0;
  export const LOG_USER = 1;
  export const LOG_MAIL = 2;
  export const LOG_DAEMON = 3;
  export const LOG_AUTH = 4;
  export const LOG_SYSLOG = 5;
  export const LOG_LPR = 6;
  export const LOG_NEWS = 7;
  export const LOG_UUCP = 8;
  export const LOG_CLOCK = 9;
  export const LOG_AUTHPRIV = 10;
  export const LOG_FTP = 11;
  export const LOG_NTP = 12;
  export const LOG_LOGAUDIT = 13;
  export const LOG_LOGALERT = 14;
  export const LOG_CRON = 15;
  export const LOG_LOCAL0 = 16;
  export const LOG_LOCAL1 = 17;
  export const LOG_LOCAL2 = 18;
  export const LOG_LOCAL3 = 19;
  export const LOG_LOCAL4 = 20;
  export const LOG_LOCAL5 = 21;
  export const LOG_LOCAL6 = 22;
  export const LOG_LOCAL7 = 23;

  // RFC 5424 Levels
  export const LOG_DEBUG = 7;
  export const LOG_INFO = 6;
  export const LOG_NOTICE = 5;
  export const LOG_WARNING = 4;
  export const LOG_ERROR = 3;
  export const LOG_CRITICAL = 2;
  export const LOG_ALERT = 1;
  export const LOG_EMERG = 0;

  // Options
  export const LOG_PID = -1;
  export const LOG_ODELAY = -1;

  export const core: {
    level: {
      LOG_DEBUG: number,
      LOG_INFO: number;
      LOG_NOTICE: number;
      LOG_WARNING: number;
      LOG_ERROR: number;
      LOG_CRITICAL: number;
      LOG_ALERT: number;
      LOG_EMERG: number;
    };
    toFacility: (facility: string|number) => number;
    toLevel: (level: string|number) => number;
    syslog(level: number, message: string, callback: () => void): void;
  };

  export function init(ident: string, option: number, facility: number): void;
  export function log(level: number, message: string): void;
  export function open(ident: string, option: number, facility: number): void;
}
