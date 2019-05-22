exports.up = knex => {
    return knex.schema.createTable('users', table => {
        table.string('id').primary()
        table.string('role')
    })
}

exports.down = knex => {
    return knex.schema.dropTableIfExists('users')
}