import Discord, { ColorResolvable } from "discord.js";
import colorconfig from "../../config/colors.json";
import Util from "../../library/classes/Util";
import * as Account from "../../library/classes/AccountManager";
import { Debug } from "../../library/classes/Debug";
import { cob } from "../../config/Items";
import { IItemFunc } from "../../library/classes/ItemHandler";
import emojiID from "../../config/emoji.json"

const itemFunction: IItemFunc = async (client, message, args, authorAccount, itemData) => {

    // ITEM USE SETTINGS
    let minCobValue = 100
    let maxCobValue = 150

    // Define help embed
    const helpEmbed = new Discord.EmbedBuilder()
        .setTitle(`Use Command: ${cob.name}`)
        .setDescription(`**Syntax:** \`b-use ${cob.key} (amount)\``)
        .addFields({
            name: "Description:", value:
                "Opens a container of bacon and rewards you with bacon bits."
        }, {
            name: "Command Tips:", value:
                "Replace `(amount)` with the word `all` to open all of the containers of bacon in your inventory.\n" +
                "Replace `(amount)` with the word `half` to open half of the containers of bacon in your inventory.\n" +
                `Maximum Bits Reward: **\`${maxCobValue.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}\n` +
                `Minimum Bits Reward: **\`${minCobValue.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}\n`
        })
        .setFooter({ text: "This is being shown because you used unrecognized command syntax." })
        .setColor(colorconfig.main as ColorResolvable)

    // Calculate the containers to open, while checking for errors and such
    let enteredAmount = args[1]
    let amountToOpen = 1;
    let amountUserOwns = Account.Manager.getItemAmount(authorAccount, cob.key)
    if (enteredAmount) {
        let possibleAmount = parseInt(enteredAmount)
        if (possibleAmount) // If parseInt() actually returned a number and not undefined
            amountToOpen = possibleAmount
        else {
            // Since parseInt() returned undefined, check if its for certain allowed keywords, if not display help message
            if (enteredAmount == "all") amountToOpen = amountUserOwns
            else if (enteredAmount == "half") amountToOpen = Math.ceil(amountUserOwns / 2)
            else return message.channel.send({ embeds: [helpEmbed] })
        }
    }

    // check if they are trying to use more than they have (NOTE: this techinically should be optional from the way this is set up, since this function wont even be ran if they dont have at least one of the item)
    if (amountToOpen > amountUserOwns) return message.reply("You do not have that many containers of bacon.")

    // calculate how many bits the user should be rewarded with
    let bitsReward = 0;
    for (let i = 0; i < amountToOpen; i++)
        bitsReward += Util.getRandomInt(minCobValue, maxCobValue)

    // add bits to account, and subtract containers of bacon from account
    authorAccount.wallet += bitsReward
    Account.Manager.addItem(authorAccount, cob.key, -amountToOpen)

    // send embed message
    let msgSent = await message.channel.send({ embeds: [Util.embedMessage(`You got **\`${bitsReward.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)} from ${amountToOpen.toLocaleString()} container(s) of bacon!`)] })

    // await save account and catch save errors
    try {
        await authorAccount.save()
    } catch (e) {
        msgSent.reply(`There was an error with saving this data to your account. Please try again later.`)
        Debug.logError(<string>e, `${require("path").basename(__filename)}`)
    }

}

let itemData = cob
export { itemFunction, itemData }