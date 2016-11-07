/**
 * Created by TES on 5/4/2016.
 */
module.exports = function (db, http, websocket, service, config) {
  var controllerPath = require("path").join(__dirname, "api/controller");
  var controllers = {};
  var publicMethod = {};
  var restrictedMethod = {};
  var tokenList = [];

  require("fs").readdirSync(controllerPath).forEach(function(file) {
    var filename = file.replace('.js','').replace('Controller','')
    controllers[file] = require("./api/controller/" + file);
    console.log(file);
    var publicMethodName = Object.getOwnPropertyNames(controllers[file].public);
    var RestrictedMethodName = Object.getOwnPropertyNames(controllers[file].restricted);

    publicMethodName.forEach(function(v,k,m){
      if(!publicMethod.hasOwnProperty(filename+'_'+v)){
        publicMethod[filename+'_'+v] = controllers[file].public[v]
      }
    })

    RestrictedMethodName.forEach(function(v,k,m){
      if(!RestrictedMethodName.hasOwnProperty(filename+'_'+v)){
        restrictedMethod[filename+'_'+v] = controllers[file].restricted[v];
      }
    })

    tokenList = tokenList.concat(controllers[file].tokenList)

  });


  return {public : publicMethod, restricted : restrictedMethod, tokenList:tokenList}
}
