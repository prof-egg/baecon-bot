import Discord from "discord.js"
import fs from "fs"

import Util from "./Util"

import clientconfig from "../../config/client.json"
import { Debug } from "./Debug";
import { TUserDoc } from "../models/UserData";

export class Handler {

    // NOTE: make a function that reads a folder that holds specifically slash command folders (this part completed), and a function that reads a folder that holds specifically text command folders, that way the class has more use cases

    // OTHER NOTE: make a command that can load a folder that holds the folders specified above (folder tree would look like: "commands -> slash_commands -> utility" or "commands -> text_commands -> currency")

    // OTHER OTHER NOTE: currently you have to: let cmdHandler = new CommandHandler("commands"); cmdHandler.loadSlashCommandParentFolder(..., "commands", ...), and it is redundant to type the "commands" folder twice
    // make it so that it can store the folder from the input on the constructor, so that you wouldnt HAVE to specify the folder (still allow them to specify), but it would used the stored folder name as the default folder name. 
    // note that some people may still want to specify a different folder

    // OTHER OTHER OTHER NOTE: make it so the command handler can load tags


    private static _cmdLoadedCount = 0; // used to log how many commands have loaded in the loadSlashCommandFolder() method
    // private static _relNodeRequirePathAddon: string = ""; // used in the loadSlashCommandFunction() method so that it can have a statement like this: var slashCommandFileData = require("../../commands/dev_commands/bot_stats.js")
    
    private static _slashCommandsCollection: Discord.Collection<string, ISlashCommandFunc> = new Discord.Collection(); // <key: commandName, value: slashCommandFunction> 
    private static _textCommandsCollection: Discord.Collection<string, ITextCommandFunc> = new Discord.Collection(); // there is a key value pair for the command name AND the aliases, so this does store multiple of the same command function
    private static _tagsCollection: Discord.Collection<string, ECommandTags[]> = new Discord.Collection(); // Stores the tags with the command name

    static get SlashCommandsCollection() { return this._slashCommandsCollection; }
    static get TextCommandsCollection() { return this._textCommandsCollection; }
    static get TagsCollection() { return this._tagsCollection; }

