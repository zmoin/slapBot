const User = require('../../helpers/user')
const Command = require('../command')
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

    static get roles() {
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

        if (!isValidMention(param, receivedMessage.guild)) {
            return receivedMessage.channel.send('Invalid mention')
        }
        const user = receivedMessage.guild.members.get(getIdFromMention(param)).user;

        User.removeUser(user.id)
            .then(() => {
                receivedMessage.channel.send(`Removed user ${user.id}`)
            })
            .catch(err => {
                logger.error(err)
            })

    }
}

module.exports = Remove