module.exports = {
    waterline :{
        adapters: {
            'mongo': require('sails-mongo')
        },

        connections: {
            local: {
                adapter: 'mongo',
                host: 'mongomain.db.soyut',
                port: 27017,

                database: 'SOYUT'
            }
        },

        defaults: {
            migrate: 'alter'
        }
    }
};
