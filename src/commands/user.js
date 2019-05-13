const Command = require('./command')
const SetRole = require('./user/setrole')
const Roles = require('./user/roles')
const List = require('./user/list')
const LoadChannel = require('./user/loadchannel')

/**
 * User commands
 *
 */
class User extends Command {

    constructor() {
        super({
            [SetRole.signature]: new SetRole(),
            [Roles.signature]: new Roles(),
            [List.signature]: new List(),
            [LoadChannel.signature]: new LoadChannel()
        })
    }

    static get signature() {
        return 'user'
    }

    /**
     * Switch between what command to run based in the first param after !
     *
     * @param {*} receivedMessage
     */
    handle(receivedMessage) {
        this.handleSubCommands(receivedMessage);
    }
}

module.exports = User