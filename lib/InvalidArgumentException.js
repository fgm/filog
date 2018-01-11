'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var InvalidArgumentException = function InvalidArgumentException(message) {
  this.name = 'InvalidArgumentException';
  this.message = message;
  this.stackj = new Error().stack;
};

InvalidArgumentException.prototype = Object.create(Error.prototype);
InvalidArgumentException.prototype.constructor = InvalidArgumentException;

exports.default = InvalidArgumentException;