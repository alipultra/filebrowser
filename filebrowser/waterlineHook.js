/**
 * Created by TES on 5/4/2016.
 */
var waterline = require('waterline');

module.exports = function (databaseHandler, config) {

  var orm = new waterline()
  var collection = {}
  var modelPath = require("path").join(__dirname, "api/model-mongo");
  require("fs").readdirSync(modelPath).forEach(function(file) {
    collection[file] = require("./api/model-mongo/" + file);
    collection[file].identity = file.replace('.js','')
    collection[file].connection = 'local'
  });

  var key = Object.getOwnPropertyNames(collection)

  key.forEach(function(v,k,m){
    orm.loadCollection(waterline.Collection.extend(collection[v]));
  })

  orm.initialize(config, function(err, models) {
    if(err) throw err;

    databaseHandler.models =  models.collections;
    databaseHandler.connections = models.connections;
  });
}
