import InvalidArgumentException from "./InvalidArgumentException";
import * as LogLevel from "./LogLevel";

import { ClientLogger } from "./Loggers/ClientLogger";
import { Logger } from "./Loggers/Logger";
import { ServerLogger } from "./Loggers/ServerLogger";

import { BrowserProcessor } from "./Processors/BrowserProcessor";
import { MeteorUserProcessor } from "./Processors/MeteorUserProcessor";
import { ProcessorBase } from "./Processors/ProcessorBase";
import { RoutingProcessor } from "./Processors/RoutingProcessor";

import { LeveledStrategy } from "./Strategies/LeveledStrategy";
import { StrategyBase } from "./Strategies/StrategyBase";
import { TrivialStrategy } from "./Strategies/TrivialStrategy";

import { ConsoleSender } from "./Senders/ConsoleSender";
import { MeteorClientHttpSender } from "./Senders/MeteorClientHttpSender";
import { MeteorClientMethodSender } from "./Senders/MeteorClientMethodSender";
import { MongodbSender } from "./Senders/MongodbSender";
/* modern-syslog is not usable on the client side, because it fails to load
 * its compiled binary dependency. It is removed by the bundler because of the
 * "browser" key in package.json.
 */
import { NullSender } from "./Senders/NullSender";
import { SenderBase } from "./Senders/SenderBase";
import { TeeSender } from "./Senders/TeeSender";

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
  TeeSender,
};
