import LogLevel from '../LogLevel';
import SenderBase from './SenderBase';

export default class ConsoleSender extends SenderBase {
  constructor() {
    super();
    if (!console) {
      throw new Error('Console sender needs a console object.');
    }
  }

  send(level, message, context) {
    const methods = [
      console.error,
      console.error,
      console.error,
      console.error,
      console.warn,
      console.warn,
      console.info,
      console.log
    ];

    const method = methods[level].bind(console);
    method(LogLevel.Names[level], message, context);
  }
}
