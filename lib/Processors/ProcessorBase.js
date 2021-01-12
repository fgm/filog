"use strict";
/**
 * @fileOverview Base Processor class.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessorBase = void 0;
/**
 * An "abstract" processor base class.
 *
 * It exists only to document the processor interface.
 */
var ProcessorBase = /** @class */ (function () {
    function ProcessorBase() {
    }
    /** @inheritDoc */
    ProcessorBase.prototype.process = function (context) {
        return context;
    };
    return ProcessorBase;
}());
exports.ProcessorBase = ProcessorBase;
//# sourceMappingURL=ProcessorBase.js.map