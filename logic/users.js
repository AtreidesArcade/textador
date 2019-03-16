"use strict";

// Requiring our models
const db = require("../models");

// get the user by uid or id based on what is passes since we always need both
// i.e. uid is a primary key firebase/google authentication and id is primary key for mySQL user
// This is polymorphic - if the param is an INT, get by id (primary key)
// if the param is a string, get by uid
function getUser(arg1) {
    return new Promise((resolve, reject) => {
        // Check arguments to set where clause
        let whereClause = {};
        if (typeof arg1 === "string") {
            whereClause.uid = arg1;
        } else if (typeof arg1 === "number") {
            whereClause.id = arg1;
        } else {
            console.error(`argument: ${arg1} of type: ${(typeof (arg1))} is not invalid.`);
            return reject("getUser error: argument must be number or string");
        }

        db.User.findOne({
            where: whereClause
        }).then(user => {
            return resolve(user);
        }).catch(err => {
            return reject(err);
        });
    });

} // function

module.exports = {getUser};
