/**
 * @fileOverview Client-side Logger implementation.
 */
/**
 * ClientLogger is the client-side implementation of Logger.
 *
 * In its current state, it brings nothing over Logger, simply providing an
 * extension-specialization point.
 *
 * @extends Logger
 */
declare const ClientLogger: {
    new (strategy: import("./Strategies/IStrategy").IStrategy): {
        processors: import("./Processors/IProcessor").IProcessor[];
        tk: any;
        strategy: import("./Strategies/IStrategy").IStrategy;
        report(e: Error): void;
        reportSubscriber(e: Error): void;
        arm(): void;
        disarm(delay?: number): void;
        _meteorLog(): void;
        log(level: Levels, message: string | object, initialContext?: object, process?: boolean): void;
        debug(message: string | object, context?: object): void;
        info(message: string | object, context?: object): void;
        warn(message: string | object, context?: object): void;
        error(message: string | object, context?: object): void;
    };
    readonly METHOD: "filog:log";
    levelName(level: number): string;
};
export default ClientLogger;
