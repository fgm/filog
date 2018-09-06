/**
 * @fileOverview Base Processor class.
 */

import {IContext} from "../IContext";
import {IProcessor} from "./IProcessor";

/**
 * An "abstract" processor base class.
 *
 * It exists only to document the processor interface.
 */
class ProcessorBase implements IProcessor {
  /** @inheritDoc */
  public process(context: IContext): IContext {
    return context as IContext;
  }
}

export {
  ProcessorBase,
};
