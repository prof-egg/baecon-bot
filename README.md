# Downloading the source code
There are some things you need to do before you before you can run the source code.
- Download any node-js dependencies listed in the `package.json` file.
- Download the typescript compiler.
- Replace the example enviroment file with your own variables.
  - Discord client/bot token/key.
  - MongoDB pass.
- Create your own discord bot application using the discord developer portal and invite it to a server.
## Gitignore oddities
There are two things you don't need to worry about replacing that are listed in the `.gitignore` file. 
1. The `dist` folder is where the compiled javascript will go and will be created automatically when you compile the typescript.
2. The `tr` folder is just a folder I use for convenient javascript code testing, and is not integral to the bot in anyway.
- - -
###### **Note:** This repo will not be documented or hold your hand with any of the source code itself. It is just meant for those who can take a look inside and understand on their own. I am too lazy to document anything with markdown files and such.
###### That being said, I try to keep my code nice and tighty as a force of habit, so there will be plenty of comments inside that may help out (that is if I wasn't too lazy to write those either).

