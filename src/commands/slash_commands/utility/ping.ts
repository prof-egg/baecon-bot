import { ECommandTags, ISlashCommandFunc } from "../../../library/classes/CommandHandler";

import Discord, { ColorResolvable } from "discord.js"
import clientconfig from "../../../config/client.json"
import colorconfig from "../../../config/colors.json"
import { Manager } from "../../../library/classes/AccountManager";

const commandFunction: ISlashCommandFunc = async (interaction, options, client) => {

   await interaction.deferReply()

   const reply = await interaction.fetchReply()
   const clientPing = reply.createdTimestamp - interaction.createdTimestamp

   let mongooseStartTime = Date.now()
   await Manager.getUserAccount(interaction.user.id)
   const mongoPing = Date.now() - mongooseStartTime

   const pingEmbed = new Discord.EmbedBuilder()
        .setTitle("Pong!")
        .setDescription(`**Client Ping:** ${clientPing}ms \n**Websocket Ping:** ${client.ws.ping}ms \n**MongoDB Ping:** ${mongoPing}ms`)
        .setFooter({ text: `${clientconfig.name} Version - ${clientconfig.version}` })
        .setColor(colorconfig.main as ColorResolvable)

   interaction.editReply({ embeds: [pingEmbed] })
}

const slashCmdBuildData = new Discord.SlashCommandBuilder()
    .setName('ping')
    .setDescription("Get client and websocket ping")
    .toJSON()

const tags: ECommandTags[] = [ECommandTags.Complete, ECommandTags.Utility]

export { commandFunction, slashCmdBuildData, tags }
