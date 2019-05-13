const User = require('../../helpers/user')
const Command = require('../command')
const _ = require('lodash')

/**
 * Load existing users in the channel into the db
 *
 */
class LoadChannel extends Command {

    constructor() {
        super({})
    }

    static get signature() {
        return 'load-channel'
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
        let count = 0;
        let users = receivedMessage.guild.members.filter(({
            user
        }) => {
            if (!_.isEmpty(User.getUser(user.id))) {
                return false
            }
            User.addUser(user.id)
            count++
            return true
        })
        receivedMessage.channel.send(`Loaded ${count} users into the db`)
    }
}

module.exports = LoadChannel