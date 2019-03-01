import {Meteor} from "meteor/meteor";
import {
  ClientLogger,
  MeteorClientMethodSender,
  TrivialStrategy,
} from "filog";

console.log("Client main");
document.write('Client main');

Meteor.startup(() => {
  const sender = new MeteorClientMethodSender();
  const strategy = new TrivialStrategy(sender);
  window.logger = new ClientLogger(strategy);
});
