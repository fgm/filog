/**
 * Defines an explicit null sender.
 *
 * Although SenderBase is also null, this is not its defining characteristic
 * hence this alias.
 */


import SenderBase from './SenderBase';

export default class NullSender extends SenderBase {}
