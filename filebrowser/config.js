/**
 * Created by TES on 4/11/2016.
 */
module.exports = {
    port : 50710,
    terminalCheckInterval : 10,//in second
    authServerUrl : 'https://localhost:3000',
    docServerUrl : 'https://10.241.36.64',
    rethink:{
        host:'172.16.1.2',
        port:28015,
        database:'SOYUT'
    },
    waterline :{
        adapters: {
            'mongo': require('sails-mongo')
        },

        connections: {
            local: {
                adapter: 'mongo',
                host: '172.16.1.2',
                port: 27017,

                database: 'SOYUT'
            }
        },

        defaults: {
            migrate: 'alter'
        }
    }
}
