import { ECommandTags, ITextCommandFunc } from "../../../library/classes/CommandHandler";

import Discord, { ColorResolvable } from "discord.js";
import clientconfig from "../../../config/client.json";
import colorconfig from "../../../config/colors.json";
import { Debug } from "../../../library/classes/Debug";


const commandFunction: ITextCommandFunc = async (message, args, client) => {

    // `\`${fs.readdirSync("./commands/cmd_currency").sort((a, b) => a > b ? 1 : b > a ? -1 : 0).toString().replace(/.js,/g, "`, `").replace(".js", "`")}`
    try {
        // Currrency Embed
        const helpCurrencyEmbed = new Discord.EmbedBuilder()
            .setTitle(":moneybag: Currency Commands")
            .setDescription("**Type b- before each command:**\n" +
                "`balance`, `beg`, `deposit`, `withdraw`")
            .setFooter({ text: `Baecon Bot Version: ${clientconfig.version}` })
            .setColor(colorconfig.main as ColorResolvable);

        // Fun Embed
        const helpFunEmbed = new Discord.EmbedBuilder()
            .setTitle(":grin: Fun Commands")
            .setDescription("**Type b- before each command:**\n" +
                "`none`")
            .setFooter({ text: `Baecon Bot Version: ${clientconfig.version}` })
            .setColor(colorconfig.main as ColorResolvable);

        // Utility Embed
        const helpUtilityEmbed = new Discord.EmbedBuilder()
            .setTitle(":tools: Utility Commands")
            .setDescription("**Type b- before each command:**\n" +
                "`help`")
            .setFooter({ text: `Baecon Bot Version: ${clientconfig.version}` })
            .setColor(colorconfig.main as ColorResolvable);

        // Settings Embed
        const helpSettingsEmbed = new Discord.EmbedBuilder()
            .setTitle(":gear: Settings Commands")
            .setDescription("**Type b- before each command:**\n" +
                "`none`")
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

        if (args[0] == "currency")
            message.channel.send({ embeds: [helpCurrencyEmbed] });
        else if (args[0] == "fun")
            message.channel.send({ embeds: [helpFunEmbed] });
        else if (args[0] == "utility")
            message.channel.send({ embeds: [helpUtilityEmbed] });
        else if (args[0] == "settings")
            message.channel.send({ embeds: [helpSettingsEmbed] });
        else
            message.channel.send({ embeds: [helpEmbed] });

    } catch (err) {
        message.reply("Sorry this doesn't seem to be working at the moment.")
        Debug.logError(err as string, `${require("path").basename(__filename)}`)
    }
}

const nameData = {
    name: "help",
    aliases: []
}

const tags: ECommandTags[] = [ECommandTags.Utility] 

export { commandFunction, nameData, tags }