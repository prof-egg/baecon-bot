import Discord from "discord.js"
import { Client, GatewayIntentBits, Partials } from "discord.js"
import mongoose from "mongoose";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent], partials: [Partials.Channel, Partials.Message] });

import * as Command from "./library/classes/CommandHandler";
import * as UserAccount from "./library/classes/AccountManager";
import { Util } from "./library/classes/Util";

import clientconfig from "./config/client.json"
import { Debug } from "./library/classes/Debug";

require("dotenv").config()
require("./commands/routines/catchwarnings")

client.on("ready", async () => {

    // Load commands and routines (cmd loader called here because client.guilds.cache is referenced, and you can't reference it until the client is "ready")
    Command.Handler.loadSlashCommandParentFolder(client, "dist/commands/slash_commands")
    Command.Handler.loadTextCommandParentFolder(client, "dist/commands/text_commands")

    // Ready
    client.user?.setActivity(`${clientconfig.prefix}help`)
    Util.colorLog("green", `${client.user?.username} is online in ${client.guilds.cache.size} servers!`);
})


// handle slash commands events
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isCommand()) return

    interaction = interaction as Discord.ChatInputCommandInteraction
    Command.Handler.getAndExecuteSlashCommand(interaction, client)

})

// handle text commands
client.on("messageCreate", async (message) => {

    // Return if event is in dm channel, is created by a bot, or doesnt start with bot prefix NOTE: make it so the clientconfig prefix section is an array of acceptable prefixes
    if (message.channel.type == Discord.ChannelType.DM) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(clientconfig.prefix)) return;

    // ADD A COOLDOWN SECTION RIGHT HERE

    // Check if command used has the currecy tag, if it does and user doesnt have an account, create one, if they do have an account NOTE: ADD SOME OTHER STUFF
    if (Command.Handler.textCommandHasTag(message, Command.ECommandTags.Currency)) {

        // Try and get account
        let account = await UserAccount.Manager.getUserAccount(message.author.id)
        
        // If account does not exist, create one
        if (!account) account = await UserAccount.Manager.createAccount({ name: message.author.username, userID: message.author.id })
        
        // If account creation went wrong, log error and tell user
        if (!account) {
            try {
                Debug.logError("account creation fault", "index.ts")
                message.reply("There was an error with your account creation. Please try again later.")
            } catch (e) {
                Debug.logError(<string>e, "index.ts")
            }
            return
        }

        // If they are playing a game exit the function with no notice, we don't to let the user use other commands while playing games
        let isPlayingGame = UserAccount.Manager.getActivityState(account, "isPlayingGame")
        if (isPlayingGame) return
        
        // Execute currency command with account option
        Command.Handler.getAndExecuteTextCommand(message, client, account);
     
    } else {
        // If command does not have currency command tag, execute command without account option
        let ranCommand = Command.Handler.getAndExecuteTextCommand(message, client);
    }
})

async function start() {
    // Connect to mongo db
    Util.colorLog("magenta", "connecting to mongodb...")
    await mongoose.connect(process.env.MONGO_PASS as string)

    // Only after connecting to mongo db start the client
    Util.colorLog("magenta", "starting client...")
    client.login(process.env.CLIENT_TOKEN)
}
start()