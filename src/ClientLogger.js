import Logger from './Logger';

class ClientLogger extends Logger {
  log(level, message, rawContext) {
    const context = this.processors.reduce((accu, current, processorIndex, processors) => {
      const result = Object.assign(accu, processors[processorIndex].process(current));
      return result;
    }, rawContext);

    const senders = this.strategy.selectSenders(level, message, context);
    senders.forEach(sender => {
      sender.send(level, message, context);
    });
  }
}

export default ClientLogger;
