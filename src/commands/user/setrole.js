const User = require('../../helpers/user')
const Command = require('../command')
let logger = require('winston')
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

    static get roles() {
        return ['admin']
    }

    /**
     * Switch between what command to run based in the first param after !
     *
     * @param {*} receivedMessage
     */
    handle(receivedMessage) {
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
            .then(() => {
                receivedMessage.channel.send(`${user.tag}'s role has been set to ${param}`)
            })
            .catch(err => {
                logger.error(err)
            })
    }
}

module.exports = SetRole