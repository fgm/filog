"use strict";
/**
 * @fileOverview NulllSender class.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * NullSender defines an explicit null sender.
 */
var NullSender = /** @class */ (function () {
    function NullSender() {
    }
    /** @inheritDoc */
    NullSender.prototype.send = function (_1, _2, _3) {
        // Explicit return is needed to avoid the TSlint no-empty warning.
        return;
    };
    return NullSender;
}());
exports.NullSender = NullSender;
//# sourceMappingURL=NullSender.js.map