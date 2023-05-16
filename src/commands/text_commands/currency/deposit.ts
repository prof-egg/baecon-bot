import Discord, { ColorResolvable } from "discord.js";
import { ITextCommandFunc, ECommandTags } from "../../../library/classes/CommandHandler";
import { Util } from "../../../library/classes/Util";
import { Debug } from "../../../library/classes/Debug";

import emojiID from "../../../config/emoji.json"
import colorconfig from "../../../config/colors.json";

const commandFunction: ITextCommandFunc = async (message, args, client, authorAccount) => {

    // COMMAND SETTINGS
    let minimumDeposit = 1;

    // Assign a variable to hold args[0] to make it more readable 
    let enteredDeposit = args[0]

    // Get user (Discord.User) and userAccount (TUserDoc)
    if (!authorAccount) {
        message.reply(`There was an error with finding ${message.author.username}'s account. Please try again later`)
        Debug.logWarning(`Could not find ${message.author.username}'s account`, "beg.ts")
        return
    }

    // Define help embed as it is used in multiple lines
    const helpEmbed = new Discord.EmbedBuilder()
        .setTitle("Deposit Command")
        .setDescription("**Syntax:** `b-deposit [amount]`")
        .addFields({
            name: "Command Tips:", value:
                "Replace `[amount]` with the word `all` to deposit all of the bits in your wallet.\n" +
                "Replace `[amount]` with the word `half` to deposit half of the bits in your wallet.\n" +
                `Minimum Deposit: **\`${minimumDeposit.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}\n` +
                "Aliases: `b-dep`"
        })
        .setFooter({ text: "This is being shown because you used unrecognized command syntax." })
        .setColor(colorconfig.main as ColorResolvable)

    // Send help embed if user did not input an amount
    if (!enteredDeposit) return message.channel.send({ embeds: [helpEmbed] })

    // Calculate the deposit amount, while checking for errors and such
    let depositAmount = 0;
    let possibleAmount = parseInt(enteredDeposit)
    if (possibleAmount) // If parseInt() actually returned a number and not undefined
        depositAmount = possibleAmount
    else {
        // Since parseInt() returned undefined, check if its for certain allowed keywords, if not display help message
        if (enteredDeposit == "all") depositAmount = authorAccount.wallet
        else if (enteredDeposit == "half") depositAmount = Math.floor(authorAccount.wallet / 2)
        else return message.channel.send({ embeds: [helpEmbed] })
    }
    if (depositAmount + authorAccount.bank > authorAccount.bankLimit) depositAmount -= authorAccount.bank // Make sure you cant deposit more than the bank limit

    // Check if the amount they are trying to deposit is less than the minimum deposit (1)
    if (depositAmount < minimumDeposit) return message.channel.send({ embeds: [helpEmbed] })

    // Check if they are trying to manually withdraw more than they have
    if (depositAmount > authorAccount.wallet) return message.channel.send({ embeds: [Util.embedMessage("You don't have that many bits to deposit.")] })

    // Do the transaction
    authorAccount.wallet -= depositAmount;
    authorAccount.bank += depositAmount;

    // Create Embed
    const embed = new Discord.EmbedBuilder()
        .setDescription(`You deposited **\`${depositAmount.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}`)
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
    name: "deposit",
    aliases: ["dep"]
}

const tags: ECommandTags[] = [ECommandTags.Currency]

export { commandFunction, nameData, tags }