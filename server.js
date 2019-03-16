// Requiring necessary npm packages
const express = require('express');
const session = require('express-session');

// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 3000;
var db = require("./models");

// Creating express app and configuring middleware needed for authentication
var app = express();
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static("public"));
app.use(session({
    secret: "twilio_secret"
}));


// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-admin-routes.js")(app);
require("./routes/api-post-routes.js")(app);
require("./routes/api-transaction-routes.js")(app);
require("./routes/api-user-routes.js")(app);
require("./routes/api-twilio-routes.js")(app);
require("./routes/api-photos-routes")(app);


// Syncing our database and logging a message to the user upon success
db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
    });
});