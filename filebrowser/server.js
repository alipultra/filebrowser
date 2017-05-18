/**
 * Created by TES on 4/8/2016.
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var express = require('express');
var app = require('express')();
var websocket = require('socket.io');
var https = require('https');
var fs = require('fs');
var download = require('download-file');
var ip = require('ip');
rethinkdb = require('rethinkdb');
var compression = require('compression');
var ping = require('ping');
var randomString = require('randomstring');
var syncRequest = require("sync-request");
var path = require('path');

mongoDb = {}
remote_service = null

var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
//require('./waterlineHook')(mongoDb, config.waterline);
r = require('./rethinkHook')(config.rethink, websocket);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(compression());

app.use('/', express.static('client'));

var httpsOptions = {
    key : fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert),
    ca: fs.readFileSync(config.ssl.ca),
    requestCert: false,
    rejectUnauthorized : false
};

var httpServer = https.createServer(httpsOptions,app);

var websocketServer = websocket(httpServer);

app.post('/track', function (req, res){
    var userAddress = req.query.useraddress;
    var fileName = req.query.filename;
    var storageKey = req.query.storagekey;

    var version = 0;

    var pathForSave = "./client/data/temp-" + storageKey + "/" + fileName;
    var updateFile = function (response, body, path) {
        if (body.status == 2)
        {
            var file = syncRequest("GET", body.url);
            fs.writeFileSync(path, file.getBody());
            console.log("load file");
            //emit change
            var Obj = {
                useraddress: userAddress,
                filename: fileName,
                storagekey: storageKey
            };
            websocketServer.emit('edit_document', Obj);
        }
        else if(body.status == 4){
            var Obj = {
                useraddress: userAddress,
                filename: fileName,
                storagekey: storageKey
            };
            websocketServer.emit('view_document', Obj);
        }

        response.write("{\"error\":0}");
        response.end();
    }

    var readbody = function (request, response, path) {
        var content = "";
        request.on("data", function (data) {
            content += data;
        });
        request.on("end", function () {
            var body = JSON.parse(content);
            console.log(body)
            updateFile(response, body, path);
        });
    }

    readbody(req, res, pathForSave);
});

httpServer.listen(config.port, function () {
    console.log('listening on *:' + config.port);
    var service = require('./serviceauth');
    var api = require('./controllerHook')(mongoDb,httpServer,websocketServer,service,config);
    var methods = api.public;
    var restrictedMethods = api.restricted;
    methods.getOrigin = function (authServerUrl, remoteSocket, reqMsg, resCallback) {
        resCallback(false, config.hostname + ':' + config.port);
    };
    methods.generateDocKey = function  (authServerUrl, remoteSocket, reqMsg, resCallback) {
        var key = "doc" + randomString.generate(12);
        var vKey = "doc" + randomString.generate(24);
        var docKey = {
            key : key,
            vkey: vKey
        };
        resCallback(false, docKey);
    };
    methods.generateSheetKey = function  (authServerUrl, remoteSocket, reqMsg, resCallback) {
        var key = "xls" + randomString.generate(12);
        var vKey = "xls" + randomString.generate(24);
        var docKey = {
            key : key,
            vkey: vKey
        };
        resCallback(false, docKey);
    };
    methods.generatePresentationKey = function  (authServerUrl, remoteSocket, reqMsg, resCallback) {
        var key = "ppt" + randomString.generate(12);
        var vKey = "ppt" + randomString.generate(24);
        var docKey = {
            key : key,
            vkey: vKey
        };
        resCallback(false, docKey);
    };
    methods.generateDocxKey = function  (authServerUrl, remoteSocket, reqMsg, resCallback) {
        var key = "docx" + randomString.generate(12);
        var vKey = "docx" + randomString.generate(24);
        var docKey = {
           key : key,
           vkey: vKey
        };
        resCallback(false, docKey);
    };
    methods.generateSheetxKey = function  (authServerUrl, remoteSocket, reqMsg, resCallback) {
        var key = "xlsx" + randomString.generate(12);
        var vKey = "xlsx" + randomString.generate(24);
        var docKey = {
          key : key,
          vkey: vKey
        };
        resCallback(false, docKey);
    };
    methods.generatePresentationxKey = function  (authServerUrl, remoteSocket, reqMsg, resCallback) {
      var key = "pptx" + randomString.generate(12);
      var vKey = "pptx" + randomString.generate(24);
      var docKey = {
        key : key,
        vkey: vKey
      };
      resCallback(false, docKey);
    };
    methods.getDocServerUrl = function(authServerUrl, remoteSocket, reqMsg, resCallback){
      resCallback(false, config.docServerUrl);
    };

    methods.getLocalIP = function(authServerUrl, remoteSocket, reqMsg, resCallback){
        var ip_address = ip.address();
        resCallback(false, ip_address);
    };

    methods.downloadFile = function(authServerUrl, remoteSocket, reqMsg, resCallback){
        var fileUrl = reqMsg.data.params.url;
        var fileName = reqMsg.data.params.name;
        var storageKey = reqMsg.data.params.storageKey;
        var destFile = "./client/data/temp-"+storageKey+"/";

        var options = {
            directory: destFile,
            filename: fileName
        };

        download(fileUrl, options, function(err){
            if (err) throw err;
            var result = "success";
            resCallback(result)
        });
    };

    methods.deleteFile = function(authServerUrl, remoteSocket, reqMsg, resCallback){
        var file = reqMsg.data.params.file;
        var storageKey = reqMsg.data.params.storageKey;
        var destFile = "./client/data/temp-"+storageKey+"/";
        var deletePath = destFile + file;
        fs.unlinkSync(deletePath);
        var result = "success";
        resCallback(result);
    };

    service.identify("browserServer", null, config.authServerUrl, function (isIdentifySuccess, identifyResp) {
        if (isIdentifySuccess === true) {
            console.log("authserver identifed, publicKey :");
            console.log(identifyResp);
            //todo: we should compare authserver publickey with the one we hold (trusted)

            service.initiateSession(config.authServerUrl, function (isInitiateSuccess, remoteService) {
                if (isInitiateSuccess === true) {
                    console.log("service initiation success");

                    //remote service will be available global
                    remote_service = remoteService

                    remoteService.subscribeOnApiAdded('webserver', 'attachscript', function () {
                        remoteService.api.webserver.attachscript([
                                {
                                    src: 'https://'+ config.hostname + ':' + config.port + '/module_browser.js',
                                    url: '/scripts/module/radiogram/module_browser.js'
                                }
                            ],
                            function (isCallMethodSuccess, reply) {
                                if (isCallMethodSuccess) {
                                    console.log("webserver.attachscript() call success");
                                }
                            }
                        );
                    });

                    remoteService.subscribeOnApiAdded('groupPolicyServer','policy_register', function () {
                        remoteService.api.groupPolicyServer.policy_register(api.tokenList, function (data) {
                            console.log('access token registered')
                        })
                    });

                    remoteService.registerRestrictedApi(restrictedMethods, function (isRegisterSuccess, registeredMethods) {
                        if (isRegisterSuccess) {
                            registeredMethods.forEach(function (methodName) {
                                console.log("registered restricted local method : " + methodName);
                            });

                            //api.init(httpRouter, webSocketServer, service, authServerUrl);
                        }
                        else {
                            console.log("restricted api registration failed");
                            console.log(registeredMethods);
                        }
                    });

                    remoteService.registerApi(methods, function (isRegisterSuccess, registeredMethods) {
                        if (isRegisterSuccess) {
                            registeredMethods.forEach(function (methodName) {
                                console.log("registered local method : " + methodName);
                            });

                            //api.init(app, io, service, config);
                        }
                        else {
                            console.log("api registration failed");
                            //console.log(registeredMethods);
                        }
                    });
                }
                else {
                    console.log("service initiation failed");
                    //console.log(remoteService);
                }
            });
        }
        else {
            console.log("authserver identify failed");
            console.log(identifyResp);
        }
    });
});
