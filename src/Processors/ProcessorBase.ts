/**
 * @fileOverview Base Processor class.
 */

import {IProcessor} from "./IProcessor";

/**
 * An "abstract" processor base class.
 *
 * It exists only to document the processor interface.
 */
const ProcessorBase = class implements IProcessor {
  /** @inheritDoc */
  public process(context: object): object {
    return context;
  }
};

export default ProcessorBase;
