import Discord, { ColorResolvable } from "discord.js";
import colorconfig from "../../config/colors.json";
import Util from "../../library/classes/Util";
import * as Account from "../../library/classes/AccountManager";
import { Debug } from "../../library/classes/Debug";
import { grill } from "../../config/Items";
import { IItemFunc } from "../../library/classes/ItemHandler";
import emojiID from "../../config/emoji.json"

const itemFunction: IItemFunc = async (client, message, args, authorAccount, itemData) => {

    // ITEM USE SETTINGS
    let minGrillValue = 200
    let maxGrillValue = 300

    // Define help embed
    const helpEmbed = new Discord.EmbedBuilder()
        .setTitle(`Use Command: ${grill.name}`)
        .setDescription(`**Syntax:** \`b-use ${grill.key} (amount)\``)
        .addFields({
            name: "Description:", value:
                "Lets you grill up some tasty bacon."
        }, {
            name: "Command Tips:", value:
                `Maximum Bits Reward: **\`${maxGrillValue.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}\n` +
                `Minimum Bits Reward: **\`${minGrillValue.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}\n`
        })
        .setFooter({ text: "This is being shown because you used unrecognized command syntax." })
        .setColor(colorconfig.main as ColorResolvable)

    // Calculate the containers to open, while checking for errors and such
    let enteredAmount = args[1]
    let amountToOpen = 1;
    let amountUserOwns = Account.Manager.getItemAmount(authorAccount, grill.key)
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
        bitsReward += Util.getRandomInt(minGrillValue, maxGrillValue)

    // add bits to account, and subtract containers of bacon from account
    authorAccount.wallet += bitsReward
    Account.Manager.addItem(authorAccount, grill.key, -amountToOpen)

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

let itemData = grill
export { itemFunction, itemData }