require('dotenv').config()
const Discord = require('discord.js');
const Chance = require('chance');
const loadJsonFile = require('load-json-file');
let logger = require('winston');
let whitelist = loadJsonFile.sync('./config/whitelist.json');
let blacklist = loadJsonFile.sync('./config/blacklist.json');

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
            return;
        }

        this.token = options.token;
        this.whitelistEnabled = options.whitelist || false;
        this.blacklistEnabled = options.blacklist || false;

        this.chance = new Chance();
        let client = new Discord.Client();
        this.client = client;

        this.client.on('ready', () => {
            logger.info('Connected');
            logger.info(`Logged in as: ${client.user.username} - (${client.user.id})`);
        });

        this.client.on('message', (receivedMessage) => {
            // Prevent bot from responding to its own messages
            if (receivedMessage.author.id == client.user.id) {
                return;
            }
            // Whitelist to prevent non whitelisted users using commands.
            if (this.whitelistEnabled && !whitelist.includes(client.user.id)) {
                return;
            }
            // Blacklist to prevent blacklisted users using commands.
            if (this.blacklistEnabled && blacklist.includes(client.user.id)) {
                return;
            }

            //if the message starts with a ! then pass it on the the function
            if (receivedMessage.content.startsWith("/")) {
                // Remove the leading exclamation mark and the space into new member
                receivedMessage.command = receivedMessage.content.substr(1);
                this.commandSwitch(receivedMessage);
            }
        });
    }

    /**
     * Start the bot
     */
    start() {
        logger.info('Slapbot starting');
        this.client.login(this.token);
    }

    /**
     * Stop the bot
     */
    stop() {
        logger.info('Slapbot stoping');
        this.client.destroy();
    }

    /**
     * Switch between what command to run based in the first param after !
     * 
     * @param {*} receivedMessage 
     */
    commandSwitch(receivedMessage) {
        // Get command to use 
        let commandKey = receivedMessage.command.split(" ")[0];
        // Remove the command key from the string
        receivedMessage.command = receivedMessage.command.substr(commandKey.length + 1);

        // Call the correct command
        switch (commandKey) {
            case 'slap':
                this.slapCommand(receivedMessage);
                break;
            default:
                // Unknown command
                break;
        }
    }

    /**
     * React to a slap command
     * @param {*} receivedMessage - the received message to respond to.
     */
    slapCommand(receivedMessage) {
        // Split the message up in to pieces for each space/simulate an array
        let splitCommand = receivedMessage.command.split(" ");
        // The first word directly after the exclamation is the user to slap 
        let userName = splitCommand[0];
        // All other words are arguments/parameters/options for the command
        let args = splitCommand.slice(1);

        if (args.length > 0) {
            receivedMessage.channel.send(` slaps ${userName} with a ${args}`);
        } else
            receivedMessage.channel.send(`slaps ${userName} with a trout`);
    }
}

module.exports = Slapbot;