import { ECommandTags, IOnLoadFunc, ITextCommandFunc } from "../../../library/classes/CommandHandler";

import Discord, { ColorResolvable } from "discord.js";
import clientconfig from "../../../config/client.json";
import colorconfig from "../../../config/colors.json";
import { Debug } from "../../../library/classes/Debug";
import * as Command from "../../../library/classes/CommandHandler";

// Curency embed
const helpCurrencyEmbed = new Discord.EmbedBuilder()
    .setTitle(":moneybag: Currency Commands")
    .setFooter({ text: `Baecon Bot Version: ${clientconfig.version}` })
    .setColor(colorconfig.main as ColorResolvable);

// Fun Embed
const helpFunEmbed = new Discord.EmbedBuilder()
    .setTitle(":grin: Fun Commands")
    .setFooter({ text: `Baecon Bot Version: ${clientconfig.version}` })
    .setColor(colorconfig.main as ColorResolvable);

// Utility Embed
const helpUtilityEmbed = new Discord.EmbedBuilder()
    .setTitle(":tools: Utility Commands")
    .setFooter({ text: `Baecon Bot Version: ${clientconfig.version}` })
    .setColor(colorconfig.main as ColorResolvable);

// Settings Embed
const helpSettingsEmbed = new Discord.EmbedBuilder()
    .setTitle(":gear: Settings Commands")
    .setFooter({ text: `Baecon Bot Version: ${clientconfig.version}` })
    .setColor(colorconfig.main as ColorResolvable);

// Help Embed
const helpEmbed = new Discord.EmbedBuilder()
    .setTitle("Baecon Bot Command List")
    .addFields(
        { name: ':moneybag:Currency', value: `\`${clientconfig.prefix}help currency\` \n\n**:tools:Utility**\n\`${clientconfig.prefix}help utilty\``, inline: true },
        { name: ':grin:Fun', value: `\`${clientconfig.prefix}help fun\` \n\n**:gear:Settings**\n\`${clientconfig.prefix}help settings\``, inline: true },
        // { name: ':tools:Utility', value: `\`${botconfig.bot.prefix}help utilty\``, inline: true },
        // { name: ':gear:Settings', value: `\`${botconfig.bot.prefix}help settings\``, inline: true },
    )
    .setFooter({ text: `Baecon Bot Version: ${clientconfig.version}` })
    .setColor(colorconfig.main as ColorResolvable);

const onLoad: IOnLoadFunc = async (client) => {

    function getCommandReadyString(tags: Command.ECommandTags[]): string {
        let string = ""
        let cmdComplete = Command.Handler.getTextFilesWithTags(tags)
        if (cmdComplete.length == 0) return "none"
        for (let i = 0; i < cmdComplete.length - 1; i++)
            string += `\`${cmdComplete[i].Name}\`, `
        string += `\`${cmdComplete[cmdComplete.length - 1].Name}\``
        return string
    }
    
    helpCurrencyEmbed.setDescription("**Type b- before each command:**\n" + getCommandReadyString([Command.ECommandTags.Complete, Command.ECommandTags.Currency]))
    helpFunEmbed.setDescription("**Type b- before each command:**\n" + getCommandReadyString([Command.ECommandTags.Complete, Command.ECommandTags.Fun]))
    helpUtilityEmbed.setDescription("**Type b- before each command:**\n" + getCommandReadyString([Command.ECommandTags.Complete, Command.ECommandTags.Utility]))
    helpSettingsEmbed.setDescription("**Type b- before each command:**\n" + getCommandReadyString([Command.ECommandTags.Complete, Command.ECommandTags.Settings]))
}

const commandFunction: ITextCommandFunc = async (message, args, client) => {

    // `\`${fs.readdirSync("./commands/cmd_currency").sort((a, b) => a > b ? 1 : b > a ? -1 : 0).toString().replace(/.js,/g, "`, `").replace(".js", "`")}`
    try {

        switch (args[0]) {
            case "currency":
                message.channel.send({ embeds: [helpCurrencyEmbed] });
            break
            case "fun":
                message.channel.send({ embeds: [helpFunEmbed] });
            break
            case "utility":
                message.channel.send({ embeds: [helpUtilityEmbed] });
            break
            case "settings":
                message.channel.send({ embeds: [helpSettingsEmbed] });
            break
            default:
                message.channel.send({ embeds: [helpEmbed] });
            break
        }

    } catch (err) {
        message.reply("Sorry this doesn't seem to be working at the moment.")
        Debug.logError(err as string, `${require("path").basename(__filename)}`)
    }
}

const nameData = {
    name: "help",
    aliases: []
}

const tags: ECommandTags[] = [ECommandTags.Complete, ECommandTags.Utility]

export { onLoad, commandFunction, nameData, tags }