import Discord from "discord.js"
import fs from "fs"

import Util from "./Util"

import clientconfig from "../../config/client.json"
import { Debug } from "./Debug";
import { TUserDoc } from "../models/UserData";

/**Call `cacheClient` before anything else*/
export class Handler {

    private static _client: Discord.Client

    private static _cmdLoadedCount = 0; // used to log how many commands have loaded in the loadSlashCommandFolder() method
    // private static _relNodeRequirePathAddon: string = ""; // used in the loadSlashCommandFunction() method so that it can have a statement like this: var slashCommandFileData = require("../../commands/dev_commands/bot_stats.js")
    
    private static _textCmdFileArr: TextCommandFile[] = []
    private static _slashCmdFileArr: SlashCommandFile[] = []
    private static _slashCommandsCollection: Discord.Collection<string, ISlashCommandFunc> = new Discord.Collection(); // <key: commandName, value: slashCommandFunction> 
    private static _textCommandsCollection: Discord.Collection<string, ITextCommandFunc> = new Discord.Collection(); // there is a key value pair for the command name AND the aliases, so this does store multiple of the same command function
    private static _tagsCollection: Discord.Collection<string, ECommandTags[]> = new Discord.Collection(); // Stores the tags with the command name

    static get SlashCommandsCollection() { return this._slashCommandsCollection; }
    static get TextCommandsCollection() { return this._textCommandsCollection; }
    static get TagsCollection() { return this._tagsCollection; }

