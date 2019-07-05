/**
 * @file server/main.js
 */

import { Meteor } from 'meteor/meteor';
import { WebApp } from "meteor/webapp";

import {ConsoleSender, ServerLogger} from "filog";
import { TrivialStrategy } from "filog";

Meteor.startup(() => {
  const sender = new ConsoleSender();
  const strategy = new TrivialStrategy(sender);
  global.logger = new ServerLogger(strategy, WebApp);
});
