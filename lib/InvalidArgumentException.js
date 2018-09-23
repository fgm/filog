"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InvalidArgumentException = function (message) {
    this.name = "InvalidArgumentException";
    this.message = message;
    this.stack = (new Error()).stack;
};
InvalidArgumentException.prototype = Object.create(Error.prototype);
InvalidArgumentException.prototype.constructor = InvalidArgumentException;
exports.default = InvalidArgumentException;
//# sourceMappingURL=InvalidArgumentException.js.map