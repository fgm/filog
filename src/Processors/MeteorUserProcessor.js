import ProcessorBase from './ProcessorBase';

export default class MeteorUserProcessor extends ProcessorBase {
  constructor() {
    super();
    if (!Meteor || !Meteor.isClient || !Meteor.user || Meteor.user.constructor.name !== 'Function') {
      throw new Error('Meteor processor is only meant for client-side Meteor with an accounts package.');
    }
    this.meteor = Meteor;
  }

  /** @inheritdoc */
  process(context) {
    // Overwrite any previous userId information in context.
    const result = Object.assign({}, context, {
      meteor: {
        platform: 'client',
        user: this.meteor.user()
      }
    });
    return result;
  }
}
