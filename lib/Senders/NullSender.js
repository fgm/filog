"use strict";
/**
 * @fileOverview NulllSender class.
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
 * NullSender defines an explicit null sender.
 *
 * Although SenderBase is also null, this is not its defining characteristic
 * hence this alias.
 *
 * @extends SenderBase
 */
var NullSender = /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return class_1;
}(SenderBase_1.default));
exports.default = NullSender;
//# sourceMappingURL=NullSender.js.map