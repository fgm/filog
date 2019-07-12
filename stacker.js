const util = require('util');

const stack = require('callsite');

const logger = {
  log(args) {
    const frames = stack();
    let i = 0;
    for (const frame of frames) {
      console.log(
        i,
        // frame.getThis(), "\n",         // Only works at index 0, the function calling stack().
        // frame.getTypeName(), "\n",     // Works always
        // frame.getFunction(), "\n",     // Only works at index 0, the function calling stack().
        // frame.getFunctionName(), "\n", // Works always
        // frame.getMethodName(), "\n",   // Works always
        // frame.getFileName(), "\n",     // Works always
        // frame.getLineNumber(), "\n",   // Works always, but beware builds...
        // frame.getColumnNumber(), "\n", // Works always (builds ?)
        // frame.getEvalOrigin(), "\n",   // Works always
        // frame.isToplevel(), "\n",      // Works always, but may have more than 1 !
        // frame.isEval(), "\n",          // Always false, even on eval() ?
        // frame.isNative(), "\n",        // Works always
        // frame.isConstructor(), "\n",   // Works always
        // frame.isAsync(),               // Unknown in spite of documentation
        // frame.isPromiseAll(),          // Unknown in spite of documentation
        // frame.getPromiseIndex(),       // Unknown in spite of documentation
      );
      i++;
    }
  }
};

class Foo {
  constructor(logger) {
    this.logger = logger;
    logger.log('constructing');
  }

  bar() {
    this.logger.log('bar');
  }
}


const f = new Foo(logger);
f.bar();

