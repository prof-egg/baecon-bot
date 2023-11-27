import Discord, { ColorResolvable, User } from "discord.js";
import { ITextCommandFunc, ECommandTags } from "../../../library/classes/CommandHandler";
import Util from "../../../library/classes/Util";
import * as UserAccount from "../../../library/classes/AccountManager";
import * as Items from "../../../config/Items";
import * as Item from "../../../library/classes/ItemHandler"
import { Debug } from "../../../library/classes/Debug";

import emojiID from "../../../config/emoji.json"
import cooldowns from "../../../config/cooldowns.json"
import colorconfig from "../../../config/colors.json";
import clientconfig from "../../../config/client.json";

const commandFunction: ITextCommandFunc = async (message, args, client, authorAccount) => {

    // Get user (Discord.User) and userAccount (TUserDoc)
    if (!authorAccount) {
        message.reply(`There was an error with finding ${message.author.username}'s account. Please try again later`)
        Debug.logWarning(`Could not find ${message.author.username}'s account`, "beg.ts")
        return
    }

    // Format shop details (eventually this should work like the inventory page system)
    let shopPage = "";
    Item.Handler.ShopItemsArray.forEach((item) => {
        shopPage += `${Util.emoji(client, item.discordEmojiID)}  **${item.name}** ─ ${item.shopConfig.price.toLocaleString()}${Util.emoji(client, emojiID.bits)} ─ \`${item.itemType}\` \n*ID* \`${item.key}\` ─ ${item.shopConfig.shop?.tag}\n`
    })
    // shopDescription.push(`space${emoji(item.discordID)} **${item.name}** ─ ${item.price.toLocaleString()}${emoji(botconfig.items.bits.discordID)} ─ \`${item.type}\` \n*ID* \`${item.gameID}\` ─ ${item.shopTag}`)

    // Create Embed
    const embed = new Discord.EmbedBuilder()
        .setTitle("Baecon's Shop")
        .setDescription(shopPage)
        .setFooter({ text: `Baecon client Version: ${clientconfig.version}` })
        .setColor(colorconfig.main as ColorResolvable)

    // Send embed
    message.channel.send({ embeds: [embed] })

}

const nameData = {
    name: "shop",
    aliases: []
}

const tags: ECommandTags[] = [ECommandTags.Currency, ECommandTags.Complete]

export { commandFunction, nameData, tags }