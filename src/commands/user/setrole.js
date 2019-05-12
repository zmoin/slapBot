const User = require('../../helpers/user')
const Command = require('../command')
const {
    isValidMention,
    getIdFromMention
} = require('../../helpers/user');

/**
 * Set role for a user
 *
 */
class SetRole extends Command {

    constructor() {
        super({})
    }

    static get signature() {
        return 'set-role'
    }
    /**
     * Switch between what command to run based in the first param after !
     *
     * @param {*} receivedMessage
     */
    handle(receivedMessage) {
        if (!User.hasRole("admin", receivedMessage.author)) {
            return receivedMessage.channel.send("You don't have permission to use this command")
        }

        let param = '';
        ({
            param,
            receivedMessage
        } = this.nextParam(receivedMessage))

        if (!isValidMention(param, receivedMessage.guild)) {
            return receivedMessage.channel.send('Invalid mention')
        }
        const user = receivedMessage.guild.members.get(getIdFromMention(param)).user;

        ({
            param,
            receivedMessage
        } = this.nextParam(receivedMessage))

        if (!User.isValidRole(param)) {
            return receivedMessage.channel.send(`${param} is an invalid role`)
        }

        User.setRole(param, user.id)

        return receivedMessage.channel.send(`${user.tag}'s role has been set to ${param}`)
    }
}

module.exports = SetRole