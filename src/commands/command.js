/**
 * Command base class
 * Definition of how commands should be set up
 */
class Command {

    constructor(subCommands) {
        this.subCommands = subCommands;
    }

    /**
     * abstract static member
     */
    static get signature() {
        throw new Error('Signature needs to be set')
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
        if (this.subCommands.hasOwnProperty(commandKey)) {
            this.subCommands[commandKey].handle(receivedMessage)
        }
    }

    nextParam(receivedMessage) {
        let param = receivedMessage.command.split(' ')[0]
        receivedMessage.command = receivedMessage.command.substr(param.length + 1)
        return {
            param,
            receivedMessage
        }
    }
}


module.exports = Command