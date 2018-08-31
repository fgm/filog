/**
 * @fileOverview Client-side Logger implementation.
 */
import { IStrategy } from "./Strategies/IStrategy";
/**
 * ClientLogger is the client-side implementation of Logger.
 *
 * In its current state, it brings nothing over Logger, simply providing an
 * extension-specialization point.
 *
 * @extends Logger
 *
 * @property {string} side
 */
declare const ClientLogger: {
    new (strategy: IStrategy): {
        processors: import("./Processors/IProcessor").IProcessor[];
        side: string;
        tk: any;
        strategy: IStrategy;
        applyProcessors(rawContext: import("./ISendContext").ISendContext): import("./ISendContext").ISendContext;
        arm(): void;
        doProcess(apply: boolean, contextToProcess: import("./ISendContext").ISendContext): import("./ISendContext").ISendContext;
        processorReducer(accu: {}, current: import("./Processors/IProcessor").IProcessor): import("./ISendContext").ISendContext;
        report(e: Error): void;
        reportSubscriber(e: Error): void;
        send(strategy: IStrategy, level: Levels, message: string, sentContext: {}): void;
        stamp(context: import("./ISendContext").ISendContext, op: string): void;
        buildContext(details: import("./ISendContext").IDetails, source: string, context?: import("./ISendContext").ISendContext): import("./ISendContext").ISendContext;
        disarm(delay?: number): void;
        error(message: string | object, context?: import("./ISendContext").ISendContext): void;
        log(level: Levels, message: string | object, initialContext?: import("./ISendContext").ISendContext, process?: boolean): void;
        debug(message: string | object, context?: import("./ISendContext").ISendContext): void;
        info(message: string | object, context?: import("./ISendContext").ISendContext): void;
        validateLevel(requestedLevel: Levels): void;
        warn(message: string | object, context?: import("./ISendContext").ISendContext): void;
        _meteorLog(): void;
    };
    readonly side: "client";
    readonly METHOD: "filog:log";
    levelName(level: number): string;
};
export default ClientLogger;
