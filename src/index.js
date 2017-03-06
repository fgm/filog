import InvalidArgumentException from "./InvalidArgumentException";
import LogLevel from "./LogLevel";
import ServerLogger from "./ServerLogger";
import ClientLogger from "./ClientLogger";

import BrowserProcessor from "./Processors/BrowserProcessor";
import MeteorUserProcessor from "./Processors/MeteorUserProcessor";
import RoutingProcessor from "./Processors/RoutingProcessor";

import LeveledStrategy from "./Strategies/LeveledStrategy";
import TrivialStrategy from "./Strategies/TrivialStrategy";

import NullSender from "./Senders/NullSender";
import ConsoleSender from "./Senders/ConsoleSender";
import MeteorClientHttpSender from "./Senders/MeteorClientHttpSender";
import MongodbSender from "./Senders/MongodbSender";
import TeeSender from "./Senders/TeeSender";

/* modern-syslog is not usable on the client side, because it fails to load
 * its compiled binary dependency.
 *
 * @type {NullSender|SyslogSender}
 */
const SyslogSender = Meteor.isServer
  ? require("./Senders/SyslogSender").default
  : NullSender;

export {
  InvalidArgumentException,
  LogLevel,

  ClientLogger,
  ServerLogger,

  BrowserProcessor,
  MeteorUserProcessor,
  RoutingProcessor,

  LeveledStrategy,
  TrivialStrategy,

  NullSender,
  ConsoleSender,
  MeteorClientHttpSender,
  MongodbSender,
  SyslogSender,
  TeeSender
};
