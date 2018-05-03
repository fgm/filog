const InvalidArgumentException = function (message) {
  this.name = "InvalidArgumentException";
  this.message = message;
  this.stackj = (new Error()).stack;
};

InvalidArgumentException.prototype = Object.create(Error.prototype);
InvalidArgumentException.prototype.constructor = InvalidArgumentException;

export default InvalidArgumentException;
