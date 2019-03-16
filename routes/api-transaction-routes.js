const requiresLogin = require('../config/middleware/requiresLogin.js');

const Photos = require("../logic/photos");
const photos = new Photos();


module.exports = function (app) {

     // Route for getting all transactions from transaction table for the currently authenticated user
     app.get("/api/transactions", requiresLogin, (req, res) => {
        Transaction.getAll(req.user.uid)
            .then(TransactionData => {
                res.json(TransactionData);
            }).catch(err => {
                console.error(`error selecting with where ${err}`);
                // TODO: Find proper way to throw error to the client
                res.status(422).json(err.errors[0].message);
            });
    }); // Route

    // Route create transaction for the currently authenticated user
    app.post("/api/transactions", requiresLogin, (req, res) => {
        Transaction.createWithUid(req.user.uid, req.body)
            .then(TransactionData => {
                res.json(TransactionData);
            }).catch(err => {
                console.error(`error creating ${err}`);
                // TODO: Find proper way to throw error to the client
                res.status(422).json(err.errors[0].message);
            });
    }); // Route


};