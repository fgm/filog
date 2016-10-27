import ProcessorBase from './ProcessorBase';
import stack from 'callsite';

export default class MeteorUserFilterProcessor extends ProcessorBase {

  /** @inheritdoc */
  process(context) {
    if (((((context || {}).meteor || {}).user || {}).services || {}).resume) {
      delete context.meteor.user.services.resume;
    }
    return context;
  }
}
