// Requiring our models
var db = require("../models");
// Our custom middleware for checking if a user is logged in
const requiresLogin = require('../config/middleware/requiresLogin.js');

module.exports = function (app) {
    // Create the base user via authentication flow
    // This ensures the uid of the authenticatd user is always present and accurate in user table
    // After the initial creation, it can be update with twilio for phone mumbers
    // and from admin for bunch of other stuff
    app.post("/api/createBaseUser", requiresLogin, (req, res) => {
        // console.log(`req.user.email ${req.user.email}`);
        // console.log(`req.user.uid ${req.user.uid}`);

        // If user does not exist, create it, or just return it.
        // Create it with all the info you have from auth service
        // like phone, email, full name etc.
        db.User.findOne({
                where: {
                    uid: req.user.uid
                }
            }).then(user => {
                // if no user entry exists for this uid, create on
                if (!user) {
                    // create one
                    db.User.create({
                        uid: req.user.uid,
                        email: req.user.email,
                        name: req.user.display_name
                    }).then(user => {
                        res.json(user);
                    });
                } else {
                    res.json(user);
                }
            })
            .catch(err => {
                // create one
                db.User.create(req.body).then(user => {
                    res.json(user);
                });
            });
    });



    // ------------------------------------------------------------------------------------------------
    // GET ALL USERS (not just one) Route for getting all users from user table
    // ------------------------------------------------------------------------------------------------
    app.get("/api/user", requiresLogin, (req, res) => {
        db.User.findAll({}).then(users => {
                res.json(users);
            })
            // TODO: Find proper way to throw error to the client
            .catch(err => {
                res.status(422).json(err.errors[0].message);
            });
    });

    // ------------------------------------------------------------------------------------------------
    // GET ONE USER (not just one) Route for getting all users from user table
    // ------------------------------------------------------------------------------------------------
    app.get("/api/user/:uid", requiresLogin, (req, res) => {
        // Get specific user via their uid
        db.User.findOne({
                where: {
                    uid: req.params.uid
                }
            }).then(user => {
                res.json(user);
            })
            // TODO: Find proper way to throw error to the client
            .catch(err => {
                res.status(422).json(err.errors[0].message);
            });
    });

    // ------------------------------------------------------------------------------------------------
    // GET currently authenticated user from user table
    // ------------------------------------------------------------------------------------------------
    app.get("/api/userCurrent", requiresLogin, (req, res) => {
        // Get specific user via their uid
        db.User.findOne({
                where: {
                    uid: req.user.uid
                }
            }).then(user => {
                res.json(user);
            })
            // TODO: Find proper way to throw error to the client
            .catch(err => {
                res.status(422).json(err.errors[0].message);
            });
    });

    // ================================================================================================================================
    // Update current user info with no photo
    // Minimal right now, wont update photo
    // ================================================================================================================================
    app.put("/api/user", requiresLogin, (req, res) => {
        let user = req.body;

        db.User.update(
            user, {
                where: {
                    uid: req.user.uid
                }
            }
        ).then((dbUser) => {
            res.json(dbUser);
        }).catch(err => {
            res.status(422).json(`Error caught in route app.put("/api/post ..." ${err.errors[0].message}`);
        });
    });



    // Deprecated : Login - dont use login on sever - thats a cleint thngs
    // app.post("/api/login", requiresLogin, (req, res) => {});

    // DEPRECATED - we w
    // Route for signing up a user.
    app.post("/api/signup", function (req, res) {
        db.User.create({
            email: req.body.email,
        }).then(function () {
            res.redirect(307, "/api/login");
        }).catch(function (err) {
            res.json(err);
            // res.status(422).json(err.errors[0].message);
        });
    });
};