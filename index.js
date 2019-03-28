require('dotenv').config()
const Slapbot = require('src/slapbot.js');

let slapbot = Slapbot();
slapbot.start(process.env.DISCORD_TOKEN);