require('dotenv').config()
const Discord = require('discord.js')
const Chance = require('chance')
const loadJsonFile = require('load-json-file')
let logger = require('winston')
let whitelist = loadJsonFile.sync('./config/whitelist.json')
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
            // get the author of the message
            let userSent = receivedMessage.author.toString()
                // Whitelist to prevent non whitelisted users using commands.
            if (this.whitelistEnabled && !whitelist.includes(receivedMessage.author.id)) {
                return
            }
            // Blacklist to prevent blacklisted users using commands.
            if (this.blacklistEnabled && blacklist.includes(receivedMessage.author.id)) {
                return
            }

            // if the message starts with a . then pass it on the the function
            if (receivedMessage.content.startsWith('.')) {
                // get the author of the message
                // Remove the leading period and the space into new member
                receivedMessage.command = receivedMessage.content.substr(1)
                this.commandSwitch(receivedMessage, userSent)
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
    commandSwitch(receivedMessage, userSent) {
        // Get command to use 
        let commandKey = receivedMessage.command.split(' ')[0]
            // Remove the command key from the string
        receivedMessage.command = receivedMessage.command.substr(commandKey.length + 1)

        // Call the correct command
        switch (commandKey) {
            //available to everyone in the server the bot is in
            case 'slap':
                this.slapCommand(receivedMessage, userSent)
                break
            case 'nuke':
                //could just check for permission here
                this.nukeCommand(receivedMessage, userSent)
                break
                //only available to the admin
            case 'stop':
                this.stopCommand(receivedMessage)
                break
            default:
                // Unknown command
                break
        }
    }

    /**
     * React to a slap command
     * @param {*} receivedMessage - the received message to respond to.
     * @param {*} userSent - the user who sent the request for the slap
     */
    slapCommand(receivedMessage, userSent) {
        // Split the message up in to pieces for each space/simulate an array
        let splitCommand = receivedMessage.command.split(' ')
            // The first word directly after slap is the user to slap 
        let userName = splitCommand[0]
            // All other words are arguments/parameters/options for the command
        let args = splitCommand.slice(1)
        let argString = args.join(' ')
        if (args.length > 0) {
            receivedMessage.channel.send(userSent + ` slaps ${userName} with a ${argString}`).then((sentMessage) =>
                sentMessage.react(this.generateEmoji()));
        } else
            receivedMessage.channel.send(userSent + ` slaps ${userName}`).then((sentMessage) =>
                sentMessage.react(this.generateEmoji()));
    }

    /**
     * Generate a random Emoji
     * @param none
     */
    generateEmoji() {
        return this.chance.pickone(['😀', '😁', '😂', '🤣', '😄',
            '😅', '😆', '😊', '😋', '😎', '😗', '😙', '😛', '😜', '😝',
            '🤪', '😵', '🤡', '😈', '💀', '👻', '👽', '🤖',
            '💩', '😺', '😸', '😹', '🙀', '😿', '😾', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌', '🤟', '🤘',
            '👌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '👀', '🐡', '🐟',
            '🐬', '🌚', '‍☠️',
        ])
    }

    /**
     * React to a nuke command
     * @param {*} receivedMessage - the received message to respond to.
     * @param {*} userSent - the user who sent the message, specifically Fshy
     */
    nukeCommand(receivedMessage, userSent) {
        // Split the message up in to pieces for each space/simulate an array
        let splitCommand = receivedMessage.command.split(' ')
            // The first word directly after slap is the user to slap 
        let userName = splitCommand[0]

        //if the person is not Fshy, then the bot is not going to do anything
        if (this.checkPermission('nuker', receivedMessage.author.id)) {
            receivedMessage.channel.send(userSent + ` nukes ${userName}`);
        }
    }

    /**
     * React to a stop command
     * Ensure admin is using the command, then destroy client
     * @param {*} receivedMessage - the, received messaged to respond to.
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
}

module.exports = Slapbot