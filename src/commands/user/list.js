const User = require('../../helpers/user')
const Command = require('../command')
let logger = require('winston')
const _ = require('lodash')

/**
 * Set role for a user
 *
 */
class List extends Command {

    constructor() {
        super({})
    }

    static get signature() {
        return 'list'
    }
    /**
     * Switch between what command to run based in the first param after !
     *
     * @param {*} receivedMessage
     */
    handle(receivedMessage) {
        User.getUsers()
            .then((users) => {
                users = users.map(({
                    id,
                    role
                }) => `${this.getUsername(id,receivedMessage)} - ${role}`).join('\n')

                receivedMessage.channel.send(`Users;\n${users}`)
            })
            .catch(err => {
                logger.error(err.message)
            })
    }

    getUsername(id, receivedMessage) {
        const member = receivedMessage.guild.members.get(id)

        return _.isEmpty(member) ? id : member.user.username
    }
}

module.exports = List