import { ITextCommandFunc, ECommandTags } from "../../../library/classes/CommandHandler";

import Discord, { ColorResolvable } from "discord.js";
import clientconfig from "../../../config/client.json";
import colorconfig from "../../../config/colors.json";
import { Util } from "../../../library/classes/Util";
import { Manager } from "../../../library/classes/AccountManager";
import { Debug } from "../../../library/classes/Debug";

const commandFunction: ITextCommandFunc = async (message, args, client, authorAccount) => {
    
    // Get user (Discord.User) and userAccount (IUserSchema)
    let user
    let userAccount
    if (!args[0]) {
        userAccount = authorAccount
        user = message.author
    } else {
        user = message.mentions.users.first() || client.users.cache.get(args[0]);
        if (!user) return message.channel.send("I couldn't find that user.")
        userAccount = await Manager.getUserAccount(user.id)
    }
    
    if (!userAccount) {
        message.reply(`There was an error with finding ${user.username}'s account. Please try again later`)
        Debug.logWarning(`Could not find ${user.username}'s account`, `${require("path").basename(__filename)}`)
        return
    }
    
    // Calculate string to make embed look neater
    let bitsEmoji = Util.emoji(client, "738472449846411505")
    let walletAmount = userAccount.wallet.toLocaleString();
    let bankAmount = userAccount.bank.toLocaleString();
    let bankLimitAmount = userAccount.bankLimit.toLocaleString();
    let totalAmount = (userAccount.wallet + userAccount.bank).toLocaleString();

    // Create embed
    const embed = new Discord.EmbedBuilder()
        .setTitle(`${user.username}'s Balance`)
        .setDescription(
            `**Wallet:** ${walletAmount}${bitsEmoji} \n` +
            `**Bank:** ${bankAmount}/${bankLimitAmount}${bitsEmoji} \n` +
            `\n` +
            `**Total:** ${totalAmount}${bitsEmoji}`)
        .setFooter({ text: `Baecon client Version: ${clientconfig.version}` })
        .setColor(colorconfig.main as ColorResolvable);

    // Send embed
    return message.channel.send({ embeds: [embed] })
}

const nameData = {
    name: "balance",
    aliases: ["bal", "bits"]
}

const tags: ECommandTags[] = [ECommandTags.Currency]

export { commandFunction, nameData, tags }