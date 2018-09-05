const DETAILS_KEY = "message_details";
const HOST_KEY = "hostname";
const SOURCE_KEY = "source";
const TS_KEY = "timestamp";

interface IDetails {
  [HOST_KEY]?: string;
}

interface ITimestamps {
  // Values are times in milliseconds since the Epoch, e.g. +new Date().
  [op: string]: number;
}

interface ITimestampsHash {
  [side: string]: ITimestamps;
}

interface IContext {
  [DETAILS_KEY]?: {};
  [HOST_KEY]?: string;
  [SOURCE_KEY]?: string;
  [TS_KEY]?: ITimestampsHash;
  [key: string]: {} | undefined;
}

export {
  DETAILS_KEY,
  HOST_KEY,
  SOURCE_KEY,
  TS_KEY,
  IDetails,
  IContext,
  ITimestamps,
  ITimestampsHash,
};
