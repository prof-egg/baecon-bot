# About this project
This fun passion/hobby project that I like to work on here and there, it helps me practice using git and of course typescipt. I'm not exactly invested in this project either so no pull requests or anything like that, just something I like to work on from time to time. This is the fourth version I have of the bot. I lost the code for the first version, I ended up scrapping the second version after working on it for a long time for a cleaner codebase, and then the third version didn't get very far at all before I rebooted to get the fourth version which would be written in TypeScript instead of JavaScript.

## Features
- MongoDB `database storage`.
- Text and slash `command loading`.
- Interactive card game (not yet actually but I'll forget to add it in the feature section once it is implemented)
## Downloading the source code
There are some things you need to do before you can run the source code.
- Download any node-js dependencies listed in the `package.json` file.
- Download the typescript compiler.
- Replace the example environment file with your own variables.
  - Discord client/bot token/key.
  - MongoDB pass.
- Create your own discord bot application using the discord developer portal and invite it to a server.
- Replace all custom discord emoji IDs used by the bot.
  
Although the steps are listed, this repo isn't meant to be downloaded to be used functionally. It's just here for people who know what they are doing and want to peak inside for one reason or another.
## Gitignore oddities
There are two things you don't need to worry about replacing that are listed in the `.gitignore` file. 
1. The `dist` folder is where the compiled javascript will go and will be created automatically when you compile the typescript.
2. The `tr` folder is just a folder I use for convenient javascript code testing, and is not integral to the bot in any way.
- - -
###### **Note:** This repo will not be documented or hold your hand with any of the source code itself. It is just meant for those who can take a look inside and understand on their own. I am too lazy to document anything with markdown files and such.
###### That being said, I try to keep my code nice and tidy as a force of habit, so there will be plenty of comments inside that may help out (that is if I wasn't too lazy to write those either).