const _ = require('lodash')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db/users.json', {
    defaultValue: []
})

let User = {}

const db = User.db = low(adapter)

User.roles = [
    'admin',
    'nuker',
    'user',
    'guest',
    'banned'
]

User.hasRole = (role, id) => {
    if (_.has(id, 'id')) {
        id = id.id
    }

    let user = db.find({
            id
        })
        .value()

    if (_.isEmpty(user)) {
        return false;
    }

    return user.role == role
}

User.setRole = (role, id) => {
    const user = db.find({
        id
    }).value();

    if (_.isEmpty(user)) {
        User.addUser(id)
    }

    db.find({
            id
        })
        .assign({
            role
        })
        .write()
}

User.addUser = (id, options) => {
    db.push(_.defaults({
        id,
        ...options
    }, {
        role: 'user'
    })).write()
}

User.getUsers = () => {
    return db.value();
}

User.getUser = (id) => {
    return db.find({
        id
    }).value();
}

User.removeUser = (id) => db.remove({
    id
}).write()

User.isValidMention = (stringToCheck, guild) => {
    if (!/^<@[!&]?\d+>$/.test(stringToCheck))
        return false
    let userId = stringToCheck.substr(2, stringToCheck.length - 3);
    if (guild.members.keyArray().includes(userId)) {
        return true
    }
}

User.getIdFromMention = (mention) => mention.replace(/[<@!>]/g, '')

User.isValidRole = role => User.roles.includes(role)

module.exports = User