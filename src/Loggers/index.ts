import { IContext, IDetails, ITimestamps, KEY_DETAILS, KEY_HOST, KEY_SOURCE, KEY_TS } from "../IContext";
import InvalidArgumentException from "../InvalidArgumentException";
import * as LogLevel from "../LogLevel";

import { ClientLogger } from "./ClientLogger";
import { ILogger } from "./ILogger";
import { Logger } from "./Logger";
import { ServerLogger } from "./ServerLogger";

import { BrowserProcessor } from "../Processors/BrowserProcessor";
import { MeteorUserProcessor } from "../Processors/MeteorUserProcessor";
import { ProcessorBase } from "../Processors/ProcessorBase";
import { RoutingProcessor } from "../Processors/RoutingProcessor";

import { LeveledStrategy } from "../Strategies/LeveledStrategy";
import { StrategyBase } from "../Strategies/StrategyBase";
import { TrivialStrategy } from "../Strategies/TrivialStrategy";

import { ConsoleSender } from "../Senders/ConsoleSender";
import { MeteorClientHttpSender } from "../Senders/MeteorClientHttpSender";
import { MeteorClientMethodSender } from "../Senders/MeteorClientMethodSender";
import { MongodbSender } from "../Senders/MongodbSender";
import { NullSender } from "../Senders/NullSender";
import { TeeSender } from "../Senders/TeeSender";

/* modern-syslog is not usable on the client side, because it fails to load
 * its compiled binary dependency, hence the dynamic require and tslint disable.
 *
 * @type {NullSender|SyslogSender}
 */
const SyslogSender = Meteor.isServer
  // eslint-disable-next-line
  ? require("../Senders/SyslogSender").SyslogSender
  : NullSender;

export {
  // Context.
  IContext,
  IDetails,
  ITimestamps,
  KEY_DETAILS,
  KEY_HOST,
  KEY_SOURCE,
  KEY_TS,

  InvalidArgumentException,
  LogLevel,

  // Loggers.
  ILogger,
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

  NullSender,
  ConsoleSender,
  MeteorClientHttpSender,
  MeteorClientMethodSender,
  MongodbSender,
  SyslogSender,
  TeeSender,
};
