const _ = require('lodash')
const User = require('../helpers/user')
/**
 * Command base class
 * Definition of how commands should be set up
 */
class Command {

    constructor(subCommands) {
        this.subCommands = subCommands
    }

    /**
     * The command's string signature e.g. "/user" user would be the signature
     * abstract static member
     */
    static get signature() {
        throw new Error('Signature needs to be set')
    }

    /**
     * The user roles allowed to use the command
     * abstract static member
     */
    static get allowedRoles() {
        return _.without(User.roles, 'banned')
    }

    /**
     * Run the command
     * abstract
     *
     * @param {*} receivedMessage
     */
    handle(receivedMessage) {
        throw new Error('Function is abstract')
    }

    /**
     * Run the command
     * abstract
     *
     * @param {*} receivedMessage
     */
    handleSubCommands(receivedMessage) {
        let commandKey = receivedMessage.command.split(' ')[0]
        receivedMessage.command = receivedMessage.command.substr(commandKey.length + 1)

        if (!this.subCommands.hasOwnProperty(commandKey)) {
            return receivedMessage.channel.send("Command doesn't exist")
        }

        this.subCommands[commandKey].allowed(receivedMessage.author)
            .then((allowed) => {
                if (allowed) {
                    this.subCommands[commandKey].handle(receivedMessage)
                } else {
                    receivedMessage.channel.send("You don't have permission to use this command")
                }
            })
            .catch(err => {
                logger.error(err)
            })
    }

    nextParam(receivedMessage) {
        let param = receivedMessage.command.split(' ')[0]
        receivedMessage.command = receivedMessage.command.substr(param.length + 1)
        return {
            param,
            receivedMessage
        }
    }

    async allowed(author) {
        const user = await User.getUser(author.id)
        const role = _.get(user, 'role', 'guest')
        if (!_.includes(this.constructor.allowedRoles, role)) {
            return false
        }
        return true;
    }
}


module.exports = Command