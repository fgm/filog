declare const DETAILS_KEY = "message_details";
declare const HOST_KEY = "hostname";
declare const SOURCE_KEY = "source";
declare const TS_KEY = "timestamp";
interface IDetails {
    [HOST_KEY]?: string;
}
interface ITimes {
    [key: string]: number;
}
interface ITsHash {
    client?: ITimes;
    server?: ITimes;
    cordova?: ITimes;
    [key: string]: ITimes | undefined;
}
interface ISendContext {
    [DETAILS_KEY]?: object;
    [HOST_KEY]?: string;
    [SOURCE_KEY]?: string;
    [TS_KEY]?: ITsHash;
    [key: string]: {} | undefined;
}
export { DETAILS_KEY, HOST_KEY, SOURCE_KEY, TS_KEY, IDetails, ISendContext, ITsHash, };
