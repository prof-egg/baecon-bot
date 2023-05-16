import { Time } from "./Time"
import Discord, { ColorResolvable } from "discord.js"
import colorconfig from "../../config/colors.json";

type isNumberTypeOptions = { sign?: "positive" | "negative", whole?: boolean, isBelow?: number, isAbove?: number, isAboveOrEqualTo?: number, isBelowOrEqualTo?: number }
export class Util {


    /**Has a 1 in `odds` chance to return true */
    static weightedCoinFlip(odds: number): boolean {
        if (odds < 1) throw new Error("Odds must be at least 1.")
        if (this.getRandomInt(1, odds) == 1) return true
        return false
    } 

    /**Returns a Discord.EmbedBuilder with a description set to `message`, and the color set to main embed color */ 
    static embedMessage(message: string): Discord.EmbedBuilder {
        const embed = new Discord.EmbedBuilder()
        .setDescription(message)
        .setColor(colorconfig.main as ColorResolvable)
        return embed
    }

    static emoji(client: Discord.Client, id: string) {
        return client.emojis.cache.get(id)?.toString();
    }

    static consoleTimeStamp() { 
        return `${Time.getCurrentDate().MDYString}-${Time.getCurrentDate().timeString}`
    }

    static isNumberType(number: number, options: isNumberTypeOptions ) {

        let defaultOptions = { sign: null, whole: null, isBelow: null, isAbove: null, isAboveOrEqualTo: null, isBelowOrEqualTo: null }
        let opts: isNumberTypeOptions = Object.assign(defaultOptions, options)
    
        if (opts.sign != null) {
            if (opts.sign == "positive" && number < 0) return { number: number, passed: false, error: "sign" }
            if (opts.sign == "negative" && number >= 0) return { number: number, passed: false, error: "sign" }
        }
        if (opts.whole != null) {
            if (opts.whole == true && number != Math.floor(number)) return { number: number, passed: false, error: "whole" }
            if (opts.whole == false && number == Math.floor(number)) return { number: number, passed: false, error: "whole" }
        }
        if (opts.isBelow != null && number >= opts.isBelow) return { number: number, passed: false, error: "below" }
        if (opts.isAbove != null && number <= opts.isAbove) return { number: number, passed: false, error: "above" }
    
        if (opts.isAboveOrEqualTo != null && number < opts.isAboveOrEqualTo) return { number: number, passed: false, error: "aboveOrEqualTo" }
        if (opts.isBelowOrEqualTo != null && number > opts.isBelowOrEqualTo) return { number: number, passed: false, error: "belowOrEqualTo" }
    
        return { number: number, passed: true, error: null }
    }
    
    static getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static colorLog(color: any, text: string) {
        let colors = {
            reset: "\x1b[0m",
    
            //text color
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            grey: "\x1b[90m",

/*
Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"
FgGray = "\x1b[90m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
BgGray = "\x1b[100m"
*/
        }
    
        if (color == "black") {
            console.log(`${colors.black}${text}${colors.reset}`)
        } else if (color == "red") {
            console.log(`${colors.red}${text}${colors.reset}`)
        } else if (color == "green") {
            console.log(`${colors.green}${text}${colors.reset}`)
        } else if (color == "yellow") {
            console.log(`${colors.yellow}${text}${colors.reset}`)
        } else if (color == "blue") {
            console.log(`${colors.blue}${text}${colors.reset}`)
        } else if (color == "magenta") {
            console.log(`${colors.magenta}${text}${colors.reset}`)
        } else if (color == "cyan") {
            console.log(`${colors.cyan}${text}${colors.reset}`)
        } else {
            console.log(`Error: Couldn't find color "${color}"`)
        }
    }
}