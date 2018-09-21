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
interface Performance {
    memory?: IMemoryInfo;
}
interface Window {
    navigator?: Navigator;
    performance: Performance;
}
interface IBrowserInfo {
    performance?: Performance | {};
    platform: string;
    userAgent: string;
}
interface Navigator {
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
    navigator: any;
    window: any;
    /**
     * ProcessorBase ensures it is not being built outside a browser.
     *
     * @param {object} nav
     *   window.Navigator.
     * @param {object} win
     *   window.
     */
    constructor(nav?: Navigator, win?: Window);
    /** @inheritDoc */
    process(context: object): IContext;
}
export { BrowserProcessor, IBrowserInfo, IMemoryInfo, };
