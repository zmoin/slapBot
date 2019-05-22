const User = require('../../helpers/user')
const Command = require('../command')

/**
 * Display all possible user roles
 *
 */
class Roles extends Command {

    constructor() {
        super({})
    }

    static get signature() {
        return 'roles'
    }

    /**
     * Switch between what command to run based in the first param after !
     *
     * @param {*} receivedMessage
     */
    handle(receivedMessage) {
        const roles = User.roles
        receivedMessage.channel.send(`The roles are ${roles.join(', ')}`)
    }
}

module.exports = Roles