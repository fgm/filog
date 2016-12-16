/**
 * @fileOverview NullSender class.
 */


import SenderBase from "./SenderBase";

/**
 * NullSender defines an explicit null sender.
 *
 * Although SenderBase is also null, this is not its defining characteristic
 * hence this alias.
 *
 * @extends SenderBase
 */
const NullSender = class extends SenderBase {};

export default NullSender;
