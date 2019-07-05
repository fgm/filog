"use strict";
/**
 * @fileOverview Tee Sender class.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Like a UNIX tee(1), the TeeSender sends its input to multiple outputs.
 */
var TeeSender = /** @class */ (function () {
    /**
     * Constructor.
     *
     * @param {Array} senders
     *   An array of senders to which to send the input.
     */
    function TeeSender(senders) {
        this.senders = senders;
    }
    /** @inheritdoc */
    TeeSender.prototype.send = function (level, message, context) {
        this.senders.map(function (sender) { return sender.send(level, message, context); });
    };
    return TeeSender;
}());
exports.TeeSender = TeeSender;
//# sourceMappingURL=TeeSender.js.map