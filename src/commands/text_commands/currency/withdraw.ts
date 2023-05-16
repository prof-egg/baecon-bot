import Discord, { ColorResolvable } from "discord.js";
import { ITextCommandFunc, ECommandTags } from "../../../library/classes/CommandHandler";
import { Util } from "../../../library/classes/Util";
import { Debug } from "../../../library/classes/Debug";

import emojiID from "../../../config/emoji.json"
import colorconfig from "../../../config/colors.json";

const commandFunction: ITextCommandFunc = async (message, args, client, authorAccount) => {

    // COMMAND SETTINGS
    let minimumWithdrawal = 1;

    // Assign a variable to hold args[0] to make it more readable 
    let enteredWithdrawal = args[0]

    // Get user (Discord.User) and userAccount (TUserDoc)
    if (!authorAccount) {
        message.reply(`There was an error with finding ${message.author.username}'s account. Please try again later`)
        Debug.logWarning(`Could not find ${message.author.username}'s account`, "beg.ts")
        return
    }

    // Define help embed as it is used in multiple lines
    const helpEmbed = new Discord.EmbedBuilder()
        .setTitle("Withdraw Command")
        .setDescription("**Syntax:** `b-withdraw [amount]`")
        .addFields({
            name: "Command Tips:", value:
                "Replace `[amount]` with the word `all` to withdraw all of the bits in your bank.\n" +
                "Replace `[amount]` with the word `half` to withdraw half of the bits in your bank.\n" +
                `Minimum Withdrawal: **\`${minimumWithdrawal.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}\n` +
                "Aliases: `b-with`"
        })
        .setFooter({ text: "This is being shown because you used unrecognized command syntax." })
        .setColor(colorconfig.main as ColorResolvable)

    // Send help embed if user did not input an amount
    if (!enteredWithdrawal) return message.channel.send({ embeds: [helpEmbed] })

    // Calculate the withdrawal amount, while checking for errors and such
    let withdrawalAmount = 0;
    let possibleAmount = parseInt(enteredWithdrawal)
    if (possibleAmount) // If parseInt() actually returned a number and not undefined
        withdrawalAmount = possibleAmount
    else {
        // Since parseInt() returned undefined, check if its for certain allowed keywords, if not display help message
        if (enteredWithdrawal == "all") withdrawalAmount = authorAccount.bank
        else if (enteredWithdrawal == "half") withdrawalAmount = Math.floor(authorAccount.bank / 2)
        else return message.channel.send({ embeds: [helpEmbed] })
    }

    // Check if the amount they are trying to deposit is less than the minimum withdrawal (1)
    if (withdrawalAmount < minimumWithdrawal) return message.channel.send({ embeds: [helpEmbed] })

    // Check if they are trying to manually withdraw more than they have
    if (withdrawalAmount > authorAccount.bank) return message.channel.send({ embeds: [Util.embedMessage("You don't have that many bits to withdraw.")] })

    // Do the transaction
    authorAccount.bank -= withdrawalAmount;
    authorAccount.wallet += withdrawalAmount;

    // Create Embed
    const embed = new Discord.EmbedBuilder()
        .setDescription(`You withdrew **\`${withdrawalAmount.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}`)
        .setColor(colorconfig.main as ColorResolvable)

    // Send embed
    let msgSent = await message.channel.send({ embeds: [embed] })

    // Save account
    try {
        await authorAccount.save()
    } catch (e) {
        msgSent.reply(`There was an error with finding ${message.author.username}'s account. Please try again later`)
        Debug.logError(<string>e, `${require("path").basename(__filename)}`)
    }
}

const nameData = {
    name: "withdraw",
    aliases: ["with"]
}

const tags: ECommandTags[] = [ECommandTags.Currency]

export { commandFunction, nameData, tags }