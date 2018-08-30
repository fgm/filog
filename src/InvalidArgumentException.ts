const InvalidArgumentException = class extends Error {
  // The optional stack as a string. May be undefined on some browsers.
  public stack?: string;

  constructor(message: string) {
    super();
    this.message = message;
    this.name = "InvalidArgumentException";
    this.stack = (new Error()).stack;
  }
};

export default InvalidArgumentException;
