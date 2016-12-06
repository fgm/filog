# FiLog changelog
## 0.1 series

### 0.1.11

* Exposed TrivialStrategy to module consumers
* Fixed incorrect default timestamp generation.
* Upgraded TraceKit to 0.4.4.
* Contributors are now listed.

### 0.1.10 / 0.1.9

* MongoDbSender can now take an existing collection instead of just a name
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
* Improved collection handling in MongoDbSender

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
