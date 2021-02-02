const User = require('../../helpers/user')
const Command = require('../command')
const _ = require('lodash')
let logger = require('winston')

/**
 * Display all possible user roles
 *
 */
class Remove extends Command {

    constructor() {
        super({})
    }

    static get signature() {
        return 'remove'
    }

    static get allowedRoles() {
        return ['admin']
    }

    /**
     * @param {*} receivedMessage
     */
    handle(receivedMessage) {
        let param = '';
        ({
            param,
            receivedMessage
        } = this.nextParam(receivedMessage))

        if (!User.isValidMention(param, receivedMessage.guild)) {
            receivedMessage.channel.send('Invalid mention')
            return
        }
        const user = _.get(receivedMessage.guild.members.get(User.getIdFromMention(param)), 'user')

        if (_.isEmpty(user)) {
            receivedMessage.channel.send('Invalid mention')
            return
        }

        if (user.bot) {
            receivedMessage.channel.send("Bots can't have roles")
            return
        }

        User.removeUser(user.id)
            .then(() => {
                receivedMessage.channel.send(`Removed user ${user.username}`)
            })
            .catch(err => {
                logger.error(err.message)
            })

    }
}

module.exports = Remove