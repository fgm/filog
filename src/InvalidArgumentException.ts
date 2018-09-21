interface InvalidArgumentException extends Error {}

const InvalidArgumentException = function(this: Error, message: string): void {
  this.name = "InvalidArgumentException";
  this.message = message;
  this.stack = (new Error()).stack;
} as any as { new (message: string): InvalidArgumentException };

InvalidArgumentException.prototype = Object.create(Error.prototype);
InvalidArgumentException.prototype.constructor = InvalidArgumentException;

export default InvalidArgumentException;
