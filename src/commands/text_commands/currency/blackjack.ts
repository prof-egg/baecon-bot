// import Discord, { ColorResolvable } from "discord.js";
// import { ITextCommandFunc, ECommandTags } from "../../../library/classes/CommandHandler";
// import Util from "../../../library/classes/Util";
// import { Manager } from "../../../library/classes/AccountManager";
// import { Debug } from "../../../library/classes/Debug";

// import emojiID from "../../../config/emoji.json"
// import cooldowns from "../../../config/cooldowns.json"
// import colorconfig from "../../../config/colors.json";
// import { Card, CardGame } from "../../../library/classes/CardGame";

// const commandFunction: ITextCommandFunc = async (message, args, client, authorAccount) => {

//     // COMMAND SETTINGS:
//     let cooldownData = cooldowns.blackjack
//     let minStartBet = 100
//     let maxStartBet = 100_000

//     // COMMAND CHECKS
//     // Assign a variable to hold args[0] to make it more readable 
//     let enteredStartingBet = args[0]

//     // Get user (Discord.User) and userAccount (TUserDoc)
//     if (!authorAccount) {
//         message.reply(`There was an error with finding ${message.author.username}'s account. Please try again later`)
//         Debug.logWarning(`Could not find ${message.author.username}'s account`, "beg.ts")
//         return
//     }

//     // Check for cooldown, send cooldown message if on cooldown and exit the function
//     if (Manager.isOnCooldown(authorAccount, cooldownData)) {
//         let timeLeft = Manager.getTimeLeftOnCooldownParsed(authorAccount, cooldownData)

//         const cooldownEmbed = new Discord.EmbedBuilder()
//             .setDescription(`You can play again in ${timeLeft.seconds}s.`)
//             .setColor(colorconfig.main as ColorResolvable)

//         return message.channel.send({ embeds: [cooldownEmbed] })
//     }

//     // Define help embed as it is used in multiple lines
//     const helpEmbed = new Discord.EmbedBuilder()
//         .setTitle("Blackjack Command")
//         .setDescription("**Syntax:** `b-blackjack [bet]`")
//         .addFields({
//             name: "Command Tips:", value:
//                 "Replace `[bet]` with the word `all` to bet all of the bits in your wallet.\n" +
//                 "Replace `[bet]` with the word `half` to bet half of the bits in your wallet.\n" +
//                 "Aliases: `b-bj`"
//         }, {
//             name: "BlackJack Rules:", value:
//                 `No double downs.\n` +
//                 `No splittig.\n` +
//                 `Five card charlie.\n` +
//                 `One deck shoe.`
//         }, {
//             name: "Starting Bet Rules:", value:
//                 `Minimum Starting Bet: **\`${minStartBet.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}\n` +
//                 `Maximum Starting Bet: **\`${maxStartBet.toLocaleString()}\`**${Util.emoji(client, emojiID.bits)}\n`
//         })
//         .setFooter({ text: "This is being shown because you used unrecognized command syntax." })
//         .setColor(colorconfig.main as ColorResolvable)

//     // Send help embed if user did not input an amount
//     if (!enteredStartingBet) return message.channel.send({ embeds: [helpEmbed] })

//     // Calculate the withdrawal amount, while checking for errors and such
//     let startingBet = 0;
//     let possibleBet = parseInt(enteredStartingBet)
//     if (possibleBet) // If parseInt() actually returned a number and not undefined
//         startingBet = possibleBet

//     else {
//         // Since parseInt() returned undefined, check if its for certain allowed keywords, if not display help message
//         if (enteredStartingBet == "all") startingBet = authorAccount.wallet
//         else if (enteredStartingBet == "half") startingBet = Math.floor(authorAccount.wallet / 2)
//         else return message.channel.send({ embeds: [helpEmbed] })
//     }

//     // Check if the amount they are trying to bet is less than the minimum starting bet (100), or greater than the maximum starting bet (100,000)
//     if (startingBet < minStartBet) return message.channel.send({ embeds: [helpEmbed] })
//     if (startingBet > maxStartBet) return message.channel.send({ embeds: [helpEmbed] })

//     // Check if they are trying to manually withdraw more than they have
//     if (startingBet > authorAccount.wallet) return message.channel.send({ embeds: [Util.embedMessage("You don't have that many bits to bet.")] })



//     // PREPARING THE GAME
//     // change is playing statis and save
//     await Manager.setUserActivity(authorAccount, "isPlayingGame", true, true) // Saved right here because it is important to do so for the command handler

//     // declare money gain or lost values
//     let moneyLostIfLost = startingBet
//     let p11 = startingBet
//     let p32 = Math.floor(startingBet * 1.5) - startingBet // This means a payout of a 3:2 ratio
//     let p21 = Math.floor(startingBet * 2) - startingBet // This means a payout of a 2:1 ratio

//     // Player and blackjack data perperation
//     let playerKey = "player"
//     const blackjack = new CardGame([playerKey])
//     blackjack.drawCard({ playerKey, amount: 2 })
//     blackjack.drawCard({ amount: 2 }) // draw 2 cards for the house

//     while (blackjack.totalHandValue() < 17) {
//         blackjack.drawCard() // draw 1 card for the house

//         let filterAceIndexes = blackjack.cardFilter({ face: "A", value: 11 }) // get the indexes of ace's worth 11 from the house
//         if (filterAceIndexes.length > 0 && blackjack.totalHandValue() > 21) blackjack.editCardInHand(filterAceIndexes[0], { value: 1 })
//     }

//     const fields: Discord.APIEmbedField[] = [{}] // do field stuff
//     const gameEmbed = new Discord.EmbedBuilder()
//         .setTitle(`${message.author.username}'s Blackjack Game`)
//         .addFields(fields)

// }

// const nameData = {
//     name: "blackjack",
//     aliases: ["bj"]
// }

// const tags: ECommandTags[] = [ECommandTags.Currency]

// export { commandFunction, nameData, tags }