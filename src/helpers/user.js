const _ = require('lodash')
const {
    User
} = require('../models/user')

let UserHelper = {}

UserHelper.roles = [
    'admin',
    'nuker',
    'user',
    'guest',
    'banned'
]

UserHelper.hasRole = async (role, id) => {
    if (_.has(id, 'id')) {
        id = id.id
    }

    const user = await User.query().findById(id)

    if (_.isEmpty(user)) {
        return false
    }

    return user.role == role
}

UserHelper.setRole = async (role, id) => {
    const user = await User.query().findById(id)

    if (_.isEmpty(user)) {
        await UserHelper.addUser(id)
    }
    return User
        .query()
        .update({
            role
        })
        .where('id', id)
}

UserHelper.addUser = async (id, options) => User
    .query()
    .insertAndFetch(_.defaults({
        id,
        ...options
    }, {
        role: 'user'
    }))

UserHelper.getUsers = async () => User.query()

UserHelper.getUser = async (id) => User.query().findById(id)

UserHelper.removeUser = async (id) => User.query().deleteById(id)

UserHelper.isValidMention = (stringToCheck, guild) => {
    //if the userID DOES NOT starts with <@ and may have either of !&, has a number of
    //number of numeric digits and ends with >, then return false
    if (!/^<@[!&]?\d+>$/.test(stringToCheck))
        return false
    //else test the userID
    let userId = stringToCheck.substr(2, stringToCheck.length - 3)
    if (guild.members.keyArray().includes(userId)) {
        return true
    }
}

UserHelper.getIdFromMention = (mention) => mention.replace(/[<@!>]/g, '')

UserHelper.isValidRole = role => UserHelper.roles.includes(role)

module.exports = UserHelper