const Discord = require('discord.js')
const Chance = require('chance')
const loadJsonFile = require('load-json-file')
const UserCommand = require('./commands/user')
const User = require('./helpers/user')
const Knex = require('knex');
const knexConfig = require('../knexfile');
const {
    Model
} = require('objection');
const knex = Knex(knexConfig[process.env.NODE_ENV]);
let logger = require('winston')
let whitelist = loadJsonFile.sync('./config/whitelist.json')
let blacklist = loadJsonFile.sync('./config/blacklist.json')

Model.knex(knex);

/**
 * Slapbot class
 * Slaps people on command
 */
class Slapbot {

    /**
     * @constructor
     * @param {object} options - Options objects to configure the bot
     * @param {string} options.token - Token to use to connect
     * @param {boolean=} options.whitelist - Whether to use the whitelist
     * @param {boolean=} options.blacklist - Whether to use the blacklist
     */
    constructor(options) {
        if (!options.token) {
            return
        }
        this.token = options.token
        this.whitelistEnabled = options.whitelist || false
        this.blacklistEnabled = options.blacklist || false
        this.commands = {
            [UserCommand.signature]: new UserCommand()
        }

        this.chance = new Chance()
        let client = new Discord.Client()
        this.client = client

        this.client.on('ready', () => {
            logger.info('Connected')
            logger.info(`Logged in as: ${client.user.username} - (${client.user.id})`)
        })

        this.client.on('message', (receivedMessage) => {
            // Prevent bot from responding to its own messages
            if (receivedMessage.author.id == client.user.id) {
                return
            }

            // Whitelist to prevent non whitelisted users using commands.
            //don't need to be whitelisted if you're the admin
            if (this.whitelistEnabled && !whitelist.includes(receivedMessage.author.id)) {
                return
            }
            // Blacklist to prevent blacklisted users using commands.
            //can't be blacklisted if you're the admin
            if (this.blacklistEnabled && blacklist.includes(receivedMessage.author.id)) {
                return
            }

            // if the message starts with a . then pass it on the the function
            if (receivedMessage.content.startsWith('/')) {
                // get the author of the message
                // Remove the leading period and the space into new member
                receivedMessage.command = receivedMessage.content.substr(1)
                this.commandSwitch(receivedMessage)
            }
        })
    }

    /**
     * Start the bot
     */
    start() {
        logger.info('Slapbot starting')
        this.client.login(this.token)
    }

    /**
     * Stop the bot
     */
    stop() {
        logger.info('Slapbot stopping')
        this.client.destroy()
    }

    /**
     * Switch between what command to run based in the first param after !
     *
     * @param {*} receivedMessage
     */
    commandSwitch(receivedMessage) {
        // Get command to use
        let commandKey = receivedMessage.command.split(' ')[0]
        // Remove the command key from the string
        receivedMessage.command = receivedMessage.command.substr(commandKey.length + 1)

        // Call the correct command
        switch (commandKey) {
            //available to everyone in the server the bot is in
            case 'slap':
                this.slapCommand(receivedMessage)
                break
            case 'nuke':
                this.nukeCommand(receivedMessage)
                break
                //only available to the admin
            case 'stop':
                this.stopCommand(receivedMessage);
                break;
            case 'whitelist':
                this.toggleWhitelist(receivedMessage);
                break;
            case 'blacklist':
                this.toggleBlacklist(receivedMessage);
                break;
            default:
                if (!this.commands.hasOwnProperty(commandKey)) {
                    return receivedMessage.channel.send("Command doesn't exist")
                }

                this.commands[commandKey].allowed(receivedMessage.author)
                    .then((allowed) => {
                        if (allowed) {
                            this.commands[commandKey].handle(receivedMessage)
                        } else {
                            receivedMessage.channel.send("You don't have permission to use this command")
                        }
                    })
                    .catch(err => {
                        logger.error(err)
                    })
                break;
        }
    }


    /**
     * Check if a string is a valid mention for a given guild
     * @param {String} stringToCheck - String to check
     * @param {Guild} guild - Guild/Server to check the mention against
     */
    isValidMention(stringToCheck, guild) {
        let retVal = false;

        let userId = stringToCheck.substr(2, stringToCheck.length - 3);
        //checked for the ! and also added an extra space for a character in the regExp
        //! in front of the userName means the user has a nickname in the channel
        if (userId.startsWith('!')) {
            userId = userId.substr(1)
        }

        console.log("STRING TO CHECK :" + stringToCheck + " TESTING :" + /^<@.\d+>$/.test(stringToCheck))
        console.log("USER ID USING: " + userId);
        console.log("GUILD MEMBER STATUS :" + guild.members.keyArray().includes(userId))
        //if the guild contains the userID && the member is in the server, then return as valid
        if (/^<@.\d+>$/.test(stringToCheck) && guild.members.keyArray().includes(userId)) {
            retVal = true
        }

        console.log("RETURNING : " + retVal)

        return retVal;

    }

