module.exports = {
    development: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        migrations: {
            directory: './db/migrations'
        },
        useNullAsDefault: true
    },

    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        migrations: {
            directory: './db/migrations'
        },
        useNullAsDefault: true
    }
}