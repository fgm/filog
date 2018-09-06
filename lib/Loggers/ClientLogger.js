"use strict";
/**
 * @fileOverview Client-side Logger implementation.
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
Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1 = require("./Logger");
var SIDE = "client";
exports.ClientSide = SIDE;
/**
 * ClientLogger is the client-side implementation of Logger.
 *
 * In its current state, it brings nothing over Logger, simply providing an
 * extension-specialization point.
 */
var ClientLogger = /** @class */ (function (_super) {
    __extends(ClientLogger, _super);
    function ClientLogger(strategy) {
        var _this = _super.call(this, strategy) || this;
        _this.side = SIDE;
        return _this;
    }
    /**
     * @inheritDoc
     */
    ClientLogger.prototype.getHostname = function () {
        return undefined;
    };
    return ClientLogger;
}(Logger_1.Logger));
exports.ClientLogger = ClientLogger;
//# sourceMappingURL=ClientLogger.js.map