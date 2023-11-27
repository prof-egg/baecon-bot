import Util from "./Util";

export class Debug {
    static logError(message: string, logger?: string): void {
        if (logger) return Util.colorLog("red", `[${Util.consoleTimeStamp()}] [${logger}/ERROR]: ${message}`)
        return Util.colorLog("red", `[${Util.consoleTimeStamp()}] [ERROR]: ${message}`)
    }

    static logWarning(message: string, logger?: string): void {
        if (logger) return Util.colorLog("yellow", `[${Util.consoleTimeStamp()}] [${logger}/WARNING]: ${message}`)
        return Util.colorLog("yellow", `[${Util.consoleTimeStamp()}] [WARNING]: ${message}`)
    }

    static log(message: string, logger?: string): void {
        if (logger) return console.log(`[${Util.consoleTimeStamp()}] [${logger}/ERROR]: ${message}`)
        return console.log(`[${Util.consoleTimeStamp()}] [ERROR]: ${message}`)
    }
}