    /**
     * React to a slap command
     * @param {*} receivedMessage - the received message to respond to
     */
    slapCommand(receivedMessage) {
        // Split the message up in to pieces for each space/simulate an array
        let splitCommand = receivedMessage.command.split(' ')

        // Check if the first word after slap is the user to slap
        let userToSlap = splitCommand[0];
        //if this is NOT a valid user then return
        if (this.isValidMention(userToSlap, receivedMessage.guild) == false)
            return
        // All other words are arguments/parameters/options for the command
        let args = splitCommand.slice(1)
        console.log(args)

        let vowel = args.map(function(vowels) {
            return vowels.charAt(0)
        })[0]
        console.log("FIRST LETTER : " + vowel)

        let article = 'a'
        //switch statement was acting weird (??) we could retry refactoring this
        if (vowel == 'a' || vowel == 'e' || vowel == 'i' || vowel == 'o' || vowel == 'u')
            article = 'an'
        console.log("ARTICLE USED :" + article)

        let argString = args.join(' ')

        if (args.length > 0) {
            receivedMessage.channel.send(receivedMessage.author.toString() + ` slaps ` + userToSlap + ` with ` + article + ` ${argString}`).then((sentMessage) =>
                sentMessage.react(this.generateEmoji())).then(console.log("Reacted")).catch(console.error);
        } else
            receivedMessage.channel.send(receivedMessage.author.toString() + ` slaps ` + userToSlap).then((sentMessage) =>
                sentMessage.react(this.generateEmoji())).then(console.log("Reacted")).catch(console.error);

    }




    /**
     * Generate a random Emoji
     * For now it is only using chancejs to pick one from the given array
     * until a better method is found
     * @param none
     */
    generateEmoji() {
        return this.chance.pickone(['😀', '😁', '😂', '🤣', '😄',
            '😅', '😆', '😊', '😋', '😎', '😗', '😙', '😛', '😜', '😝', '😵', '🤡', '😈', '💀', '👻', '👽', '🤖',
            '💩', '😺', '😸', '😹', '🙀', '😿', '😾', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌', '🤟', '🤘',
            '👌', '👈', '👉', '👆', '👇', '✋', '🤚', '🖐', '☝',
            '🖖', '👋', '🤙', '💪', '👀', '🐡', '🐟',
            '🐬', '🌚', '☠', "561778753987149825", "560267944773287949", "560268022233956363", "560837630204444691", "560838509347209235", "561783060572667909"
        ])
    }

    /**
     * React to a nuke command ***specifically requested*
     * @param {*} receivedMessage - the received message to respond to.
     */
    nukeCommand(receivedMessage) {
        //if there are no users mentioned, then return withot doing anything
        if (!receivedMessage.mentions.users.first())
            return

        User.hasRole("nuker", receivedMessage.author.id)
            .then((userHasRole) => {
                //if the person is not "nuker", then the bot is not going to do anything
                if (userHasRole) {
                    //other the bot will send the message to the channel and also react using one of the 3 emojis
                    receivedMessage.channel.send(receivedMessage.author.toString() + ` nukes ` + receivedMessage.mentions.members.first())
                        .then((sentMessage) =>
                            sentMessage.react(this.chance.pickone(['💣', '🔥', '💥']))).then(console.log("Reacted"))
                        .catch(console.error);
                }
            })
            .catch(err => {
                logger.error(err)
            })
    }

    /**
     * React to a stop command
     * Ensure admin is using the command, then destroy client
     * @param {*} receivedMessage - the received message to respond to.
     */
    stopCommand(receivedMessage) {
        User.hasRole("admin", receivedMessage.author.id)
            .then((userHasRole) => {
                if (userHasRole) {
                    this.stop()
                }
            })
            .catch(err => {
                logger.error(err)
            })
    }

    /**
     * Toggles whitelist mode
     * @param {*} receivedMessage - The received message to respond to
     */
    toggleWhitelist(receivedMessage) {
        User.hasRole("admin", receivedMessage.author.id)
            .then((userHasRole) => {
                if (userHasRole) {
                    this.whitelistEnabled = !this.whitelistEnabled;
                    receivedMessage.channel.send(`Whitelist ${this.whitelistEnabled ? "enabled" : "disabled"}`);
                }
            })
            .catch(err => {
                logger.error(err)
            })
    }

    /**
     * Toggles blacklist mode
     * @param {*} receivedMessage - The received message to respond to
     */
    toggleBlacklist(receivedMessage) {
        User.hasRole("admin", receivedMessage.author.id)
            .then((userHasRole) => {
                if (userHasRole) {
                    this.blacklistEnabled = !this.blacklistEnabled;
                    receivedMessage.channel.send(`Blacklist ${this.blacklistEnabled ? "enabled" : "disabled"}`)
                }
            })
            .catch(err => {
                logger.error(err)
            })
    }
}

module.exports = Slapbot