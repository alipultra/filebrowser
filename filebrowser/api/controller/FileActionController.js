var _ = require('underscore');
var randomString = require('randomstring')
const BROWSER_MANAGER_TOKEN = "sdfhjkoiiousdfsdpoopuiiiuuhdsfsd98798sdfsdiu877";

module.exports = {
    public: {
        GetById: function (authServerUrl, remoteSocket, reqMsg, resCallback) {
            r.table('FileAction').get(reqMsg.data.params.id, function (err, result) {
                if (err) throw err;
                resCallback(false, result);
            })
        },
        getAll: function (authServerUrl, remoteSocket, reqMsg, resCallback) {
            r.table('FileAction').find({}).exec(function (err, result) {
                if (err) {
                    return res.json({success: false, error: "record not found"});
                    throw err;
                }
                else {
                    result.toArray(function (err, radiogram) {
                        if (err) {
                            return res.json({success: false, error: "record not found"});
                            throw err;
                        }
                        else {
                            resCallback(false, radiogram);
                        }
                    });
                }
            });
        },
        updateCopy: function (authServerUrl, remoteSocket, reqMsg, resCallback) {
            var id = reqMsg.data.params.id;
            var path = reqMsg.data.params.path;
            
            r.table('FileAction').update({id: id}, {path: path}, function (err, result) {
                if (err) resCallback(true, err);
                else {
                    if (result.replaced > 0)
                        resCallback(false, {success: true});
                    else
                        resCallback(true, {success: false});
                }
            });
        },
        searchCopy: function (authServerUrl, remoteSocket, reqMsg, resCallback) {
            var session = reqMsg.data.params.session;
            var role = reqMsg.data.params.role;
            r.table('FileAction').find({session: session, role: role}).exec(function (err, result) {
                if (err) {
                    return res.json({success: false, error: "record not found"});
                    throw err;
                }
                else {
                    result.toArray(function (err, data) {
                        if (err) {
                            return res.json({success: false, error: "record not found"});
                            throw err;
                        }
                        else {
                            resCallback(false, data);
                        }
                    });
                }
            })
        },
        copy: function (authServerUrl, remoteSocket, reqMsg, resCallback) {
            var session = reqMsg.data.params.session;
            var role = reqMsg.data.params.role;
            var path = reqMsg.data.params.path;
            var actions = reqMsg.data.params.actions;
            r.table('FileAction').insert({
                    session: session,
                    role: role,
                    path: path,
                    actions: actions
                }, function (err, result) {
                if (err) throw err;
                else {
                    resCallback(false, result);
                }
            });
        }
    },
    restricted: {

    },
    tokenList: [
        {
            name: 'browser-admin',
            description: 'Browser Administrator',
            token: BROWSER_MANAGER_TOKEN
        }
    ]
};