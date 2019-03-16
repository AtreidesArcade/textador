// Requiring path to so we can use relative routes to our HTML files
var path = require("path");

// Our custom middleware for checking if a user is logged in
const requiresLogin = require('../config/middleware/requiresLogin.js');
module.exports = function(app) {

  app.get("/", function(req, res) {
      res.redirect("/index");
  });

  app.get("/login", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/login.html"));
  });

  app.get("/users", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/users.html"));
  });

  app.get("/posts", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/posts.html"));
  });

  app.get("/transactions", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/transactions.html"));
  });

  app.get("/pictures", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/pictures.html"));
  });

  app.get("/index", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });
  
  app.get("/members", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/members.html"));
  });
};