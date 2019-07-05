/**
 * Null function.
 *
 * Used to provide a short-circuit, like the NullSender replacement in
 * LeveledStrategy, or to provide a stub methods, as needed for the asynchronous
 * post in MeteorclientHttpSender.
 *
 * @see MeteorClientHttpSender#send
 * @see LeveledStrategy#customizeLogger
 *
 * @constructor
 */
const NullFn = () => undefined;

export default NullFn;
