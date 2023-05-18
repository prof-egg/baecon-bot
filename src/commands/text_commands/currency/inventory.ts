import { ITextCommandFunc, ECommandTags } from "../../../library/classes/CommandHandler";

import Discord, { ColorResolvable } from "discord.js";
import colorconfig from "../../../config/colors.json";
import Util from "../../../library/classes/Util";
import * as Account from "../../../library/classes/AccountManager";
import { Debug } from "../../../library/classes/Debug";
import * as Item from "../../../library/classes/ItemHandler"

const commandFunction: ITextCommandFunc = async (message, args, client, authorAccount) => {

    // COMMAND SETTINGS
    const minPageAllowed = 1;
    const itemsPerPage = 5;

    // Assign a variable to hold args[0] to make it more readable 
    let enteredPage = args[0]

    // Get user 
    let user
    let userAccount

    if (args[0] && args[1]) { user = message.mentions.users.first(); enteredPage = args[1] }
    else if (args[0] && message.mentions.users.first()) user = message.mentions.users.first()

    else if (args[0] && !message.mentions.users.first()) user = message.author
    if (!user) user = message.author

    if (user != message.author) userAccount = await Account.Manager.getUserAccount(user.id)
    else userAccount = authorAccount

    if (!userAccount) {
        message.reply(`There was an error with finding ${user.username}'s account. Please try again later`)
        Debug.logWarning(`Could not find ${user.tag}'s account`, `${require("path").basename(__filename)}`)
        return
    }

    // Define help embed as it is used in multiple lines
    const helpEmbed = new Discord.EmbedBuilder()
        .setTitle("Inventory Command")
        .setDescription("**Syntax:** `b-inventory (@user) (page)`")
        .addFields({
            name: "Description:", value:
                "Let's you see how many items you currently have."
        }, {
            name: "Command Tips:", value:
                `Minimum Page Allowed: ${minPageAllowed}\n` +
                `Items Per Page: ${itemsPerPage}\n` +
                "Aliases: `b-inv`"
        })
        .setFooter({ text: "This is being shown because you used unrecognized command syntax." })
        .setColor(colorconfig.main as ColorResolvable)

    // Calculate the deposit amount, while checking for errors and such
    let pageDesired = 0;
    let possiblePage = parseInt(enteredPage)
    if (possiblePage) // If parseInt() actually returned a number and not undefined
        pageDesired = possiblePage
    else
        pageDesired = 1

    // calculate inventory pages
    let inventory = [] // this will hold multiple sets of pageData
    let pageData = ""

    let itemKeys = [...userAccount.items.keys()]

    for (let i = 0; i < itemKeys.length; i++) {

        let itemKey = itemKeys[i]
        let itemInfo = Item.Handler.getItemFromWarehouse(itemKey)

        // formate item entry
        let itemDetails = ""
        if (itemInfo) {
            itemDetails = `${Util.emoji(client, itemInfo.discordEmojiID)} ${itemInfo.name} ─ ${userAccount.items.get(itemKey)?.toLocaleString()} \n*ID* \`${itemInfo.key}\` ─ ${itemInfo.itemType}`
        } else {
            itemDetails = `❌ Error ─ ${userAccount.items.get(itemKey)?.toLocaleString()} \n*ID* \`unknown\` ─ unknown`
            Debug.logError(`Attempted to list non-existant item "${itemKey}" in ${user.tag}'s inventory.`, `${require("path").basename(__filename)}`)
        }
 
        // add item entry to the page
        let isLastIteration = i == itemKeys.length - 1
        if (isLastIteration)
            pageData += `${itemDetails}`
        else
            pageData += `${itemDetails}\n`

        // send data as a page
        if (pageData.length == itemsPerPage || isLastIteration) {
            inventory.push(pageData)
            pageData = "";
        }
    }

    // Stuff
    if (pageDesired < minPageAllowed) return message.channel.send({ embeds: [helpEmbed] })

    // Create embed
    const embed = new Discord.EmbedBuilder()
        .setTitle(`${user.username}'s Inventory`)
        .setColor(colorconfig.main as ColorResolvable);

    // more stuff
    if (inventory[pageDesired - 1]) {
        embed.setDescription(inventory[pageDesired - 1])
            .setFooter({ text: `Page ${pageDesired} of ${inventory.length}` })
    } else if (inventory.length == 0) {
        embed.setDescription(`${user.username} does not own any items.`)
            .setFooter({ text: `Page 1 of 1` })
    } else {
        embed.setDescription("Page not found!")
            .setFooter({ text: `Page ${pageDesired} of ${inventory.length}` })
    }

    // Send embed
    return message.channel.send({ embeds: [embed] })
}

const nameData = {
    name: "inventory",
    aliases: ["inv"]
}

const tags: ECommandTags[] = [ECommandTags.Currency]

export { commandFunction, nameData, tags }