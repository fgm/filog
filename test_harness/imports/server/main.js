/**
 * @file server/main.js
 */

import { Meteor } from 'meteor/meteor';
import { Mongo } from "meteor/mongo";
import { WebApp } from "meteor/webapp";

import { ServerLogger } from "filog";
import { MongodbSender } from "filog";
import { TrivialStrategy } from "filog";

Meteor.startup(() => {
  const sender = new MongodbSender(Mongo);
  const strategy = new TrivialStrategy(sender);
  global.logger = new ServerLogger(strategy, WebApp);
});