    /**
     * Tries to calculate the relNodeRequirePathAddon
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
    static loadSlashCommandParentFolder(client: Discord.Client, slashCmdParentFolderPath: string, registerSlashCmdGlobally = false): void {

        try {
            var slashCmdFolderArr = fs.readdirSync(slashCmdParentFolderPath)
        } catch (e) {
            return Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

        // update the path arrays before calling this.loadSlashCommandFolderArr()
        // before the update: ["dev_commands", "utility_commands"]
        // after the update: ["slash_commands/dev_commands", "slash_commands/utility_commands"]
        // note that this is done with a for loop, and not a cleaner forEach loop, this is because of referencing issues in the forEach loop
        for (let i = 0; i < slashCmdFolderArr.length; i++) {
            slashCmdFolderArr[i] = `${slashCmdParentFolderPath}/${slashCmdFolderArr[i]}`
        }

        this.loadSlashCommandFolderArr(client, slashCmdFolderArr, registerSlashCmdGlobally)
    }

    static loadTextCommandFolderArr(textCmdFolderPathArr: string[]): void {
        textCmdFolderPathArr.forEach((textCmdFolderPath) => {
            this.loadTextCommandFolder(textCmdFolderPath)
        })
    }

    static loadSlashCommandFolderArr(client: Discord.Client, slashCmdFolderPathArr: string[], registerSlashCmdGlobally = false): void {
        slashCmdFolderPathArr.forEach((slashCmdFolderPath) => {
            this.loadSlashCommandFolder(client, slashCmdFolderPath, registerSlashCmdGlobally)
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

    static loadSlashCommandFolder(client: Discord.Client, slashCmdFolderPath: string, registerSlashCmdGlobally = false): void {

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
            this.loadSlashCommandFile(client, slashCommandFilePath, registerSlashCmdGlobally);
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

    static loadSlashCommandFile(client: Discord.Client, slashCmdFilePath: string, registerSlashCmdGlobally = false): void {

        let slashCmdFileName = "";
        try {
            slashCmdFileName = slashCmdFilePath.split("/")[slashCmdFilePath.split("/").length - 1]
        } catch (e) {
            Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

        let slashCmdFileData = this._loadSlashCommandFunctionAndTags(slashCmdFilePath, slashCmdFileName)
        if (!slashCmdFileData) return;
        this._registerSlashCommandBuildData(client, slashCmdFileData, slashCmdFileName, registerSlashCmdGlobally)
    }

    /**
     * Return a NodeRequire of the file, and loads the command function and command tags into their respective collections with the command name as the keys.
     */
    private static _loadTextCommandFunctionAndTags(textCmdFilePath: string, textCmdFileName: string): TTextCommandFile | void {

        // Require the file data and store it into the fileData variable
        try { // if you uncomment the try catch, change the "@returns {NodeRequire}" to "@returns {NodeRequire?}"
            var textCmdFileData: TTextCommandFile = require(`${process.cwd()}/${textCmdFilePath}`)
        } catch (e) {
            return Debug.logError(e as string, "CommandHandler")
        }

        // Check if file has any obvious setup errors
        if (!textCmdFileData.commandFunction)     { Debug.logError(`${textCmdFileName} has no commandFunction`, "CommandHandler"); return }
        if (!textCmdFileData.nameData)            { Debug.logError(`${textCmdFileName} has no nameData`, "CommandHandler"); return }
        if (!textCmdFileData.nameData.name)       { Debug.logError(`${textCmdFileName} missing name in nameData`, "CommandHandler"); return }
        if (!textCmdFileData.nameData.aliases)    { Debug.logError(`${textCmdFileName} missing aliases in nameData`, "CommandHandler"); return }
        if (!textCmdFileData.tags)                { Debug.logError(`${textCmdFileName} has no tags (make sure to declare module.exports.tags = [])`, "CommandHandler"); return }
        if (!Array.isArray(textCmdFileData.tags)) { Debug.logError(`${textCmdFileName} tags must be of type Array (make sure to declare module.exports.tags = [])`, "CommandHandler"); return }

        // Load command function and tegs into their respective collections, using the command name as the key
        this._textCommandsCollection.set(textCmdFileData.nameData.name, textCmdFileData.commandFunction);
        this._tagsCollection.set(textCmdFileData.nameData.name, textCmdFileData.tags)
        textCmdFileData.nameData.aliases.forEach((aliase) => { 
            this._textCommandsCollection.set(aliase, textCmdFileData.commandFunction);
            this._tagsCollection.set(aliase, textCmdFileData.tags)
        })
        this._cmdLoadedCount++;

        // Return the fileData for later use
        return textCmdFileData;
    }
    /**
     * Return a NodeRequire of the file, and loads the command function and command tags into their respective collections with the command name as the keys.
     */
    private static _loadSlashCommandFunctionAndTags(slashCmdFilePath: string, slashCmdFileName: string): TSlashCommandFile | void {

        // Require the file data and store it into the fileData variable
        try { // if you uncomment the try catch, change the "@returns {NodeRequire}" to "@returns {NodeRequire?}"
            var slashCmdFileData: TSlashCommandFile = require(`${process.cwd()}/${slashCmdFilePath}`)
        } catch (e) {
            return Util.colorLog("red", `[${Util.consoleTimeStamp()}] [CommandHandler/ERROR]: ${e}`);
        }

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

        // Return the fileData for later use
        return slashCmdFileData;
    }

    private static _registerSlashCommandBuildData(client: Discord.Client, slashCmdFileData: TSlashCommandFile, slashCmdFileName: string, registerSlashCmdGlobally = false): Promise<void> {

        // NOTE: Make two variants of the function: registerSlashCommandBuildData(). One that registers to a guild, one that registers globally

        // console.log(`[${UtilRandom.consoleTimeStamp()}] [CommandHandler/MESSAGE]: Make two variants of the function: registerSlashCommandBuildData(). One that registers to a guild, one that registers globally`);
        return new Promise(async (resolve) => {
            // Get slash command list to register to
            try {
                var slashCommands;
                if (registerSlashCmdGlobally == true) console.log(`[${Util.consoleTimeStamp()}] [CommandHandler/MESSAGE]: You never setup global commands`);
                if (!registerSlashCmdGlobally) slashCommands = client.guilds.cache.get(clientconfig.homeGuild.id)?.commands;
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

export enum ECommandTags {
    Utility,
    Currency
}

export interface ISlashCommandFunc {
    (interaction: Discord.ChatInputCommandInteraction, options: Discord.CommandInteractionOptionResolver, client: Discord.Client): void
}

export type TSlashCommandFile = {
    commandFunction: ISlashCommandFunc,
    slashCmdBuildData: Discord.RESTPostAPIChatInputApplicationCommandsJSONBody,
    tags: ECommandTags[],
}

export interface ITextCommandFunc {
    (message: Discord.Message, args: string[], client: Discord.Client, userAccount?: TUserDoc): void
}

export type TTextCommandFile = {
    commandFunction: ITextCommandFunc,
    nameData: { name: string, aliases: string[] },
    tags: ECommandTags[],
}