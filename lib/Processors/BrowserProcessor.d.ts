interface IMemoryInfo {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
}
interface IPerformance {
    memory: IMemoryInfo;
}
interface IWindow {
    navigator: INavigator;
    performance: IPerformance;
}
interface INavigator {
    platform?: string;
    userAgent?: string;
    [key: string]: string | undefined;
}
/**
 * Adds browser related information to an event context.
 *
 * - plugins, platform, product, userAgent
 * - memory information
 *
 * @extends ProcessorBase
 */
declare const BrowserProcessor: {
    new (nav: INavigator, win: IWindow): {
        navigator: INavigator;
        window: IWindow;
        /** @inheritDoc */
        process(context: object): object;
    };
};
export default BrowserProcessor;
