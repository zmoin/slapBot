require('dotenv').config()
const Slapbot = require('./src/slapbot.js')
let logger = require('./src/log.js')

let slapbot = new Slapbot({
    token: process.env.DISCORD_TOKEN,
    whitelist: (process.env.WHITELIST_ENABLED || 'false').toLowerCase() == 'true',
    blacklist: (process.env.BLACKLIST_ENABLED || 'false').toLowerCase() == 'true'
})
slapbot.start()