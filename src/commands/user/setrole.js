const User = require('../../helpers/user')
const Command = require('../command')
const _ = require('lodash')
let logger = require('winston')
const {
    isValidMention,
    getIdFromMention
} = require('../../helpers/user')

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

    static get allowedRoles() {
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
            receivedMessage.channel.send('Invalid mention')
            return
        }
        const user = _.get(receivedMessage.guild.members.get(getIdFromMention(param)), 'user')

        if (_.isEmpty(user)) {
            receivedMessage.channel.send('Invalid mention')
            return
        }

        if (user.bot) {
            receivedMessage.channel.send("Bots can't have roles")
            return
        }

        ({
            param,
            receivedMessage
        } = this.nextParam(receivedMessage))

        if (!User.isValidRole(param)) {
            receivedMessage.channel.send(`${param} is an invalid role`)
            return
        }

        User.setRole(param, user.id)
            .then(() => {
                receivedMessage.channel.send(`${user.tag}'s role has been set to ${param}`)
            })
            .catch(err => {
                logger.error(err.message)
            })
    }
}

module.exports = SetRole