// interface InvalidArgumentException extends Error {}
//
// const IInvalidArgumentException = function(this: Error, message: string): void {
//   this.name = "InvalidArgumentException";
//   this.message = message;
//   this.stack = (new Error()).stack;
// } as any as { new (message: string): InvalidArgumentException };
//
// IInvalidArgumentException.prototype = Object.create(Error.prototype);
// IInvalidArgumentException.prototype.constructor = InvalidArgumentException;

class InvalidArgumentException extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default InvalidArgumentException;