    /**
     * @deprecated Use process.cwd()
     */
    private _getNodeRequirePathAddon(commandFolderName: string): string {

        // test if the folder is valid
        try {
            fs.readdirSync(`./${commandFolderName}`)
        } catch (e) {
            Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e} (command folder name not valid)`);
            return ""
        }

        try {
            // get working directory, in this case it is ToastyBaecon v3
            let workingNodeJSPath = process.cwd().split("\\")
            let workingNodeJSDirName = workingNodeJSPath[workingNodeJSPath.length - 1]

            // figure out how many steps it takes to get to the working directory, and adds that many sets of "../" to the return variable
            let currentDirPathNames = __dirname.split("\\")
            let dummyRelNodeRequirePathAddon = "" // dummy variables is a naming convention you made, starting a variable with the word "dummy," probably means a non dummy variant of the variable exists else where, and is more important
            let pathAddonSet = "../"
            for (let i = currentDirPathNames.length - 1; i > 0; i--) {
                if (currentDirPathNames[i] != workingNodeJSDirName) dummyRelNodeRequirePathAddon += pathAddonSet
                else break;
            }

            return dummyRelNodeRequirePathAddon
        } catch (e) {
            Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
            return ""
        }

    }

    /**Caches discord client instance so that there isnt a weird chain of client inputs */
    static cacheClient(client: Discord.Client) { this._client = client }

    /** Return the text cmd files with the specified tags */
    static getTextFilesWithTags(tags: ECommandTags[]): TextCommandFile[] {
        let fileDatas: TextCommandFile[] = []
        this._textCmdFileArr.forEach((file) => {
            if (file.hasTags(tags)) fileDatas.push(file)
        })
        return fileDatas
    }

    /** Return the slash cmd files with the specified tags */
    static getSlashFilesWithTags(tags: ECommandTags[]): SlashCommandFile[] {
        let fileDatas: SlashCommandFile[] = []
        this._slashCmdFileArr.forEach((file) => {
            if (file.hasTags(tags)) fileDatas.push(file)
        })
        return fileDatas
    }

    static textCommandHasTag(message: Discord.Message, tag: ECommandTags): boolean {
        let commandName = this.getTextCommandName(message)
        if (!commandName) return false;

        let commandTags = this._tagsCollection.get(commandName)
        if (!commandTags) return false;

        for (let i = 0; i < commandTags.length; i++) 
            if (tag == commandTags[i]) return true;

        return false;
    }

    static slashCommandHasTag(interaction: Discord.ChatInputCommandInteraction, tag: ECommandTags): boolean {
        let commandTags = this._tagsCollection.get(interaction.commandName)
        if (!commandTags) return false;

        for (let i = 0; i < commandTags.length; i++) 
            if (tag == commandTags[i]) return true;

        return false;
    }

    static getAndExecuteTextCommand(message: Discord.Message, client: Discord.Client, userAccount?: TUserDoc): boolean {

        // NOTE: debug logs are commented out on getAndExecuteTextCommand() and not getAndExecuteSlashCommand() because it is expected for people to mess up a command name for text based commands
        // it is worrying tho if someone messes up a slash command since it is built in to discord

        // get command arguments and command name
        let args = this.getTextCommandArgs(message)
        let commandName = this.getTextCommandName(message)
        if (!commandName) { /*UtilRandom.colorLog("red", `[${UtilRandom.consoleTimeStamp()}] [CommandHandler/ERROR]: could not execute text command: ${message.content}`);*/ return false; }

        // try and get command function
        let textCommand = this._textCommandsCollection.get(commandName)
        if (!textCommand) { /*UtilRandom.colorLog("red", `[${UtilRandom.consoleTimeStamp()}] [CommandHandler/ERROR]: could not execute text command: ${message.content}`);*/ return false; }
        textCommand(message, args, client, userAccount);

        return true;
    }

    static getAndExecuteSlashCommand(interaction: Discord.ChatInputCommandInteraction, client: Discord.Client): boolean {

        // NOTE: MAKE IT SO THAT THIS COMMAND RETURNS BOOLEAN BASED ON IF THE SLASH COMMAND WAS SUCCESFULLY RAN OR NOT THIS IS SO THAT IF IT RETURNS FALSE, 
        // YOU CAN CALL ANOTHER FUNCTION TO DELETE THE SLASH COMMAND, (presuming it returned false because the slash command doesnt exist)
        const { commandName, options } = interaction

        // look for command based off of slash command name, if it executes return true, else return false
        let slashCommand = this._slashCommandsCollection.get(commandName);
        if (!slashCommand) { Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: could not execute slash command`); return false; } 
        slashCommand(interaction, options as Discord.CommandInteractionOptionResolver, client);

        return true;
    }

    static getTextCommandArgs(message: Discord.Message): string[] {
        let args = message.content.toLowerCase().slice(clientconfig.prefix.length).trim().split(/ +/g);
        args.shift()
        return args
    }

    static getTextCommandName(message: Discord.Message): string | undefined {
        return message.content.toLowerCase().slice(clientconfig.prefix.length).trim().split(/ +/g).shift()?.toLocaleLowerCase()
    }


    /**
     * This is used to load a command folder that houses slash command folders inside of it. This is so that if you have multiple slash command folders, intstead of calling `CommandHandler.loadSlashCommandFolder()`
     * on each one, you can move all those folders into a parent folder, and call `CommandHandler.loadSlashCommandParentFolder()` on that parent folder.
     */
    static loadTextCommandParentFolder(textCmdParentFolderPath: string): void {

        try {
            var textCmdFolderArr = fs.readdirSync(textCmdParentFolderPath)
        } catch (e) {
            return Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

        // update the path arrays before calling this.loadSlashCommandFolderArr()
        // before the update: ["dev_commands", "utility_commands"]
        // after the update: ["text_commands/dev_commands", "text_commands/utility_commands"]
        // note that this is done with a for loop, and not a cleaner forEach loop, this is because of referencing issues in the forEach loop
        for (let i = 0; i < textCmdFolderArr.length; i++) {
            textCmdFolderArr[i] = `${textCmdParentFolderPath}/${textCmdFolderArr[i]}`
        }

        this.loadTextCommandFolderArr(textCmdFolderArr)
    }

    /**
     * This is used to load a command folder that houses slash command folders inside of it. This is so that if you have multiple slash command folders, intstead of calling `CommandHandler.loadSlashCommandFolder()`
     * on each one, you can move all those folders into a parent folder, and call `CommandHandler.loadSlashCommandParentFolder()` on that parent folder.
     */
    static loadSlashCommandParentFolder(slashCmdParentFolderPath: string, registerSlashCmdGlobally = false): void {

        try {
            var slashCmdFolderArr = fs.readdirSync(slashCmdParentFolderPath)
        } catch (e) {
            return Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

        // update the path arrays before calling this.loadSlashCommandFolderArr()
        // before the update: ["dev_commands", "utility_commands"]
        // after the update: ["slash_commands/dev_commands", "slash_commands/utility_commands"]
        // note that this is done with a for loop, and not a cleaner forEach loop, this is because of referencing issues in the forEach loop
        for (let i = 0; i < slashCmdFolderArr.length; i++) 
            slashCmdFolderArr[i] = `${slashCmdParentFolderPath}/${slashCmdFolderArr[i]}`

        this.loadSlashCommandFolderArr(slashCmdFolderArr, registerSlashCmdGlobally)
    }

    static loadTextCommandFolderArr(textCmdFolderPathArr: string[]): void {
        textCmdFolderPathArr.forEach((textCmdFolderPath) => {
            this.loadTextCommandFolder(textCmdFolderPath)
        })
    }

    static loadSlashCommandFolderArr(slashCmdFolderPathArr: string[], registerSlashCmdGlobally = false): void {
        slashCmdFolderPathArr.forEach((slashCmdFolderPath) => {
            this.loadSlashCommandFolder(slashCmdFolderPath, registerSlashCmdGlobally)
        })
    }

    static loadTextCommandFolder(textCmdFolderPath: string): void {

        // load js files from folder into an array
        try {
            var jsfiles = fs.readdirSync(textCmdFolderPath).filter(f => f.split(".").pop() === "js");
        } catch (e) {
            return Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

        // get the folder name
        let textCmdFolderName = textCmdFolderPath.split("/")[textCmdFolderPath.split("/").length - 1]

        // display correct message
        if (jsfiles.length == 0) return Util.colorLog("black", `${textCmdFolderName} folder is empty`);
        if (jsfiles.length == 1) Util.colorLog("yellow", `loading ${jsfiles.length} ${textCmdFolderName} text command...`);
        if (jsfiles.length > 1) Util.colorLog("yellow", `loading ${jsfiles.length} ${textCmdFolderName} text commands...`);

        this._cmdLoadedCount = 0; 

        // for each file load it
        jsfiles.forEach((file) => {
            let textCommandFilePath = `${textCmdFolderPath}/${file}`;
            this.loadTextCommandFile(textCommandFilePath);
        })

        console.log(`${textCmdFolderName} commands loaded: ${this._cmdLoadedCount}`);
        this._cmdLoadedCount = 0;
    }

    static loadSlashCommandFolder(slashCmdFolderPath: string, registerSlashCmdGlobally = false): void {

        // load js files from folder into an array
        try {
            var jsfiles = fs.readdirSync(slashCmdFolderPath).filter(f => f.split(".").pop() === "js");
        } catch (e) {
            return Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

        // get the folder name
        let slashCmdFolderName = slashCmdFolderPath.split("/")[slashCmdFolderPath.split("/").length - 1]

        // display correct message
        if (jsfiles.length == 0) return Util.colorLog("black", `${slashCmdFolderName} folder is empty`);
        if (jsfiles.length == 1) Util.colorLog("yellow", `loading ${jsfiles.length} ${slashCmdFolderName} slash command...`);
        if (jsfiles.length > 1) Util.colorLog("yellow", `loading ${jsfiles.length} ${slashCmdFolderName} slash commands...`);

        this._cmdLoadedCount = 0; 

        // for each file load it
        jsfiles.forEach((file) => {
            let slashCommandFilePath = `${slashCmdFolderPath}/${file}`;
            this.loadSlashCommandFile(slashCommandFilePath, registerSlashCmdGlobally);
        })

        console.log(`${slashCmdFolderName} commands loaded: ${this._cmdLoadedCount}`);
        this._cmdLoadedCount = 0;
    }

    static loadTextCommandFile(textCmdFilePath: string): void {
        let textCmdFileName = "";
        try {
            textCmdFileName = textCmdFilePath.split("/")[textCmdFilePath.split("/").length - 1]
        } catch (e) {
            Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

        this._loadTextCommandFunctionAndTags(textCmdFilePath, textCmdFileName)
    }

    static loadSlashCommandFile(slashCmdFilePath: string, registerSlashCmdGlobally = false): void {

        let slashCmdFileName = "";
        try {
            slashCmdFileName = slashCmdFilePath.split("/")[slashCmdFilePath.split("/").length - 1]
        } catch (e) {
            Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

        let slashCmdFileData = this._loadSlashCommandFunctionAndTags(slashCmdFilePath, slashCmdFileName)
        if (!slashCmdFileData) return;
        this._registerSlashCommandBuildData(slashCmdFileData, slashCmdFileName, registerSlashCmdGlobally)
    }

    /**
     * Return a NodeRequire of the file, and loads the command function and command tags into their respective collections with the command name as the keys.
     */
    private static _loadTextCommandFunctionAndTags(textCmdFilePath: string, textCmdFileName: string): TTextCommandFileData | void {
        
        if (!this._client) return Debug.logError(`Tried to load "${textCmdFileName}" without a cached client`)

        // Require the file data and store it into the fileData variable
        try { // if you uncomment the try catch, change the "@returns {NodeRequire}" to "@returns {NodeRequire?}"
            var textCmdFileData: TTextCommandFileData = require(`${process.cwd()}/${textCmdFilePath}`)
        } catch (e) {
            return Debug.logError(e as string, "CommandHandler")
        }

        // Check if it has already been loaded, if it has skip it
        if (this._textCommandsCollection.has(textCmdFileData.nameData.name)) return Debug.logWarning(`A text cmd function with the name "${textCmdFileData.nameData.name}" has already been loaded`, "CommandHandler")
        for (let i = 0; i < textCmdFileData.nameData.aliases.length; i++) {
            let alias = textCmdFileData.nameData.aliases[i]
            if (this._textCommandsCollection.has(alias)) return Debug.logWarning(`$A text cmd function with the alias "${alias}" has already been loaded`, "CommandHandler")
        }

        // Check if file has any obvious setup errors
        if (!textCmdFileData.commandFunction)     { Debug.logError(`${textCmdFileName} has no commandFunction`, "CommandHandler"); return }
        if (!textCmdFileData.nameData)            { Debug.logError(`${textCmdFileName} has no nameData`, "CommandHandler"); return }
        if (!textCmdFileData.nameData.name)       { Debug.logError(`${textCmdFileName} missing name in nameData`, "CommandHandler"); return }
        if (!textCmdFileData.nameData.aliases)    { Debug.logError(`${textCmdFileName} missing aliases in nameData`, "CommandHandler"); return }
        if (!textCmdFileData.tags)                { Debug.logError(`${textCmdFileName} has no tags (make sure to declare module.exports.tags = [])`, "CommandHandler"); return }
        if (!Array.isArray(textCmdFileData.tags)) { Debug.logError(`${textCmdFileName} tags must be of type Array (make sure to declare module.exports.tags = [])`, "CommandHandler"); return }

        // Load command function and tags into their respective collections, using the command name as the key
        this._textCommandsCollection.set(textCmdFileData.nameData.name, textCmdFileData.commandFunction);
        this._tagsCollection.set(textCmdFileData.nameData.name, textCmdFileData.tags)
        textCmdFileData.nameData.aliases.forEach((aliase) => { 
            this._textCommandsCollection.set(aliase, textCmdFileData.commandFunction);
            this._tagsCollection.set(aliase, textCmdFileData.tags)
        })
        this._cmdLoadedCount++;

        // Add command file to array
        this._textCmdFileArr.push(new TextCommandFile(textCmdFileData.commandFunction, textCmdFileData.nameData, textCmdFileData.tags));

        // After loading everything check for onLoad function, if its there call it
        if (textCmdFileData.onLoad) textCmdFileData.onLoad(this._client)

        // Return the fileData for later use
        return textCmdFileData;
    }
    /**
     * Return a NodeRequire of the file, and loads the command function and command tags into their respective collections with the command name as the keys.
     */
    private static _loadSlashCommandFunctionAndTags(slashCmdFilePath: string, slashCmdFileName: string): TSlashCommandFileData | void {

        if (!this._client) return Debug.logError(`Tried to load "${slashCmdFileName}" without a cached client`)

        // Require the file data and store it into the fileData variable
        try { // if you uncomment the try catch, change the "@returns {NodeRequire}" to "@returns {NodeRequire?}"
            var slashCmdFileData: TSlashCommandFileData = require(`${process.cwd()}/${slashCmdFilePath}`)
        } catch (e) {
            return Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

        // Check if it has already been loaded, if it has skip it
        if (this._textCommandsCollection.has(slashCmdFileData.slashCmdBuildData.name)) return Debug.logWarning(`A slash cmd function with the name "${slashCmdFileData.slashCmdBuildData.name}" has already been loaded`, "CommandHandler")

        // Check if file has any obvious setup errors
        if (!slashCmdFileData.commandFunction) { Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${slashCmdFileName} has no commandFunction`); return }
        if (!slashCmdFileData.slashCmdBuildData.name) { Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${slashCmdFileName} missing name in slashCmdBuildData`); return }
        if (!slashCmdFileData.slashCmdBuildData.description) { Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${slashCmdFileName} missing description in slashCmdBuildData`); return }
        if (!slashCmdFileData.tags) { Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${slashCmdFileName} has no tags (make sure to declare module.exports.tags = [])`); return }
        if (!Array.isArray(slashCmdFileData.tags)) { Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${slashCmdFileName} tags must be of type Array (make sure to declare module.exports.tags = [])`); return }

        // Load command function and tegs into their respective collections, using the command name as the key
        this._slashCommandsCollection.set(slashCmdFileData.slashCmdBuildData.name, slashCmdFileData.commandFunction);
        this._tagsCollection.set(slashCmdFileData.slashCmdBuildData.name, slashCmdFileData.tags)
        this._cmdLoadedCount++;

        // Add command file to array
        this._slashCmdFileArr.push(new SlashCommandFile(slashCmdFileData.commandFunction, slashCmdFileData.slashCmdBuildData, slashCmdFileData.tags));

        // After loading everything check for onLoad function, if its there call it
        if (slashCmdFileData.onLoad) slashCmdFileData.onLoad(this._client)

        // Return the fileData for later use
        return slashCmdFileData;
    }

    private static _registerSlashCommandBuildData(slashCmdFileData: TSlashCommandFileData, slashCmdFileName: string, registerSlashCmdGlobally = false): Promise<void> {

        // NOTE: Make two variants of the function: registerSlashCommandBuildData(). One that registers to a guild, one that registers globally


        // console.log(`[${UtilRandom.consoleTimeStamp()}] [CommandHandler/MESSAGE]: Make two variants of the function: registerSlashCommandBuildData(). One that registers to a guild, one that registers globally`);
        return new Promise(async (resolve) => {

            if (!this._client) { Debug.logError(`Tried to register "${slashCmdFileName}" without a cached client`); resolve() } 

            // Get slash command list to register to
            try {
                var slashCommands;
                if (registerSlashCmdGlobally == true) console.log(`[${Util.consoleTimeStamp()}] [CommandHandler/MESSAGE]: You never setup global commands`);
                if (!registerSlashCmdGlobally) slashCommands = this._client.guilds.cache.get(clientconfig.homeGuild.id)?.commands;
            } catch (err) {
                Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${err} (${slashCmdFileName} failed to register due to invalid guild/application)`);
                resolve()
            }

            // Register commands to the slash command list
            try {
                await slashCommands?.create(slashCmdFileData.slashCmdBuildData);
                Util.colorLog("cyan", `${slashCmdFileName} registered!`);
                resolve()
            } catch (err) {
                Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${err} (${slashCmdFileName} failed to register)`);
                resolve()
            }
        })
    }
}

class CommandFile {
    private tags: ECommandTags[]

    constructor(tags: ECommandTags[]) {
        this.tags = tags
    }

    public hasTag(tag: ECommandTags): boolean {

        for (let i = 0; i < this.tags.length; i++) 
            if (this.tags[i] == tag) return true

        return false
    }

    public hasTags(tags: ECommandTags[]): boolean {

        for (let i = 0; i < this.tags.length; i++) 
            if (!this.hasTag(tags[i])) return false

        return true
    }

    public get Tags() { return this.tags }
}

export class TextCommandFile extends CommandFile {
    private commandFunction: ITextCommandFunc;
    private name: string
    private aliases: string[] 

    constructor(commandFunction: ITextCommandFunc, nameData: { name: string, aliases: string[] }, tags: ECommandTags[]) {
        super(tags)
        this.commandFunction = commandFunction
        this.name = nameData.name
        this.aliases = nameData.aliases
    }

    public get CommandFunction() { return this.commandFunction }
    public get Name() { return this.name }
    public get Aliases() { return this.aliases }
}

export class SlashCommandFile extends CommandFile {
    private commandFunction: ISlashCommandFunc;
    private slashCmdBuildData: Discord.RESTPostAPIChatInputApplicationCommandsJSONBody

    constructor(commandFunction: ISlashCommandFunc, slashCmdBuildData: Discord.RESTPostAPIChatInputApplicationCommandsJSONBody, tags: ECommandTags[]) {
        super(tags)
        this.commandFunction = commandFunction
        this.slashCmdBuildData = slashCmdBuildData
    }

    public get CommandFunction() { return this.commandFunction }
    public get SlashCmdBuildData() { return this.slashCmdBuildData }
}

export enum ECommandTags {
    Utility,
    Currency,
    Complete,
    Incomplete,
    Fun,
    Settings
}

export interface ISlashCommandFunc {
    (interaction: Discord.ChatInputCommandInteraction, options: Discord.CommandInteractionOptionResolver, client: Discord.Client): void
}


export type TSlashCommandFileData = {
    onLoad?: IOnLoadFunc
    commandFunction: ISlashCommandFunc,
    slashCmdBuildData: Discord.RESTPostAPIChatInputApplicationCommandsJSONBody,
    tags: ECommandTags[],
}

export interface ITextCommandFunc {
    (message: Discord.Message, args: string[], client: Discord.Client, userAccount?: TUserDoc): void
}


export type TTextCommandFileData = {
    onLoad?: IOnLoadFunc,
    commandFunction: ITextCommandFunc,
    nameData: { name: string, aliases: string[] },
    tags: ECommandTags[],
}

export interface IOnLoadFunc {
    (client: Discord.Client): void
}