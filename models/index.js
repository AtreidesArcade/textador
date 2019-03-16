"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var basename = path.basename(module.filename);
require("dotenv").config();   // to get env vars through config

var env = process.env.NODE_ENV || "development";
var config = require(__dirname + "/../config/config.json")[env];
var db = {};

if (config.use_env_variable) {
  console.log("Using ${config.use_env_variable");
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  // Get from env vars
  config.username = process.env[config.username];
  config.password = process.env[config.password];
  config.database = process.env[config.database];

  // If instance connection env var exists, use google cloud socket DB
  if (config.INSTANCE_CONNECTION_NAME) {
    console.log("Using GCP DB");
    config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    config.dialectOptions.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    console.log(`socketpath:${config.socketPath}`);
  } else {
    console.log("Using Local DB");
  }
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js");
  })
  .forEach(function (file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;