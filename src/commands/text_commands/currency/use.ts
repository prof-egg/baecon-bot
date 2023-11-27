import Discord, { ColorResolvable } from "discord.js";
import { ITextCommandFunc, ECommandTags } from "../../../library/classes/CommandHandler";
import * as UserAccount from "../../../library/classes/AccountManager";
import * as Item from "../../../library/classes/ItemHandler"
import { Debug } from "../../../library/classes/Debug";
import colorconfig from "../../../config/colors.json";


const commandFunction: ITextCommandFunc = async (message, args, client, authorAccount) => {

    // COMMAND SETTINGS

    // Get user (Discord.User) and userAccount (TUserDoc)
    if (!authorAccount) {
        message.reply(`There was an error with finding ${message.author.username}'s account. Please try again later`)
        Debug.logWarning(`Could not find ${message.author.username}'s account`, `${require("path").basename(__filename)}`)
        return
    }
    
    // Define help embed as it is used in multiple lines
    const helpEmbed = new Discord.EmbedBuilder()
        .setTitle("Use Command: General")
        .setDescription("**Syntax:** `b-use [itemID] (amount)`")
        .addFields({
            name: "Description:", value:
                `Let's you use the function of an item in your inventory that has the tag "Item" or "Tool."`
        }, {
            name: "Command Tips:", value:
                `Some items have more parameter requirements then the general use case shown above. For items like the "Container of Bacon," you can optionally specify how many you want to open.\nExample use case: \`b-use cob 7\``
        })
        .setFooter({ text: "This is being shown because you used unrecognized command syntax." })
        .setColor(colorconfig.main as ColorResolvable)

    let inputtedItemKey = args[0]
    if (!inputtedItemKey) return message.channel.send({ embeds: [helpEmbed] })

    let itemData = Item.Handler.getItemFromWarehouse(inputtedItemKey) 
    if (!itemData)                                               return message.reply("That item does not exist.")
    if (!Item.Handler.isItemFunctionLoaded(inputtedItemKey))     return message.reply("That item cannot be used.")
    
    // Check if they have the item to actually use it
    if (!UserAccount.Manager.hasAtLeastOneOfItem(authorAccount, inputtedItemKey)) return message.reply("You cannot use what you don't have.")

    let succesfulExecution = Item.Handler.executeItemFunction(inputtedItemKey, client, message, args, authorAccount, itemData)
    if (!succesfulExecution) {
        message.reply(`There was an error with executing the item function. Please try again later.`)
        Debug.logError(`Failed item execution with key "${inputtedItemKey}." User: ${message.author.tag} (${message.author.id}).`, `${require("path").basename(__filename)}`)
        console.log(message)
    }
}

const nameData = {
    name: "use",
    aliases: []
}

const tags: ECommandTags[] = [ECommandTags.Currency, ECommandTags.Complete]

export { commandFunction, nameData, tags }