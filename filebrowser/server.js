/**
 * Created by TES on 4/8/2016.
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var express = require('express');
var app = require('express')();
var websocket = require('socket.io');
var https = require('https');
var fs = require('fs');

var ip = require('ip');
rethinkdb = require('rethinkdb');
var config = require('./config');
var compression = require('compression');
var ping = require('ping');
var randomString = require('randomstring')
mongoDb = {}
remote_service = null
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
    key : fs.readFileSync(config.sslKey),
    cert: fs.readFileSync(config.sslCert),
    ca: fs.readFileSync(config.sslCA),
    requestCert: false,
    rejectUnauthorized : false
};

var httpServer = https.createServer(httpsOptions,app);

var websocketServer = websocket(httpServer);

httpServer.listen(config.port, function () {
    console.log('listening on *:' + config.port);
    var service = require('./serviceauth');
    var api = require('./controllerHook')(mongoDb,httpServer,websocketServer,service,config);
    var methods = api.public;
    var restrictedMethods = api.restricted;
    methods.getOrigin = function (authServerUrl, remoteSocket, reqMsg, resCallback) {
        //creating clock service and just return it service uuid
        var dns = require('dns');
        dns.lookupService(ip.address(),config.port, function (err, hostname, service) {
            // resCallback(false, hostname+ ':' + config.port)
            resCallback(false, 'localhost:' + config.port)
        });
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
                                    src: 'https://localhost:' + config.port + '/module_browser.js',
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
