/**
 * @fileOverview Base Sender class.
 */

/**
 * SenderBase is an "abstract" class defining the sender interface.
 *
 * @property {Array} processorKeys
 */
const SenderBase = class {

  /**
   * {@constructor}
   *
   * @param {ProcessorBase[]} processors
   *   Optional. Processors to be applied by this sender instead of globally.
   */
  constructor(processors = []) {
    this.processors = processors;
    this.processorKeys = processors.reduce((accu, processor) => {
      return [...accu, ...processor.getTrustedKeys()];
    }, []);
    console.log("SBC", processors, this.processorKeys);
  }

  /**
   * Getter.
   *
   * @returns {ProcessorBase[]}
   *   The array of processors for this sender.
   */
  getProcessors() {
    return this.processors;
  }

  /**
   * Reduce callback for processors.
   *
   * @see Logger.log()
   *
   * @param {Object} accu
   *   The reduction accumulator.
   * @param {ProcessorBase} current
   *   The current process to apply in the reduction.
   *
   * @returns {Object}
   *   The result of the current reduction step.
   */
  processorReducer(accu, current) {
    const result = Object.assign(accu, current.process(accu));
    return result;
  }

  /**
   * The single method for a sender: send data somewhere.
   *
   * @param {int} level
   *   One of the 8 RFC5424 levels: 0 to 7.
   * @param {string} message
   *   Unlike LoggerBase::log(), it is not expected to handler non-string data.
   * @param {object} rawContext
   *   A log event context object.
   *
   * @returns {object}
   *   The processed context, as sent.
   */
  send(level, message, rawContext) {
    const context = this.processors.reduce(this.processorReducer, rawContext);
    return context;
  }

  /**
   * Record the context keys added by processors.
   *
   * These keys are considered reliable, so do not needs serializing in
   * long-term storage, to ease searching on them: it is up to the sender to
   * decide how to handle them.
   *
   * @param {Array} keys
   *   An array of strings.
   *
   * @returns {void}
   */
  setProcessorKeys(keys) {
    this.processorKeys = keys;
  }
};

export default SenderBase;
