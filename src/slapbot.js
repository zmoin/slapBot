require('dotenv').config()
const Discord = require('discord.js')
const Chance = require('chance')
const loadJsonFile = require('load-json-file')
let logger = require('winston')
let whitelist = new Set(loadJsonFile.sync('./config/whitelist.json'))
let blacklist = loadJsonFile.sync('./config/blacklist.json')
let permissions = loadJsonFile.sync('./config/permissions.json')

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
            if (this.whitelistEnabled && !whitelist.includes(receivedMessage.author.id) &&
                !this.checkPermission("admin", receivedMessage.author.id)) {
                return
            }
            // Blacklist to prevent blacklisted users using commands.
            //can't be blacklisted if you're the admin
            if (this.blacklistEnabled && blacklist.includes(receivedMessage.author.id) &&
                !this.checkPermission("admin", receivedMessage.author.id)) {
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
            case 'add':
                this.addWhitelist(receivedMessage);
                break;
            case 'whitelist':
                this.toggleWhitelist(receivedMessage);
                break;
            case 'blacklist':
                this.toggleBlacklist(receivedMessage);
                break;
            default:
                // Unknown command
                break
        }
    }

    /**
     * BROKEN******
     * Add a user to the whitelist to use the command privilages
     * @param {*} receivedMessage - the received message to respond to
     */

    addWhitelist(receivedMessage) {
        var fs = require('fs');
        let wl = new Set(this.whitelist)
        var obj = new Set()

        // Split the message up in to pieces for each space/simulate an array
        let splitCommand = receivedMessage.command.split(' ')

        //adding values to the set object
        splitCommand.forEach(user => {
            if (this.isValidMention(user, receivedMessage.guild) == false)
                return
            else if (wl.has(user))
                receivedMessage.channel.send("YEAS BITCH")
            else {
                receivedMessage.channel.send(user + " is Whitelisted")
                var userID = user.replace(/[<@!>]/g, '');
                //adding the userID NUMBERS to the obj SET
                obj.add(userID);
            }
        })

        obj.forEach(key => {
            console.log("KEY " + key);
            wl.add(key);
        });
        var json = JSON.stringify([...wl]); //convert it back to json
        fs.writeFile('config/whitelist.json', json, 'utf8', (err) => { // write it back 
            console.log(wl);
            if (err)
                console.log(err);
            else
                this.whitelist = wl;
        });
    }

    /**
     * Check if a string is a valid mention for a given guild
     * @param {String} stringToCheck - String to check
     * @param {Guild} guild - Guild/Server to check the mention against
     */
    isValidMention(stringToCheck, guild) {
        if (!/^<@[!&]?\d+>$/.test(stringToCheck))
            return false
        let userId = stringToCheck.substr(2, stringToCheck.length - 3);
        if (guild.members.keyArray().includes(userId)) {
            return true
        }
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

        //if the person is not "nuker", then the bot is not going to do anything
        if (this.checkPermission('nuker', receivedMessage.author.id)) {
            //other the bot will send the message to the channel and also react using one of the 3 emojis
            receivedMessage.channel.send(receivedMessage.author.toString() + ` nukes ` + receivedMessage.mentions.members.first()).then((sentMessage) =>
                sentMessage.react(this.chance.pickone(['💣', '🔥', '💥']))).then(console.log("Reacted")).catch(console.error);
        }
    }

    /**
     * React to a stop command
     * Ensure admin is using the command, then destroy client
     * @param {*} receivedMessage - the received message to respond to.
     */
    stopCommand(receivedMessage) {
        if (this.checkPermission('admin', receivedMessage.author.id)) {
            this.stop()
        }
    }

    /**
     * Checks if a user id is listed for a given permission
     * @param {string} permission - the permission to check for
     * @param {string} id - ID of user to check for permission
     */
    checkPermission(permission, id) {
        if (permissions.hasOwnProperty(permission)) {
            return permissions[permission].includes(id)
        }
    }

    /**
     * Toggles whitelist mode
     * @param {*} receivedMessage - The received message to respond to
     */
    toggleWhitelist(receivedMessage) {
        if (this.checkPermission("admin", receivedMessage.author.id)) {
            this.whitelistEnabled = !this.whitelistEnabled;
            receivedMessage.channel.send(`Whitelist ${this.whitelistEnabled ? "enabled" : "disabled"}`);
        }
    }

    /**
     * Toggles blacklist mode
     * @param {*} receivedMessage - The received message to respond to
     */
    toggleBlacklist(receivedMessage) {
        if (this.checkPermission("admin", receivedMessage.author.id)) {
            this.blacklistEnabled = !this.blacklistEnabled;
            receivedMessage.channel.send(`Blacklist ${this.blacklistEnabled ? "enabled" : "disabled"}`)
        }
    }
}

module.exports = Slapbot