"use strict";
/**
 * @fileOverview Tee Sender class.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var SenderBase_1 = __importDefault(require("./SenderBase"));
/**
 * Like a UNIX tee(1), the TeeSender sends its input to multiple outputs.
 *
 * @extends SenderBase
 */
var TeeSender = /** @class */ (function (_super) {
    __extends(class_1, _super);
    /**
     * Constructor.
     *
     * @param {Array} senders
     *   An array of senders to which to send the input.
     */
    function class_1(senders) {
        var _this = _super.call(this) || this;
        _this.senders = senders;
        return _this;
    }
    /** @inheritdoc */
    class_1.prototype.send = function (level, message, context) {
        this.senders.map(function (sender) { return sender.send(level, message, context); });
    };
    return class_1;
}(SenderBase_1.default));
exports.default = TeeSender;
//# sourceMappingURL=TeeSender.js.map