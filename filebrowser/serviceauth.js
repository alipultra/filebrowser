"use strict";
/* global __dirname, require */

var request = require('request');
var NodeRSA = require('node-rsa');
var crypto  = require('crypto');
var websocketClient = require('socket.io-client');
var fs = require('fs');
var async = require('async');

module.exports = {
    authServer : {},
    api : { local: {} },
    clientkey : {},
    websocketServers : [],
    events :{
        onClientDisconnectEvents : [],
        onUpdateRemoteServices : []
    },
    key : null,

    genServiceUid : function(serviceName){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return serviceName+"-"+uuid;
    },

    genrsakey : function(serviceName, uuid){
        var key = null;

        try{
            key = new NodeRSA({b: 512});
            key.importKey(fs.readFileSync(__dirname+'/keys/'+serviceName+'-private.key', 'utf8'),'pkcs1');
        }
        catch(e){
            console.log(__dirname+'/keys/'+serviceName+'-private.key not found, regenerating...');
            var keyDir = __dirname+'/keys/';
            if (!fs.existsSync(keyDir)){
                fs.mkdirSync(keyDir);
            }

            key = new NodeRSA({b:512});
            fs.writeFileSync(keyDir+serviceName+'-private.key',key.exportKey('pkcs1-private-pem'),'utf8');
            fs.writeFileSync(keyDir+serviceName+'-public.key' ,key.exportKey('pkcs1-public-pem') ,'utf8');
        }

        if(uuid === undefined || uuid === null){
            uuid = this.genServiceUid(serviceName);
        }

        key.serviceName = serviceName;
        key.serviceUid  = uuid;
        this.key = key;
        return key;
    },

    registerClientKey : function(serviceName, serviceUid, publicKey){
        var self = this;
        var authKey = new NodeRSA({b:512});
        var importSuccess = true;
        try{
            authKey.importKey(publicKey,'pkcs1-public-pem');
        }
        catch(e){
            importSuccess = false;
        }

        if(importSuccess){
            if(!self.clientkey.hasOwnProperty(serviceName)){
                self.clientkey[serviceName] = {};
            }
            if(!self.clientkey[serviceName].hasOwnProperty(serviceUid)){
                self.clientkey[serviceName][serviceUid] = {};
            }
            self.clientkey[serviceName][serviceUid].publicKey = publicKey;
            self.clientkey[serviceName][serviceUid].key = authKey;
            return true;
        }
        return false;
    },

    createResponse : function(authUrl, isError, request, replyData){
        var signKey = this.key;
        if(signKey === null){
            return null;
        }
        var responseData = {};

        if(request.hasOwnProperty('data')){
            if(request.data.hasOwnProperty('service')){
                responseData.service = request.data.service;
            }
            if(request.data.hasOwnProperty('method')){
                responseData.method = request.data.method;
            }
            if(request.data.hasOwnProperty('reqid')){
                responseData.reqid = request.data.reqid;
            }
            if(request.data.hasOwnProperty('nonce')){
                responseData.nonce = request.data.nonce;
            }
        }

        var sessionSecret = null;

        if(authUrl !== undefined && authUrl !== null &&
            this.authServer.hasOwnProperty(authUrl) &&
            this.authServer[authUrl].hasOwnProperty('sessionSecret')){
            sessionSecret = this.authServer[authUrl].sessionSecret;
        }
        else if(this.clientkey.hasOwnProperty(request.auth.senderService) &&
            this.clientkey[request.auth.senderService].hasOwnProperty(request.auth.senderId) &&
            this.clientkey[request.auth.senderService][request.auth.senderId].hasOwnProperty('sessionSecret')){
            sessionSecret = this.clientkey[request.auth.senderService][request.auth.senderId].sessionSecret;
        }

        if(isError){
            responseData.reason = replyData;
            responseData.sentMsg = request;
        }
        else{
            responseData.reply = replyData;
        }

        var response = {
            error : isError,
            data  : responseData,
            auth  : { }
        };

        if(signKey !== null && request.auth.signmethod === "pkcs-signverify"){
            var dataString = signKey.serviceUid + JSON.stringify(responseData);
            if(sessionSecret !== null){
                dataString += sessionSecret;
            }
            response.auth.senderId = signKey.serviceUid;
            response.auth.senderService = signKey.serviceName;
            response.auth.signmethod = "pkcs-signverify";
            response.auth.signature = signKey.sign(dataString,'base64','utf8');
        }
        else{
            var responseDataStr = "";
            if(signKey !== null){
                responseDataStr += signKey.serviceUid;
                response.auth.senderId = signKey.serviceUid;
                response.auth.senderService = signKey.serviceName;
            }
            responseDataStr += JSON.stringify(responseData);
            if(sessionSecret !== null){
                responseDataStr += sessionSecret;
            }

            response.auth.signmethod = "sha256-hash";
            response.auth.signature = crypto.createHash('sha256').update(responseDataStr).digest('base64');
        }

        return response;
    },

    createEncryptedResponse : function(authUrl, isError, request, replyData){
        var response = this.createResponse(authUrl, isError, request, replyData);
        if(response !== null){
            var serverKey = null;
            if(authUrl !== undefined &&
                this.authServer.hasOwnProperty(authUrl) &&
                this.authServer[authUrl].hasOwnProperty('key')){
                serverKey = this.authServer[authUrl].key;
            }
            else if(this.clientkey.hasOwnProperty(request.auth.senderService) &&
                this.clientkey[request.auth.senderService].hasOwnProperty(request.auth.senderId) &&
                this.clientkey[request.auth.senderService][request.auth.senderId].hasOwnProperty('key')){
                serverKey = this.clientkey[request.auth.senderService][request.auth.senderId].key;
            }

            if(serverKey !== null){
                response.data = serverKey.encrypt(JSON.stringify(response.data),'base64');
                response.auth.dataencryption = "pkcs";
                return response;
            }
        }
        return null;
    },

    createForwardRequest : function(serviceName, serviceUid, methodName, params, reqid, signMethod){
        var self = this;
        var signKey = self.key;
        if(signKey === null){
            return null;
        }

        var request = {
            data : {
                service : serviceName,
                method  : methodName,
                params  : params,
                nonce   : 0
            },
            auth : {
                senderId : signKey.serviceUid,
                senderService : signKey.serviceName
            }
        };

        var sessionSecret = null;
        if(self.clientkey.hasOwnProperty(serviceName) &&
            self.clientkey[serviceName].hasOwnProperty(serviceUid)){

            if(self.clientkey[serviceName][serviceUid].hasOwnProperty('sessionSecret')){
                sessionSecret = self.clientkey[serviceName][serviceUid].sessionSecret;
            }

            if(self.clientkey[serviceName][serviceUid].hasOwnProperty('nonce')){
                request.data.nonce = self.clientkey[serviceName][serviceUid].nonce + 1;
                self.clientkey[serviceName][serviceUid].nonce = request.data.nonce;
                console.log("nonce "+serviceUid+" = "+ self.clientkey[serviceName][serviceUid].nonce+" ("+methodName+")" );
            }
        }

        if(reqid !== undefined && reqid !== null){
            request.data.reqid = crypto.randomBytes(8).toString('base64');
        }

        if(signMethod === undefined || signMethod === null){
            signMethod = "pkcs-signverify";
        }

        if(signKey !== null && signMethod === "pkcs-signverify"){
            request.auth.signmethod = "pkcs-signverify";
            var dataString = signKey.serviceUid + JSON.stringify(request.data);
            if(sessionSecret !== null){
                dataString += sessionSecret;
            }
            request.auth.signature = signKey.sign(dataString,'base64','utf8');
        }
        else{
            var requestDataStr = request.auth.senderId;
            request.auth.signmethod = "sha256-hash";
            requestDataStr += JSON.stringify(request.data);
            if(sessionSecret !== null){
                requestDataStr += sessionSecret;
            }
            request.auth.signature = crypto.createHash('sha256').update(requestDataStr).digest('base64');
        }

        return request;
    },

    createRequest : function(authUrl, service, method, params, reqid, signMethod){
        var self = this;
        var signKey = self.key;
        if(signKey === null){
            return null;
        }

        var request = {
            data : {
                service : service,
                method  : method,
                params  : params,
                nonce   : 0
            },
            auth : {

            }
        };

        var sessionSecret = null;
        if(authUrl !== undefined && authUrl !== null){
            if(this.authServer.hasOwnProperty(authUrl)){
                if(this.authServer[authUrl].hasOwnProperty('sessionSecret')){
                    sessionSecret = this.authServer[authUrl].sessionSecret;
                }
                if(this.authServer[authUrl].hasOwnProperty('nonce')){
                    this.authServer[authUrl].nonce = this.authServer[authUrl].nonce+1;
                    request.data.nonce = this.authServer[authUrl].nonce;
                    console.log("nonce "+authUrl+" = "+ this.authServer[authUrl].nonce+" ("+method+")");
                }
            }
        }

        if(reqid !== undefined && reqid !== null){
            request.data.reqid = crypto.randomBytes(8).toString('base64');
        }

        if(signMethod === undefined || signMethod === null){
            signMethod = "pkcs-signverify";
        }

        if(signKey !== null && signMethod === "pkcs-signverify"){
            request.auth.senderId = signKey.serviceUid;
            request.auth.senderService = signKey.serviceName;
            request.auth.signmethod = "pkcs-signverify";
            var dataString = signKey.serviceUid + JSON.stringify(request.data);
            if(sessionSecret !== null){
                dataString += sessionSecret;
            }
            request.auth.signature = signKey.sign(dataString,'base64','utf8');
        }
        else{
            var requestDataStr = "";
            if(signKey !== null){
                request.auth.senderId      = signKey.serviceUid;
                request.auth.senderService = signKey.serviceName;
                requestDataStr += signKey.serviceUid;
            }
            request.auth.signmethod = "sha256-hash";
            requestDataStr += JSON.stringify(request.data);
            if(sessionSecret !== null){
                requestDataStr += sessionSecret;
            }
            request.auth.signature = crypto.createHash('sha256').update(requestDataStr).digest('base64');
        }

        return request;
    },

    createEncryptedRequest : function(authUrl, service, method, params, reqid){
        var request = this.createRequest(authUrl, service, method, params, reqid);
        if(request !== null){
            var serverKey = null;
            if(authUrl !== undefined &&
                this.authServer.hasOwnProperty(authUrl) &&
                this.authServer[authUrl].hasOwnProperty('key')){
                serverKey = this.authServer[authUrl].key;
            }

            if(serverKey !== null){
                request.data = serverKey.encrypt(JSON.stringify(request.data),'base64');
                request.auth.dataencryption = "pkcs";
                return request;
            }
        }
        return null;
    },

    decryptMsg : function(msg){
        var signKey = this.key;
        if(signKey === null){
            return null;
        }

        if(msg.hasOwnProperty('data') && msg.hasOwnProperty('auth')){
            var decrypted = null;
            try{
                decrypted = signKey.decrypt(msg.data,'json');
            }
            catch(e){
                return null;
            }

            var msgClone = JSON.parse(JSON.stringify(msg));
            msgClone.data = decrypted;

            if(msgClone.auth.hasOwnProperty('dataencryption')){
                delete msgClone.auth.dataencryption;
            }
            return msgClone;
        }

        return null;
    },

    getConnector : function(authServerUrl){
        var self = this;
        var websocket = null;
        if( !this.authServer.hasOwnProperty(authServerUrl))
        {
            this.authServer[authServerUrl] = {};
        }
        if( this.authServer[authServerUrl].hasOwnProperty('websocket')){
            websocket = self.authServer[authServerUrl].websocket;
        }
        else{
            websocket = websocketClient.connect(authServerUrl, { reconnect: true, secure:true});
            websocket.on("connect_error", function(error){
                console.log("websocket connect error "+error.description+" ("+error.type+") to "+authServerUrl);
                console.log(error.message);
            });

            this.authServer[authServerUrl].websocket = websocket;
            websocket.on('api', function(reqMsg, resCallback){
                self.authServer[authServerUrl].websocketHandler(websocket,reqMsg, resCallback);
            });
            websocket.on('updateRemoteServices', function(reqMsg){
                var validRequest = self.validateServerRequest(reqMsg, authServerUrl);
                if(validRequest !== null) {
                    self.updateRemoteService(authServerUrl, validRequest.data.params);
                    self.events.onUpdateRemoteServices.forEach(function(handle){
                      handle(validRequest.data.params)
                    })
                }
            });
            websocket.on('disconnect', function(){
                console.log('client socket disconnected from server');
                //todo:handle this
            });
        }
        return websocket;
    },

    websocketEventHandler : function(authServerUrl, requestMsg, remoteSocket, responseCallback){
        var self = this;
        var isEncrypted = null;
        if(requestMsg.auth.hasOwnProperty('dataencryption')){
            isEncrypted = requestMsg.auth.dataencryption;
        }
        var validRequest = self.validateRequest(requestMsg, authServerUrl);
        if(validRequest !== null){
            try{
                var methodName = validRequest.data.method;
                self.api.local[methodName](authServerUrl, remoteSocket, validRequest, function(isError, reply){
                    var response = null;
                    if(isEncrypted === undefined || isEncrypted === null){
                        response = self.createResponse(authServerUrl, isError, requestMsg, reply);
                    }
                    else{
                        response = self.createEncryptedResponse(authServerUrl, isError, requestMsg, reply);
                    }
                    responseCallback(response);
                });
            }
            catch(e){
                var errorResponse2 = self.createResponse(authServerUrl, true, validRequest, 'user callback exception');
                console.log("user callback exception on websocket handler :");
                console.log(e);
                console.log("request :");
                console.log(requestMsg);
                responseCallback(errorResponse2);
            }
        }
        else{
            var errorResponse = self.createResponse(authServerUrl, true, requestMsg, 'invalid request signature');
            responseCallback(errorResponse);
        }
    },

    getClientServices : function(){
        var self = this;
        var serviceInfo = {};
        for(var serviceName in self.clientkey){
            serviceInfo[serviceName] = {};
            for(var serviceUid in self.clientkey[serviceName]){
                serviceInfo[serviceName][serviceUid] = [];
                if(self.clientkey[serviceName][serviceUid].hasOwnProperty('methods')){
                    for(var methodName in self.clientkey[serviceName][serviceUid].methods){
                        serviceInfo[serviceName][serviceUid].push(methodName);
                    }
                }
            }
        }
        return serviceInfo;
    },

    registerLocalMethod : function(methodName, method, websocketServer){
        var self = this;
        self.api.local[methodName] = method;
        if(self.websocketServers.indexOf(websocketServer) === -1){
            self.websocketServers.push(websocketServer);
            websocketServer.on('connection', function(remoteSocket){

                remoteSocket.join('auth');
                remoteSocket.on('api', function(reqMsg, resCallback){
                    self.websocketEventHandler(null, reqMsg, remoteSocket, resCallback);
                });
                remoteSocket.on('disconnect',function(){
                    if(remoteSocket.hasOwnProperty('clientServiceUid')){
                        console.log(remoteSocket.clientServiceUid+" disconnected");
                        delete self.clientkey[remoteSocket.clientService][remoteSocket.clientServiceUid];
                        if(Object.keys(self.clientkey[remoteSocket.clientService]).length === 0){
                            delete self.clientkey[remoteSocket.clientService];
                        }
                        async.forEachSeries(self.events.onClientDisconnectEvents, function(handler,done){
                            handler(remoteSocket,done);
                        },function(err){});
                    }
                    else{
                        console.log("client disconnected");
                    }
                });
            });
        }
        return true;
    },

    registerRemoteMethodForwarder : function(service, serviceUid, methodName){
        var self = this;
        if( self.clientkey.hasOwnProperty(service) &&
            self.clientkey[service].hasOwnProperty(serviceUid)){
            var client = self.clientkey[service][serviceUid];
            if(!client.hasOwnProperty('methods')){
                client.methods = {};
            }
            client.methods[methodName] = function(params, replyCallback){
                if(client.hasOwnProperty('socket')){
                    var socket = client.socket;
                    var request = self.createForwardRequest(service, serviceUid, methodName, params);
                    if(socket.connected){
                        socket.emit('api', request, function(response){
                            var validResponse = self.validateResponse(response,null);
                            if( validResponse !== null){
                                replyCallback(true, validResponse);
                            }
                            else{
                                replyCallback(false,'response signature invalid');
                            }
                        });
                    }
                    else{
                        replyCallback(false,'socket disconnected');
                    }
                }
            };
            console.log("registered remote method "+methodName+" for "+serviceUid);
            return client.methods[methodName];
        }
        return null;
    },

    updateRemoteService : function(authServerUrl, serviceObj){
        var self = this;
        var apiChanges = {
            existingApi : [],
            removedApi : [],
            addedApi : []
        };
        function bindCallMethod(server, service, method, newApi){
            newApi[service][method] = function(param,callback){
                self.callMethod(server, service, method, param, callback);
            };
            if(apiChanges.existingApi.indexOf(service+"."+method) === -1){
                apiChanges.addedApi.push(service+"."+method);
            }
        }

        if(self.authServer.hasOwnProperty(authServerUrl)){
            if(!self.authServer[authServerUrl].hasOwnProperty('services')){
                self.authServer[authServerUrl].services = {};
            }

            if(!self.authServer[authServerUrl].services.hasOwnProperty('api')){
                self.authServer[authServerUrl].services.api = {};
            }

            var existingServices = self.authServer[authServerUrl].services.api;
            for(var existingService in existingServices){
                for(var existingMethod in existingServices[existingService]){
                    apiChanges.existingApi.push(existingService+"."+existingMethod);
                }
            }

            var newApi = {};
            var newApiSig = [];
            for(var serviceName in serviceObj){
                for(var serviceUid in serviceObj[serviceName]){
                    if(serviceUid !== self.key.serviceUid){
                        serviceObj[serviceName][serviceUid].forEach(function(methodName){
                            if(!newApi.hasOwnProperty(serviceName)){
                                newApi[serviceName] = {};
                            }
                            if(!newApi[serviceName].hasOwnProperty(methodName)){
                                bindCallMethod(authServerUrl,serviceName,methodName, newApi);
                            }
                            if(newApiSig.indexOf(serviceName+"."+methodName) === -1){
                                newApiSig.push(serviceName+"."+methodName);
                            }
                        });
                    }
                }
            }

            self.authServer[authServerUrl].services.api = newApi;
            self.authServer[authServerUrl].services.registerApi = function(methods, callback){
                self.registerApi(authServerUrl, methods, callback);
            };
            self.authServer[authServerUrl].services.subscribeOnApiAdded = function(serviceName, methodName, handler){
                self.subscribeOnApiAdded(authServerUrl, serviceName, methodName, handler);
            };
            self.authServer[authServerUrl].services.subscribeOnApiRemoved = function(serviceName, methodName, handler){
                self.subscribeOnApiRemoved(authServerUrl, serviceName, methodName, handler);
            };

            apiChanges.existingApi.forEach(function(existingItem){
                var addedNdx = newApiSig.indexOf(existingItem);
                if(addedNdx === -1){
                    apiChanges.removedApi.push(existingItem);
                }
            });

            console.log("remote API changes : ");
            console.log(apiChanges);

            if(self.authServer[authServerUrl].hasOwnProperty('eventApiRemoved')){
                async.forEachSeries(apiChanges.removedApi, function(methodSig, done){
                    if(self.authServer[authServerUrl].eventApiRemoved.hasOwnProperty(methodSig)){
                        var removeEventHandlers = self.authServer[authServerUrl].eventApiRemoved[methodSig];
                        async.forEachSeries(removeEventHandlers, function(methodHandler, handlerDone){
                            try{
                                methodHandler(methodSig);
                                handlerDone();
                            }
                            catch(e){
                                handlerDone();
                            }
                        }, function(err2){
                            done();
                        });
                    }
                    else{
                        done();
                    }
                }, function(err){ });
            }

            if(self.authServer[authServerUrl].hasOwnProperty('eventApiAdded')){
                async.forEachSeries(apiChanges.addedApi, function(addedMethodSig, addedEventDone){
                    if(self.authServer[authServerUrl].eventApiAdded.hasOwnProperty(addedMethodSig)){
                        var addedEventHandlers = self.authServer[authServerUrl].eventApiAdded[addedMethodSig];
                        async.forEachSeries(addedEventHandlers, function(addedMethodHandler, addedHandlerDone){
                            try{
                                addedMethodHandler(addedMethodSig);
                                addedHandlerDone();
                            }
                            catch(e){
                                addedHandlerDone();
                            }
                        }, function(addedHandlersErr){
                            addedEventDone();
                        });
                    }
                    else{
                        addedEventDone();
                    }
                }, function(addedEventErr){ });
            }
        }
    },

    registerApi : function( authServerUrl, methods, done){
        var serverKey = this.key;
        if(serverKey === null && authServerUrl !== null){
            done(false,'no client key generated, please call identify first');
        }

        var self = this;
        if(authServerUrl !== null && self.authServer.hasOwnProperty(authServerUrl)){
            var websocket = self.getConnector(authServerUrl);
            var regMethods = [];
            for(var methodName in methods){
                if(typeof methods[methodName] === 'function'){
                    regMethods.push(methodName);
                }
            }

            var request = self.createRequest(authServerUrl, 'auth','register',regMethods);
            websocket.emit('api',request, function(response){
                var validResponse = self.validateResponse(response, authServerUrl);
                if(validResponse !== null){
                    if(validResponse.data.hasOwnProperty('reply')){
                        if(validResponse.data.reply.length > 0){
                            response.data.reply.forEach(function(methodName){
                                self.api.local[methodName] = methods[methodName];
                            });
                        }
                        done(true,response.data.reply);
                    }
                    else{
                        done(false,response.data.reason);
                    }
                }
                else{
                    done(false,'auth server response failed validation (registerApi)');
                }
            });
        }
        else{
            done(false,'auth server credential not available, should login first');
        }
    },

    validateResponse : function( resMsg, authServerUrl){
        var self = this;
        if( resMsg !== undefined && resMsg !== null &&
            resMsg.hasOwnProperty('data') &&
            resMsg.hasOwnProperty('auth'))
        {
            if(resMsg.auth.hasOwnProperty('dataencryption')){
                if(resMsg.auth.dataencryption === 'pkcs'){
                    var decryptedResponse = self.decryptMsg(resMsg);
                    if(decryptedResponse !== null){
                        return self.validateResponse(decryptedResponse, authServerUrl);
                    }
                }
            }
            else if( resMsg.auth.hasOwnProperty('signature')){
                var sessionSecret = null;
                var serviceUid = null;
                var authKey = null;
                if(authServerUrl !== undefined && authServerUrl !== null){
                    if(self.authServer.hasOwnProperty(authServerUrl)){
                        if(self.authServer[authServerUrl].hasOwnProperty('sessionSecret')){
                            sessionSecret = self.authServer[authServerUrl].sessionSecret;
                        }
                        if(self.authServer[authServerUrl].hasOwnProperty('serviceUid')){
                            serviceUid = self.authServer[authServerUrl].serviceUid;
                        }
                        if(self.authServer[authServerUrl].hasOwnProperty('key')){
                            authKey = self.authServer[authServerUrl].key;
                        }
                    }
                }
                else if(self.clientkey.hasOwnProperty(resMsg.auth.senderService) &&
                    self.clientkey[resMsg.auth.senderService].hasOwnProperty(resMsg.auth.senderId)){
                    if(self.clientkey[resMsg.auth.senderService][resMsg.auth.senderId].hasOwnProperty('sessionSecret')){
                        sessionSecret = self.clientkey[resMsg.auth.senderService][resMsg.auth.senderId].sessionSecret;
                    }
                    if(self.clientkey[resMsg.auth.senderService][resMsg.auth.senderId].hasOwnProperty('key')){
                        authKey = self.clientkey[resMsg.auth.senderService][resMsg.auth.senderId].key;
                    }
                }

                if(serviceUid === null && resMsg.auth.hasOwnProperty('senderId')){
                    serviceUid = resMsg.auth.senderId;
                }

                var signMethod = "sha256-hash";
                if(resMsg.auth.hasOwnProperty('signmethod')){
                    signMethod = resMsg.auth.signmethod;
                }
                if(signMethod === 'sha256-hash'){
                    var resDataStr = "";
                    if(serviceUid !== null){
                        resDataStr += serviceUid;
                    }
                    resDataStr += JSON.stringify(resMsg.data);
                    if(sessionSecret !== null){
                        resDataStr += sessionSecret;
                    }
                    var signature = crypto.createHash('sha256').update(resDataStr).digest('base64');
                    if(signature === resMsg.auth.signature){
                        return resMsg;
                    }
                }
                else if(signMethod === 'pkcs-signverify' && authKey !== null && serviceUid !== null){
                    var dataString = serviceUid + JSON.stringify(resMsg.data);
                    if(sessionSecret !== null){
                        dataString += sessionSecret;
                    }
                    if(authKey.verify(dataString,resMsg.auth.signature,'utf8','base64')){
                        return resMsg;
                    }
                }
            }
        }

        return null;
    },

    createServerRequest : function( targetService, targetServiceUid, method, params, reqid){
        var self = this;
        var signKey = self.key;
        if(signKey === null){
            return null;
        }

        var request = {
            data : {
                method  : method,
                params  : params
            },
            auth : {

            }
        };

        var sessionSecret = null;
        if(this.clientkey.hasOwnProperty(targetService) &&
            this.clientkey[targetService].hasOwnProperty(targetServiceUid)){
            var client = this.clientkey[targetService][targetServiceUid];
            if(client.hasOwnProperty('sessionSecret')){
                sessionSecret = client.sessionSecret;
            }
        }

        if(reqid !== undefined && reqid !== null){
            request.data.reqid = crypto.randomBytes(8).toString('base64');
        }

        request.auth.senderId = signKey.serviceUid;
        request.auth.senderService = signKey.serviceName;
        request.auth.signmethod = "pkcs-signverify";
        var dataString = signKey.serviceUid + JSON.stringify(request.data);
        if(sessionSecret !== null){
            dataString += sessionSecret;
        }
        request.auth.signature = signKey.sign(dataString,'base64','utf8');

        return request;
    },

    validateServerRequest : function(reqMsg, authServerUrl){
        var self = this;
        if( reqMsg !== undefined && reqMsg !== null &&
            reqMsg.hasOwnProperty('data') &&
            reqMsg.hasOwnProperty('auth')) {

            var sessionSecret = null;
            var authKey = null;
            var serviceUid = null;
            if(authServerUrl !== undefined && authServerUrl !== null){
                if(self.authServer.hasOwnProperty(authServerUrl)){
                    if(self.authServer[authServerUrl].hasOwnProperty('sessionSecret')){
                        sessionSecret = this.authServer[authServerUrl].sessionSecret;
                    }
                    if(self.authServer[authServerUrl].hasOwnProperty('key')){
                        authKey = this.authServer[authServerUrl].key;
                    }
                    if(self.authServer[authServerUrl].hasOwnProperty('serviceUid')){
                        serviceUid = this.authServer[authServerUrl].serviceUid;
                    }
                }
            }

            if(authKey !== null && serviceUid !== null){
                var dataString = "";
                if(serviceUid !== null){
                    dataString += serviceUid;
                }
                dataString += JSON.stringify(reqMsg.data);
                if(sessionSecret !== null){
                    dataString += sessionSecret;
                }
                if(authKey.verify(dataString,reqMsg.auth.signature,'utf8','base64')){
                    return reqMsg;
                }
            }
        }
        return null;
    },

    validateRequest : function(reqMsg, authServerUrl){
        var self = this;
        if( reqMsg !== undefined && reqMsg !== null &&
            reqMsg.hasOwnProperty('data') &&
            reqMsg.hasOwnProperty('auth'))
        {
            if(reqMsg.auth.hasOwnProperty('dataencryption')){
                if(reqMsg.auth.dataencryption === 'pkcs'){
                    var decryptedRequest = self.decryptMsg(reqMsg);
                    if(decryptedRequest !== null){
                        return self.validateRequest(decryptedRequest,authServerUrl);
                    }
                }
            }
            else if( reqMsg.data.hasOwnProperty('service') &&
                reqMsg.data.hasOwnProperty('method') ){

                var reqNonce = null;
                if(reqMsg.data.hasOwnProperty('nonce')){
                    reqNonce = reqMsg.data.nonce;
                }

                var sessionSecret = null;
                var nonce = null;
                var authKey = null;
                var serviceUid = null;
                if(authServerUrl !== undefined && authServerUrl !== null){
                    if(self.authServer.hasOwnProperty(authServerUrl)){
                        if(self.authServer[authServerUrl].hasOwnProperty('sessionSecret')){
                            sessionSecret = self.authServer[authServerUrl].sessionSecret;
                        }
                        if(reqNonce !== null && self.authServer[authServerUrl].hasOwnProperty('nonce')){
                            if(reqNonce > self.authServer[authServerUrl].nonce){
                                nonce = reqNonce;
                                self.authServer[authServerUrl].nonce = reqNonce;
                                console.log("nonce "+authServerUrl+" = "+ self.authServer[authServerUrl].nonce+" (validate "+reqMsg.data.method+")");
                            }
                        }
                        if(self.authServer[authServerUrl].hasOwnProperty('key')){
                            authKey = self.authServer[authServerUrl].key;
                        }
                        if(self.authServer[authServerUrl].hasOwnProperty('serviceUid')){
                            serviceUid = self.authServer[authServerUrl].serviceUid;
                        }
                    }
                }
                else if(self.clientkey.hasOwnProperty(reqMsg.auth.senderService) &&
                    self.clientkey[reqMsg.auth.senderService].hasOwnProperty(reqMsg.auth.senderId)){
                    if(self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].hasOwnProperty('sessionSecret')){
                        sessionSecret = self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].sessionSecret;
                    }
                    if(self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].hasOwnProperty('key')){
                        authKey = self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].key;
                    }
                    if(reqNonce !== null && self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].hasOwnProperty('nonce')){
                        if(reqNonce > self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].nonce){
                            nonce = reqNonce;
                            self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].nonce = reqNonce;
                            console.log("nonce "+reqMsg.auth.senderId+" = "+ self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].nonce+" (validate "+reqMsg.data.method+")");
                        }
                    }
                }

                if(serviceUid === null && reqMsg.auth.hasOwnProperty('senderId')){
                    serviceUid = reqMsg.auth.senderId;
                }

                if(authKey === null &&
                    reqMsg.auth.hasOwnProperty('senderId') &&
                    reqMsg.auth.hasOwnProperty('senderService') &&
                    self.clientkey.hasOwnProperty(reqMsg.auth.senderService) &&
                    self.clientkey[reqMsg.auth.senderService].hasOwnProperty(reqMsg.auth.senderId)){

                    if(self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].hasOwnProperty('key'))
                    {
                        authKey = self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].key;
                    }

                    if(self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].hasOwnProperty('sessionSecret')){
                        sessionSecret = self.clientkey[reqMsg.auth.senderService][reqMsg.auth.senderId].sessionSecret;
                    }
                }

                if(nonce === null && reqNonce !== 0){
                    return null;
                }

                var signMethod = "sha256-hash";
                if(reqMsg.auth.hasOwnProperty('signmethod')){
                    signMethod = reqMsg.auth.signmethod;
                }

                if(signMethod === 'sha256-hash'){
                    var reqDataStr = "";
                    if(serviceUid !== null){
                        reqDataStr += serviceUid;
                    }
                    reqDataStr += JSON.stringify(reqMsg.data);
                    if(sessionSecret !== null){
                        reqDataStr += sessionSecret;
                    }
                    var signature = crypto.createHash('sha256').update(reqDataStr).digest('base64');
                    if(reqMsg.auth.hasOwnProperty('signature') && signature === reqMsg.auth.signature){
                        return reqMsg;
                    }
                }
                else if(signMethod === 'pkcs-signverify' && authKey !== null && serviceUid !== null){
                    var dataString = "";
                    if(serviceUid !== null){
                        dataString += serviceUid;
                    }
                    dataString += JSON.stringify(reqMsg.data);
                    if(sessionSecret !== null){
                        dataString += sessionSecret;
                    }
                    if(authKey.verify(dataString,reqMsg.auth.signature,'utf8','base64')){
                        return reqMsg;
                    }
                }
            }
        }
        return null;
    },

    identify : function( serviceName, uuid, authServerUrl, done){
        this.key = this.genrsakey(serviceName, uuid);
        var self = this;
        var websocket = self.getConnector(authServerUrl);
        var requestParam = {
            publickey : this.key.exportKey('pkcs1-public-pem'),
            servicename : this.key.serviceName,
            serviceuid : this.key.serviceUid
        };
        var request = self.createRequest(authServerUrl, 'auth','identify',requestParam,null,"sha256-hash");
        websocket.emit('api',request, function(response){
            if(response.hasOwnProperty('error') && response.error === false){
                if( response.hasOwnProperty('data') &&
                    response.data.hasOwnProperty('reply') &&
                    response.data.reply.hasOwnProperty('publickey')){
                    var validResponse = self.validateResponse( response, authServerUrl );
                    if(validResponse !== null){
                        if(validResponse.data.reply.hasOwnProperty('servicename')){
                            self.authServer[authServerUrl].serviceName = validResponse.data.reply.servicename;
                        }
                        if(validResponse.data.reply.hasOwnProperty('serviceuid')){
                            self.authServer[authServerUrl].serviceUid = validResponse.data.reply.serviceuid;
                        }
                        var authKey = new NodeRSA({b:512});
                        var importSuccess = true;
                        try{
                            authKey.importKey(validResponse.data.reply.publickey,'pkcs1-public-pem');
                        }
                        catch(e){
                            importSuccess = false;
                        }

                        if(importSuccess){
                            self.authServer[authServerUrl].publicKey = validResponse.data.reply.publickey;
                            self.authServer[authServerUrl].key = authKey;
                            self.authServer[authServerUrl].httpHandler = function(req,res){
                                self.httpPostEventHandler(authServerUrl,req,res);
                            };
                            self.authServer[authServerUrl].websocketHandler = function(remoteSocket, req, resCallback){
                                self.websocketEventHandler(authServerUrl, req, remoteSocket, resCallback);
                            };
                            done(true,validResponse.data.reply.publickey);
                        }
                        else{
                            done(false,'auth server publickey import failed');
                        }
                    }
                    else{
                        done(false,'auth server response failed validation (identify)');
                    }
                }
                else{
                    done(false,'auth server response does not contain reply field');
                }
            }
            else{
                var errorMsg = 'auth server response error';
                if(response.hasOwnProperty('data') && response.data.hasOwnProperty('reason')){
                    errorMsg += ' : '+response.data.reason;
                }
                done(false, errorMsg );
            }
        });
    },

    initiateSession : function( authServerUrl, doneCallback){
        var signKey = this.key;
        if(signKey === null){
            doneCallback(false,'key pair not initialized, please identify first');
        }
        else{
            var self = this;
            if(self.authServer.hasOwnProperty(authServerUrl)){
                var requestParam = {
                    serviceName : signKey.serviceName,
                    serviceUid  : signKey.serviceUid
                };
                var request = self.createEncryptedRequest(authServerUrl, 'auth','initiate',requestParam);
                var websocket = self.getConnector(authServerUrl);
                websocket.emit('api',request, function(response) {
                    var validResponse = self.validateResponse(response,authServerUrl);
                    if(validResponse !== null){
                        if(validResponse.error === false){
                            if( validResponse.data.reply.hasOwnProperty('sessionSecret') &&
                                validResponse.data.reply.hasOwnProperty('startNonce') ){
                                self.authServer[authServerUrl].sessionSecret = validResponse.data.reply.sessionSecret;
                                self.authServer[authServerUrl].nonce = validResponse.data.reply.startNonce;
                                console.log("nonce "+authServerUrl+" = "+ self.authServer[authServerUrl].nonce+" (initiate)");

                                if(validResponse.data.reply.hasOwnProperty('services')){
                                    self.updateRemoteService(authServerUrl,validResponse.data.reply.services);
                                }
                                doneCallback(true,self.authServer[authServerUrl].services);
                            }
                            else{
                                doneCallback(false,'decrypt success, signature is valid, but server does not provide secret key');
                            }
                        }
                        else{
                            doneCallback(false,'server return error '+ validResponse.data.reason);
                        }
                    }
                    else{
                        doneCallback(false,'decrypt success, but signature is invalid');
                    }
                });
            }
            else{
                doneCallback(false,'auth server '+authServerUrl+' public key not found, please identify first');
            }
        }
    },

    callMethod : function(authServerUrl, serviceName, method, params, responseCallback){
        var signKey = this.key;
        if(signKey === null){
            responseCallback(false,'key pair not initialized, please identify first');
        }
        else{
            var self = this;
            if(self.authServer.hasOwnProperty(authServerUrl)){
                var reqParam = {
                    serviceName : serviceName,
                    methodName : method,
                    methodParam : params
                };
                var request = self.createRequest(authServerUrl, 'auth', 'callmethod', reqParam);
                var websocket = self.getConnector(authServerUrl);
                websocket.emit('api',request, function(response) {
                    var validResponse = self.validateResponse(response,authServerUrl);
                    if( validResponse !== null){
                        responseCallback(true, validResponse);
                    }
                    else{
                        responseCallback(false,'response signature invalid');
                    }
                });
            }
            else{
                responseCallback(false,'auth server '+authServerUrl+' public key not found, please identify first');
            }
        }
    },

    listServices : function(authServerUrl, responseCallback){
        var signKey = this.key;
        if(signKey === null){
            responseCallback(false,'key pair not initialized, please identify first');
        }
        else{
            var self = this;
            if(self.authServer.hasOwnProperty(authServerUrl)){
                var request = self.createRequest(authServerUrl, 'auth','listservices',{});
                var websocket = self.getConnector(authServerUrl);
                websocket.emit('api',request, function(response) {
                    var validResponse = self.validateResponse(response,authServerUrl);
                    if(validResponse !== null){
                        responseCallback(true, validResponse);
                    }
                    else{
                        responseCallback(false,'response signature invalid');
                    }
                });
            }
            else{
                responseCallback(false,'auth server '+authServerUrl+' public key not found, please identify first');
            }
        }
    },

    subscribeOnApiAdded : function(authServerUrl, serviceName, methodName, handler){
        var self = this;
        if(self.authServer.hasOwnProperty(authServerUrl)){
            if(!self.authServer[authServerUrl].hasOwnProperty('eventApiAdded')){
                self.authServer[authServerUrl].eventApiAdded = {};
            }
            if(!self.authServer[authServerUrl].eventApiAdded.hasOwnProperty(serviceName+"."+methodName)){
                self.authServer[authServerUrl].eventApiAdded[serviceName+"."+methodName] = [];
            }
            self.authServer[authServerUrl].eventApiAdded[serviceName+"."+methodName].push(handler);

            if(self.authServer[authServerUrl].services.api.hasOwnProperty(serviceName)){
                if(self.authServer[authServerUrl].services.api[serviceName].hasOwnProperty(methodName)){
                    handler(serviceName+"."+methodName);
                }
            }
        }
    },

    subscribeOnApiRemoved : function(authServerUrl, serviceName, methodName, handler){
        var self = this;
        if(self.authServer.hasOwnProperty(authServerUrl)){
            if(!self.authServer[authServerUrl].hasOwnProperty('eventApiRemoved')){
                self.authServer[authServerUrl].eventApiRemoved = {};
            }
            if(!self.authServer[authServerUrl].eventApiRemoved.hasOwnProperty(serviceName+"."+methodName)){
                self.authServer[authServerUrl].eventApiRemoved[serviceName+"."+methodName] = [];
            }
            self.authServer[authServerUrl].eventApiRemoved[serviceName+"."+methodName].push(handler);

            if(self.authServer[authServerUrl].services.api.hasOwnProperty(serviceName)){
                if(!self.authServer[authServerUrl].services.api[serviceName].hasOwnProperty(methodName)){
                    handler(serviceName+"."+methodName);
                }
            }
            else{
                handler(serviceName+"."+methodName);
            }
        }
    }
};


