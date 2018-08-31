/**
 * @fileOverview Base Processor class.
 */

import {IProcessor} from "./IProcessor";
import {ISendContext} from "../ISendContext";

/**
 * An "abstract" processor base class.
 *
 * It exists only to document the processor interface.
 */
const ProcessorBase = class implements IProcessor {
  /** @inheritDoc */
  public process(context: object): ISendContext {
    return context as ISendContext;
  }
};

export default ProcessorBase;
