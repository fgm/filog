import LogLevel from './LogLevel';
import ServerLogger from './ServerLogger';
import ClientLogger from './ClientLogger';

import BrowserProcessor from './Processors/BrowserProcessor';
import MeteorUserProcessor from './Processors/MeteorUserProcessor';
import MeteorUserFilterProcessor from './Processors/MeteorUserFilterProcessor';
import RoutingProcessor from './Processors/RoutingProcessor';

import LeveledStrategy from './Strategies/LeveledStrategy';

import NullSender from './Senders/NullSender';
import ConsoleSender from './Senders/ConsoleSender';
import MeteorClientHttpSender from './Senders/MeteorClientHttpSender';
import MongodbSender from './Senders/MongodbSender';

/**
 * modern-syslog is not usable on the client side, because it fails to load
 * its compiled binary dependency.
 *
 * @type {NullSender|SyslogSender}
 */
const SyslogSender = Meteor.isServer
  ? require('./Senders/SyslogSender').default
  : NullSender;

export {
  LogLevel,

  ClientLogger,
  ServerLogger,

  BrowserProcessor,
  MeteorUserProcessor,
  MeteorUserFilterProcessor,
  RoutingProcessor,

  LeveledStrategy,

  NullSender,
  ConsoleSender,
  MeteorClientHttpSender,
  MongodbSender,
  SyslogSender
};
