const Discord = require('discord.js');
const logger = require('winston');
const Chance = require('chance');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

/**
 * Slapbot class
 * Slaps people on command
 */
class Slapbot {

    /**
     * @constructor
     * @param {string} token - Token to use to connect
     */
    constructor(token) {
        this.token = token;
        this.chance = new Chance();
        this.client = new Discord.Client();

        this.client.on('ready', function() {
            logger.info('Connected');
            logger.info('Logged in as: ' + bot.username + ' - (' + bot.id + ')');
        });

        this.client.on('message', (receivedMessage) => {
            // Prevent bot from responding to its own messages
            if (receivedMessage.author == client.user) {
                return;
            }
            //if the message starts with a ! then pass it on the the function
            if (receivedMessage.content.startsWith("!")) {
                this.slapCommand(receivedMessage);
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
     * React to a slap command
     * @param {*} receivedMessage - the received message to respond to.
     */
    slapCommand(receivedMessage) {
        // Remove the leading exclamation mark and the space
        let fullCommand = receivedMessage.content.substr(2);
        // Split the message up in to pieces for each space/simulate an array
        let splitCommand = fullCommand.split(" ");
        // The first word directly after the exclamation is the user to slap 
        let userName = splitCommand[0];
        // All other words are arguments/parameters/options for the command
        let arguments = splitCommand.slice(1);

        if (arguments.length > 0)
            receivedMessage.channel.send("slaps " + userName + " with a " + arguments);
        else
            receivedMessage.channel.send("slaps " + userName + " with a trout");
    }
}

modules.exports = Slapbot;