declare module "modern-syslog" {
  type Syslog = any;

  enum Facility {
    kern,
    user,
    mail,
    daemon,
    auth,
    syslog,
    lpr,
    news,
    uucp,
    clock,
    authpriv,
    ftp,
    ntp,
    logaudit,
    logalert,
    cron,
    local0,
    local1,
    local2,
    local3,
    local4,
    local5,
    local6,
    local7,
  }
}
