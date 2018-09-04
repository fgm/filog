import InvalidArgumentException from "./InvalidArgumentException";
import * as LogLevel from "./LogLevel";

import ClientLogger from "./ClientLogger";
import Logger from "./Logger";
import ServerLogger from "./ServerLogger";

import { BrowserProcessor } from "./Processors/BrowserProcessor";
import MeteorUserProcessor from "./Processors/MeteorUserProcessor";
import ProcessorBase from "./Processors/ProcessorBase";
import RoutingProcessor from "./Processors/RoutingProcessor";

import LeveledStrategy from "./Strategies/LeveledStrategy";
import StrategyBase from "./Strategies/StrategyBase";
import TrivialStrategy from "./Strategies/TrivialStrategy";

import ConsoleSender from "./Senders/ConsoleSender";
import MeteorClientHttpSender from "./Senders/MeteorClientHttpSender";
import MeteorClientMethodSender from "./Senders/MeteorClientMethodSender";
import MongodbSender from "./Senders/MongodbSender";
import NullSender from "./Senders/NullSender";
import SenderBase from "./Senders/SenderBase";
import TeeSender from "./Senders/TeeSender";

/* modern-syslog is not usable on the client side, because it fails to load
 * its compiled binary dependency, hence the dynamic require and tslint disable.
 *
 * @type {NullSender|SyslogSender}
 */
const SyslogSender = Meteor.isServer
  // tslint:disable-next-line
  ? require("./Senders/SyslogSender").default
  : NullSender;

export {
  InvalidArgumentException,
  LogLevel,

  Logger,
  ClientLogger,
  ServerLogger,

  // ProcessorBase is the "abstract" base class from which to extend custom processors.
  ProcessorBase,
  BrowserProcessor,
  MeteorUserProcessor,
  RoutingProcessor,

  // StrategyBase is the "abstract" base class from which to extend custom strategies.
  StrategyBase,
  LeveledStrategy,
  TrivialStrategy,

  // SenderBase is the "abstract" base class from which to extend custom senders.
  SenderBase,
  NullSender,
  ConsoleSender,
  MeteorClientHttpSender,
  MeteorClientMethodSender,
  MongodbSender,
  SyslogSender,
  TeeSender,
};
