import ProcessorBase from './ProcessorBase';

export default class RoutingProcessor extends ProcessorBase {
  constructor() {
    super();
    if (!window || !window.location) {
      throw new Error('Cannot provide route information without location information.');
    }
  }
 
  /** @inheritdoc */
  process(context) {
    // Overwrite any previous routing information in context.
    let result = Object.assign({}, context, { routing: { location: window.location } });
    return result;
  }
}
