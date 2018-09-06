/**
 * @fileOverview Browser Processor class.
 */
import { IContext } from "../IContext";
import { IProcessor } from "./IProcessor";
import { ProcessorBase } from "./ProcessorBase";
interface IMemoryInfo {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
}
interface IPerformance {
    memory: IMemoryInfo;
}
interface IWindow {
    navigator?: INavigator;
    performance: IPerformance;
}
interface IBrowserInfo {
    performance?: IPerformance | {};
    platform: string;
    userAgent: string;
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
declare class BrowserProcessor extends ProcessorBase implements IProcessor {
    navigator: INavigator;
    window: IWindow;
    /**
     * ProcessorBase ensures it is not being built outside a browser.
     *
     * @param {object} nav
     *   window.Navigator.
     * @param {object} win
     *   window.
     */
    constructor(nav: INavigator, win: IWindow);
    /** @inheritDoc */
    process(context: object): IContext;
}
export { BrowserProcessor, IBrowserInfo, IMemoryInfo, INavigator, IPerformance, IWindow, };
