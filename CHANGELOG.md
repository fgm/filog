# FiLog changelog
## 0.1 series

### 0.1.18

* Logger processors can now delete from the context, not just add/modify keys (#52).
* ProcessorBase, SenderBase, StrategyBase are now exported to make custom versions easier (#50, #51).
* BrowserProcessor now provides actual window.performance.memory values (#55).
* ServerLogger now preserves primitive values of boxed primitives on web-submitted logs (#57).
* ServerLogger now allows the maximum number of listeners on requests to be configured.
* BrowserProcessor no longer provides obsolete "product" key (#54).
* Logger.levelName() now returns valid outputs on invalid inputs too.
* Quality control: Travis CI, CodeClimate, Scrutinizer and Snyk integration.

### 0.1.17

* Added `MeteorClientMethodSender`, a zero-configuration client sender (#47).
* Converted all tests from Mocha/Chai/Istanbul to Jest, and increased coverage.
* Fixed nested `message_details`, `hostname`, `timestamp` introduced in 0.1.15 (#48).
* Upgraded outdated dependencies to NPM 6.0.0 and Sinon 5.0.3.

### 0.1.16

* Removed the no-longer needed dependency on the `bcrypt` package.
* Cleant up the .eslintrc globals, fixed typo in comments.

### 0.1.15

* Added an optional post-process callback to MeteorUserProcessor (#38).
* Moved message details to message_details context key (#37).
* Fixed comment in Logger.log() describing the opposite of reality.

### 0.1.14

* Switched the default serialization format to JSON, with a safety fallback for
  circular structures which JSON cannot represent.
* Legacy "inspect" serialization is now called serializeInspect.
* Package.json commands now use "meteor npm" instead of plain "npm".
* ServerLogger now inserts the hostname in logged messages.

### 0.1.13

* Updated dependencies
* Fixed a NPM packaging issue preventing installation in some cases.

### 0.1.12

* LeveledStrategy.constructor() no longer accepts non-Senders as sender arguments.
* Logger.log() no longer accepts invalid log levels (#26), to match PSR-3.
* Loggers no longer modify the message context (#25).
* Removed incorrect `readme` clause in `package.json`.

### 0.1.11

* Exposed TrivialStrategy to module consumers.
* Fixed incorrect default timestamp generation.
* Upgraded TraceKit to 0.4.4.
* Contributors are now listed.

### 0.1.10 / 0.1.9

* MongodbSender can now take an existing collection instead of just a name
* Allow logging client request headers
* New TrivialStrategy for simple configurations
* New documentation site on [https://fgm.github.io/filog](https://fgm.github.io/filog)
* New CHANGELOG.md file documenting releases
* JsDoc standard applies to all code to support the documentation site
* ES5 (compiled) files are no longer maintained in repo
* ES6 (source) files are no longer included in the version published on NPM
* 0.1.9 incorrectly packaged release: deprecated

### 0.1.8 / 0.1.7

* Allow serializing objects with depth > 2
* Split tests between "unit" and "integration".
* 0.1.7 incorrectly packaged release: deprecated

### 0.1.6

* Support streamed requests
* New integration tests

### 0.1.5

* New TeeSender to send logs to multiple destinations
* Non-significant Meteor user "tokens" no longer transmitted

### 0.1.4

* Level and facility are embedded in syslog messages

### 0.1.3

* Fixed missing README update for syslog sender

### 0.1.2

* New Syslog sender using modern-syslog
* Fixed server-side double escaping in message strings
* Improved collection handling in MongodbSender

### 0.1.1

* Fixed licensing inconsistency in README.md

### 0.1.0

* First version published on NPM
* Logging strategies can select loggers and customize them
* First basic documentation in README.md
* New configurable log processors
* Client/Server split
* First unit tests
* Dependencies cleanup
* Ignore node_modules


## 0.0 Series

The unreleased early code.
 
### 0.0.1

* Licensing clarified
* Require NPM 3 or later for local module

### Unnumbered

* Initial version
