module.exports = function (config, socket) {
  orm = {}
  orm.tablelist = {}
  orm.currentTable = 'default'
  orm.db = config.database
  orm.conditions = []
  orm.schema = {}
  orm.isSchemaless = {}
  rethinkdb.connect({host: config.host, port: config.port}, function (err, conn) {
    if (err) throw err;
    orm.conn = conn
    //create default database
    rethinkdb.dbCreate(config.database).run(conn, function (err, db) {
      var schemaPath = require("path").join(__dirname, "api/model-rethink");
      var models = {}
      require("fs").readdirSync(schemaPath).forEach(function (file) {
        var filename = file.replace('.js', '')
        models[filename] = require("./api/model-rethink/" + file);
        rethinkdb.db(config.database).tableCreate(filename).run(conn, function (err, callback) {
          orm.tablelist[filename] = filename
          orm.schema[filename] = models[filename]['attributes'];
          orm.isSchemaless[filename] = models[filename]['schemaless'] || false;
          //register change listener to rethink, get it from model
          if (models[filename].hasOwnProperty('onChange'))
            rethinkdb.db(config.database).table(filename).changes().run(conn, models[filename].onChange.bind(socket))

        })
      });
    });
  })


  orm.table = function (table) {
    if (this.tablelist.hasOwnProperty(table)) {
      this.currentTable = table
    } else
      throw new Error("Table not found in schema")

    return this
  }

  orm.insert = function (data, callback) {
    var _this = this
    this.validate(data, 'insert', function (valid) {
      if (valid)
        rethinkdb.db(_this.db).table(_this.currentTable).insert(data).run(_this.conn, callback)
      else
        throw new Error("one of field not valid")
    })
  }

  //TODO:validate for field type
  orm.validate = function (data, action, callback) {
    var schema = this.schema[this.currentTable]
    var fields = Object.getOwnPropertyNames(data)
    var valid = true
    //check if field according schema
    if (!this.isSchemaless[this.currentTable]) {
      fields.forEach(function (v, k, m) {
        if (!schema.hasOwnProperty(v)) {
          valid = false
        }
      })
    }

    //check schema for required field
    if (action == 'insert') {
      Object.getOwnPropertyNames(schema).forEach(function (v, k, m) {
        if (schema[v].hasOwnProperty('required')) {
          if (!data.hasOwnProperty(v) && schema[v].required) {
            valid = false
          }
        }
      })
    }


    callback(valid)
  }

  orm.get = function (id, callback) {
    var _this = this
    rethinkdb.db(_this.db).table(this.currentTable).get(id).run(this.conn, callback)
  }

  orm.update = function (filter, data, callback) {
    var _this = this
    this.validate(data, 'update', function (valid) {
      if (valid)
        rethinkdb.db(_this.db).table(_this.currentTable).filter(filter).update(data).run(_this.conn, callback)
      else
        throw new Error("one of field not valid")
    })
  }

  orm.delete = function (filter, callback) {
    rethinkdb.db(this.db).table(this.currentTable).filter(filter).delete().run(this.conn, callback)
  }

  orm.innerJoin = function (select, otherTable, foreignKey, callback) {
    var q = rethinkdb.db(this.db).table(this.currentTable).innerJoin(
        rethinkdb.db(this.db).table(otherTable),
        function (left, right) {
          return left(foreignKey).eq(right('id'))
        }
    )
    if (select != null)
      q.map(select)

    q.zip().run(this.conn, callback)
  }

  orm.select = function (select) {
    this.selectColumns = select
    return this
  }

  orm.where = function (condition) {
    this.conditions.push(condition)
    return this
  }

  orm.orderBy = function (orderby) {
    this.orderBy = orderby
    return this
  }

  orm.skip = function (skip) {
    this.skip = skip
    return this
  }

  orm.limit = function (limit) {
    this.limit = limit
    return this
  }

  orm.find = function (filter) {
    var _this = this;
    _this.where(filter)
    this.findAll = true
    return _this
  }

  orm.findOne = function (filter) {
    var _this = this
    _this.where(filter)
    this.findAll = false
    return _this
  };

  orm.get = function (id,callback) {
    rethinkdb.db(this.db).table(this.currentTable).get(id).run(this.conn, callback)
  };

  //invoking function in schema
  orm.invoke = function (functionName, param, cb) {
    this.schema[this.currentTable][functionName](param, cb)
  }

  orm.exec = function (callback) {
    var q = rethinkdb.db(this.db).table(this.currentTable)
    if (this.selectColumns != null || this.selectColumns != undefined) {
      q.pluck(this.selectColumns)
      delete this.selectColumns
      this.selectColumns = null
    }

    if (this.conditions.length > 0) {
      this.conditions.forEach(function (condition) {
        q = q.filter(condition)
      })
      this.conditions = []
    }

    if (this.findAll) {
      if (this.orderBy != null || this.orderBy != undefined) {
        q.orderBy(this.orderBy)
        delete this.orderBy
        this.orderBy = null
      }
      if (this.skip != null || this.skip != undefined) {
        q.skip(this.skip)
        delete this.skip
        this.skip = null
      }
      if (this.limit != null || this.limit != undefined) {
        q.limit(this.limit)
        delete this.limit
        this.limit = null
      }
    } else {
      q.limit(1)
    }
    q.run(this.conn, callback)
  }

  return orm;
}
