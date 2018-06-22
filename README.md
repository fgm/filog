FiLog: a Meteor 1.4-1.6 logging package
=======================================
Test PR for Code Climate Test Coverage troubleshooting

[![Build Status](https://travis-ci.org/fgm/filog.svg?branch=master)](https://travis-ci.org/fgm/filog)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f380bfd73a491c472221/test_coverage)](https://codeclimate.com/github/fgm/filog/test_coverage)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/fgm/filog/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/fgm/filog/?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/fgm/filog/badge.svg?targetFile=package.json)](https://snyk.io/test/github/fgm/filog?targetFile=package.json)

Based upon NPM packages::

* Stack capture and standardization: https://www.npmjs.com/package/tracekit
* Meteor user capture in call stack: https://www.npmjs.com/package/callsite

Read the [Documentation](https://fgm.github.io/filog).


Configuration and usage
-----------------------

#### Main ideas:

* A logged event is a `(level, message, context)` triplet, in which
    * `level` is an RFC5424 number (0..7)
    * `message` is a plain string or can be converted to one automatically
    * `context` is a plain Object
* the package has no configuration of its own, it is entirely
  configured by its users, the client- and server-side Meteor parts of the
  application.
* Both client and server applications may capture exception stack traces and log
  them for plain errors (`window.onerror` handling) and exception reporting.
  This is triggered by the `logger.arm()` method, and can be disabled by the
  `logger.disarm()` method.

#### Typical use case:

- `client/main.js`:
  - instantiates any number of "processors": instances of classes derived from
    `ProcessorBase`. These are able to add information to a message on its way
    to the logging destination. Current concrete processors are:
    - `BrowserProcessor`: adds browser-related information, such as user
      agent, platform, operating system, client memory
    - `MeteorUserProcessor`: adds user-related information if any is
      available. Assumes the application is configured with some Meteor
      accounts package, like `fgm:accounts-drupal`.
    - `RoutingProcessor`: adds request-related information, such as the
      path being served.
  - instantiates any number of "senders": instances of classes derived from
    `SenderBase`. These are able to receive a `(level, message, context)`
    triplet ("event") and forward it somwhere else. Current concrete senders
    are:
    - `ConsoleSender`: output the message using `console.log`
    - `MeteorClientHttpSender`: HTTP POST the message to the Meteor server
      present at the URL defined by the Meteor-standard `ROOT_URL`
      environment variable.
    - `MongodbSender`: store the event in a collection in the Meteor MongoDB
      database instance (or the minimongo on the client).
    - `NullSender`: ignore the message.
    - `SyslogSender`: send the event to syslog (server) or ignore it (client).
    - `TeeSender`: send the event to all sender instances passed to its 
      constructor as an array. Useful to send logs to multiple destinations.
  - instantiate a sending "strategy": instance of a class derived from
    `StrategyBase`. There are able to decide, based on an event, where it
    should be sent by available senders. They may also modify the logger
    instance at the last step of its construction, Two concrete strategies are
    currently available:
    - `LeveledStrategy`: based on the level of the message, it defines three
      severity levels: low, medium, and high, as well as the breakpoints
      between them in terms of RFC5424 levels, and associates a sender
      instance with each of these levels
    - `TrivialStrategy` uses a single sender for all messages. Especially useful 
      for early work client-side, where you want everything to be stored to 
      collect as much information as possible from a limited number of clients.
      May also be useful for tests, to simplify test setup.
  - constructs a `ClientLogger` instance, passing it the strategy instance, like:

          let logger = new ClientLogger(new LeveledStrategy(
            new NullSender(),
            new ConsoleSender(),
            new MeteorClientHttpSender(Meteor.absoluteUrl('logger'))
          ));

  - adds processor instances to the logger instance, like:

          logger.processors.push(
            new BrowserProcessor(),
            new RoutingProcessor(),
            new MeteorUserProcessor(Meteor)
          );

  - is now able to log events, like:

          logger.warn("Some warning condition", { foo: "bar" });

  - with this configuration:
    - logger applies processors to add browser, user, and routing information
      to the message context
    - since warnings are considered worthy of storage (default configuration
      of the `LeveledStrategy` constructor), the logger passes the now-rich
      message to the Meteor server thanks to the `MeteorClientHttpSender`
      sender
    - message arrives server-side.
- `server/main.js`
  - is configured in much the same way as the client, so it has its own `logger`,
    typically configured with just a `MongodbSender` instance for all levels.

        let sender = new MongodbSender(Mongo, 'logger');
        let logger = new ServerLogger(
          new LeveledStrategy(sender, sender, sender),
          WebApp);
        logger.processors.push(new MeteorUserProcessor());

  - in the example above, it receives the POSTed event, and proceed to log it
    - because it has already been processed client-side, it is logged "raw",
      without applying additional processors to it
    - the MongoDb sender instance stores the event.
  - the server may also initiate a logging action, for example in a publish
    function or Meteor method. It can use the same API:

        logger.error("Some server condition", { baz: "quux" }

    - since the message is server-originated, the server processors will be
      applied, to add the Meteor user information to the event
    - the MongoDb sender instance stores the event.


Format note
-----------

- Whatever the enabled processors, the `Logger.log()` method adds a
  millisecond-level timestamp to each context, under the `timestamp.log` key.
- Senders designed to exit the system, like the MongoDB sender, or a syslog or
  logstash Beats forwarder, are expected to add another millisecond-level 
  timestamp, under the `timestamp.store` key.

These two timestamps are here to alleviate any issue resulting from a clock
difference between clients and servers.

Any sender can add extra keys to the context, under the `timestamp` main key,
to enable timing diagnostics.


Running tests
-------------

The module contains tests. Some of them are unit tests and need nothing special
to run, while others are currently implemented as integration tests and assume
you have a working harness project using Filog, exposed on 
`http://localhost:3000`.

Start by compiling the package:

* `meteor run compile`

Then you can run :

* just unit tests with `meteor npm run test-unit` 
* just integration tests with `meteor npm run test-integration`
* both tests with `meteor npm run test`
* both tests including coverage generation with `meteor npm run cover`
 
To run integration tests, you need to run the harness project in one terminal, 
and the tests in another one, and the project needs to have Filog configured.


#### Example server-side code in the harness project

    /**
     * @file server/main.js
     */

    import { Meteor } from 'meteor/meteor';
    import { Mongo } from "meteor/mongo";
    import { WebApp } from "meteor/webapp";

    import {
      ServerLogger,
      MongodbSender,
      TrivialStrategy
    } from "filog";
    
    Meteor.startup(() => {
      const sender = new MongodbSender(Mongo);
      const strategy = new TrivialStrategy(sender);
      global.logger = new ServerLogger(strategy, WebApp);
    });

This file is needed to allow Filog to operate on the `/logger` URL: otherwise, 
Meteor will handle it natively and return a 200 with the default application 
page, failing the integration tests.


#### Terminal 1

    $ cd (my_project)
    $ meteor run --port 3000

#### Terminal 2

    $ cd (my_project)
    $ cd imports/filog
    $ meteor npm run compile
    $ meteor npm run test-integration
    $ meteor npm run test
    $ meteor npm run cover
