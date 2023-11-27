import Discord, { ColorResolvable } from "discord.js";
import { ITextCommandFunc, ECommandTags } from "../../../library/classes/CommandHandler";
import Util from "../../../library/classes/Util";
import * as Account from "../../../library/classes/AccountManager";
import * as Item from "../../../library/classes/ItemHandler"
import { Debug } from "../../../library/classes/Debug";

import emojiID from "../../../config/emoji.json"
import cooldowns from "../../../config/cooldowns.json"
import colorconfig from "../../../config/colors.json";
import clientconfig from "../../../config/client.json";

const helpEmbed = new Discord.EmbedBuilder()
        .setTitle("Use Command")
        .setDescription("**Syntax:** `b-buy [itemID] (amount)`")
        .addFields({
            name: "Description:", value:
                `Lets you buy any item available in the shop.`
        })
        .setFooter({ text: "This is being shown because you used unrecognized command syntax." })
        .setColor(colorconfig.main as ColorResolvable)


const commandFunction: ITextCommandFunc = async (message, args, client, authorAccount) => {

    let enteredItemKey = args[0]
    if (!enteredItemKey) return message.channel.send({ embeds: [helpEmbed] })

    // Get user (Discord.User) and userAccount (TUserDoc)
    if (!authorAccount) {
        message.reply(`There was an error with finding ${message.author.username}'s account. Please try again later`)
        Debug.logWarning(`Could not find ${message.author.username}'s account`, "beg.ts")
        return
    }

    // Get item data
    let itemData = Item.Handler.getItemFromWarehouse(enteredItemKey)
    if (!itemData) return message.channel.send({ embeds: [Util.embedMessage("That item does not exist.")] })
    if (itemData.shopConfig.shop?.type != Item.EItemShopType.Regular) return message.channel.send({ embeds: [Util.embedMessage("That item is not for sale.")] })

    // Get amount to buy (for now the default will just be 1)
    let amountToBuy = 1;

    // Get price
    let totalPrice = amountToBuy * itemData.shopConfig.price;
    if (totalPrice > authorAccount.wallet) return message.channel.send({ embeds: [Util.embedMessage("You don't have enough bits.")] })
    
    // Update user doc
    try {
        Account.Manager.addItem(authorAccount, enteredItemKey, amountToBuy) 
        authorAccount.wallet -= totalPrice
    } catch (e) {
        Debug.logError(<string>e, `${require("path").basename(__filename)}`)
        return message.channel.send(clientconfig.commandErrorMessage)
    }

    // Create Embed
    const embed = new Discord.EmbedBuilder()
        .setColor(colorconfig.main as ColorResolvable)

    
    

    // Send embed
    let msgSent = await message.channel.send({ embeds: [embed] })

    // save and update cooldown
    try {
        Account.Manager.updateCooldown(authorAccount, cooldowns.beg) // saved on another line so that this can be commented out easily for testing
        await authorAccount.save()
    } catch (e) {
        msgSent.reply(`There was an error with saving this data to your account. Please try again later.`)
        Debug.logError(<string>e, `${require("path").basename(__filename)}`)
    }
}

const nameData = {
    name: "buy",
    aliases: ["purchase"]
}

const tags: ECommandTags[] = [ECommandTags.Currency, ECommandTags.Complete]

export { commandFunction, nameData, tags }