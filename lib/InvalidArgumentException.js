"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var InvalidArgumentException = /** @class */ (function (_super) {
    __extends(InvalidArgumentException, _super);
    function InvalidArgumentException(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return InvalidArgumentException;
}(Error));
exports.default = InvalidArgumentException;
//# sourceMappingURL=InvalidArgumentException.js.map