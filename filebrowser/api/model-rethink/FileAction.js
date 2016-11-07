module.exports = {
    attributes: {
        session: {
            model: 'session'
        },
        role: {
            model: 'role'
        },
        path: {
            type: "string"
        },
        actions: {
            enum:['copy', 'cut']
        }
    }
};