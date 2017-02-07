module.exports = {
    waterline :{
        adapters: {
            'mongo': require('sails-mongo')
        },

        connections: {
            local: {
                adapter: 'mongo',
                host: 'db.soyut',
                port: 27017,

                database: 'SOYUT'
            }
        },

        defaults: {
            migrate: 'alter'
        }
    }
};
