import Discord, { ColorResolvable, User } from "discord.js";
import { ITextCommandFunc, ECommandTags } from "../../../library/classes/CommandHandler";
import Util from "../../../library/classes/Util";
import * as UserAccount from "../../../library/classes/AccountManager";
import * as Items from "../../../config/Items";
import { Debug } from "../../../library/classes/Debug";

import emojiID from "../../../config/emoji.json"
import cooldowns from "../../../config/cooldowns.json"
import colorconfig from "../../../config/colors.json";
import clientconfig from "../../../config/client.json";

const commandFunction: ITextCommandFunc = async (message, args, client, authorAccount) => {

    // COMMAND SETTINGS
    let cooldownData = cooldowns.beg

    // Get user (Discord.User) and userAccount (TUserDoc)
    if (!authorAccount) {
        message.reply(`There was an error with finding ${message.author.username}'s account. Please try again later`)
        Debug.logWarning(`Could not find ${message.author.username}'s account`, "beg.ts")
        return
    }

    // Check for cooldown, send cooldown message if on cooldown and exit the function
    if (UserAccount.Manager.isOnCooldown(authorAccount, cooldownData)) {
        let timeLeft = UserAccount.Manager.getTimeLeftOnCooldownParsed(authorAccount, cooldownData)

        const cooldownEmbed = new Discord.EmbedBuilder()
            .setDescription(`You can beg again in ${timeLeft.seconds}s.`)
            .setColor(colorconfig.main as ColorResolvable)

        return message.channel.send({ embeds: [cooldownEmbed] })
    }

    // Create Embed
    const embed = new Discord.EmbedBuilder()
        .setColor(colorconfig.main as ColorResolvable)

    // Decide to give an item or cash
    let giveItem = Util.weightedCoinFlip(1);
    // let giveItem = Util.weightedCoinFlip(5);
    if (giveItem) {

        try {
            await UserAccount.Manager.addItem(authorAccount, Items.cob.key)
        } catch (e) {
            Debug.logError(<string>e, `${require("path").basename(__filename)}`)
            return message.channel.send(clientconfig.commandErrorMessage)
        }

        // Set embed message 
        embed.setDescription(`A stranger gave you a ${Items.cob.name}!`)
    } else {
        // Get random amount of bits, add it to user account, and update cooldown
        let bitsGathered = Util.getRandomInt(10, 40)
        authorAccount.wallet += bitsGathered

        // Set embed message 
        embed.setDescription(`A stranger gave you **\`${bitsGathered}\`**${Util.emoji(client, emojiID.bits)}`)
    }

    // Send embed
    let msgSent = await message.channel.send({ embeds: [embed] })

    // save and update cooldown
    try {
        // UserAccount.Manager.updateCooldown(authorAccount, cooldowns.beg) // saved on another line so that this can be commented out easily for testing
        await authorAccount.save()
    } catch (e) {
        msgSent.reply(`There was an error with finding ${message.author.username}'s account. Please try again later`)
        Debug.logError(<string>e, `${require("path").basename(__filename)}`)
    }
}

const nameData = {
    name: "beg",
    aliases: []
}

const tags: ECommandTags[] = [ECommandTags.Currency]

export { commandFunction, nameData, tags }