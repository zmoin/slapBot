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

    static get allowedRoles() {
        return ['admin']
    }

    /**
     * Switch between what command to run based in the first param after !
     *
     * @param {*} receivedMessage
     */
    handle(receivedMessage) {
        let promises = []

        receivedMessage.guild.members.every((member) => {
            promises.push((async () => {
                if (member.user.bot) {
                    return false
                }

                const user = await User.getUser(member.user.id)
                if (!_.isEmpty(user)) {
                    return false
                }

                await User.addUser(user.id)
                return true
            })())
        })

        Promise.all(promises).then(values => {
                const count = values.filter(v => v).length
                if (count > 0) {
                    receivedMessage.channel.send(`Loaded ` + count + ` users into the db`)
                } else {
                    receivedMessage.channel.send('No new users to load into the db')
                }
            })
            .catch(err => {
                logger.error(err.message)
            })
    }
}

module.exports = LoadChannel