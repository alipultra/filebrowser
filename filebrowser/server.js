/**
 * Created by TES on 4/8/2016.
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var express = require('express')
var app = require('express')()
var websocket = require('socket.io');
var https = require('https');
var fs = require('fs');

var ip = require('ip');
rethinkdb = require('rethinkdb');
var config = require('./config')
var compression = require('compression');
var ping = require('ping');
var randomString = require('randomstring');
remote_service = null;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(compression());

app.use('/', express.static('client'));

var httpsOptions = {
  key : fs.readFileSync('./keys/private-localhost.key'),
  cert: fs.readFileSync('./keys/cert-localhost.crt'),
  ca:   fs.readFileSync('./keys/tesynergy-root-ca.crt'),
  requestCert: false,
  rejectUnauthorized : false
};

var httpServer = https.createServer(httpsOptions,app);

var websocketServer = websocket(httpServer);

httpServer.listen(config.port, function () {
  console.log('listening on *:' + config.port);
  var service = require('./serviceauth');
  var api = require('./fileBrowserAPI');

  var methods = {
    getOrigin : function (authServerUrl, remoteSocket, reqMsg, resCallback) {
      var dns = require('dns');
      dns.lookupService(ip.address(),config.port, function (err, hostname, service) {
        // resCallback(false, hostname+ ':' + config.port)
        resCallback(false, 'localhost:' + config.port)
      });
    },
    generateDocKey:function  (authServerUrl, remoteSocket, reqMsg, resCallback) {
        var key = randomString.generate(12);
        var vKey = randomString.generate(24);
        var docKey = {
           key : key,
           vkey: vKey
        };
        resCallback(false, docKey);
    },
    generateSheetKey:function  (authServerUrl, remoteSocket, reqMsg, resCallback) {
      var key = randomString.generate(12);
      var vKey = randomString.generate(24);
      var docKey = {
        key : key,
        vkey: vKey
      };
      resCallback(false, docKey);
    },
    generatePresentationKey:function  (authServerUrl, remoteSocket, reqMsg, resCallback) {
      var key = randomString.generate(12);
      var vKey = randomString.generate(24);
      var docKey = {
        key : key,
        vkey: vKey
      };
      resCallback(false, docKey);
    },
    getDocServerUrl : function(authServerUrl, remoteSocket, reqMsg, resCallback){
      resCallback(false, config.docServerUrl);
    },
  }

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
                  url: '/scripts/module/document/module_browser.js'
                }
              ],
              function (isCallMethodSuccess, reply) {
                if (isCallMethodSuccess) {
                  console.log("webserver.attachscript() call success");
                }
              }
            );
          });

          remoteService.registerApi(methods, function (isRegisterSuccess, registeredMethods) {
            if (isRegisterSuccess) {
              registeredMethods.forEach(function (methodName) {
                console.log("registered local method : " + methodName);
              });

              api.init();
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
