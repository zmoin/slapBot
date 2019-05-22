const User = require('../../helpers/user')
const Command = require('../command')
let logger = require('winston')
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
        let promises = [];

        receivedMessage.guild.every(() => {
            promises.push(async () => {
                const user = await User.getUser(user.id)
                if (!_.isEmpty(user)) {
                    return false
                }

                await User.addUser(user.id);
                return true
            })
        })

        Promise.all(promises).then(values => {
                const count = values.filter(v => v).length
                receivedMessage.channel.send(`Loaded ` + count + ` users into the db`)
            })
            .catch(err => {
                logger.error(err)
            })
    }
}

module.exports = LoadChannel